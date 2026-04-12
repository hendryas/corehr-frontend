import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiErrorResponse } from '../../../core/models/api.model';
import { AuthSessionService } from '../../../core/services/auth-session.service';
import { downloadFile } from '../../../shared/utils/file.utils';
import { AttendanceApiService } from '../data-access/attendance-api.service';
import {
  getApiErrorMessage,
  mapAttendanceFormToRequest,
  mapAttendanceToDetail,
  mapAttendanceToListItem,
  mapValidationErrors,
} from '../domain/mappers/attendance.mapper';
import {
  AttendanceApiRecord,
  AttendanceDetail,
  AttendanceEmployeeOption,
  DailyAttendanceState,
  AttendanceFormErrors,
  AttendanceFormMode,
  AttendanceFormValue,
  AttendanceListItem,
  AttendanceListQuery,
  AttendancePagination,
  AttendanceStatus,
  AttendanceSummary,
} from '../domain/models/attendance.model';

const initialFilters: AttendanceListQuery = {
  search: '',
  status: 'all',
  attendanceDate: '',
  page: 1,
  limit: 10,
};

const initialPagination: AttendancePagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

const initialSummary: AttendanceSummary = {
  totalRecords: 0,
  presentToday: 0,
  sickToday: 0,
  absentToday: 0,
};

const todayAttendancePageSize = 20;

@Injectable()
export class AttendanceStore {
  private readonly attendanceApi = inject(AttendanceApiService);
  private readonly authSession = inject(AuthSessionService);

  readonly filters = signal<AttendanceListQuery>(initialFilters);
  private readonly attendanceRecords = signal<AttendanceApiRecord[]>([]);
  readonly pagination = signal<AttendancePagination>(initialPagination);
  readonly isListLoading = signal(false);
  readonly listError = signal<string | null>(null);

  readonly summary = signal<AttendanceSummary>(initialSummary);
  readonly isSummaryLoading = signal(false);
  readonly summaryError = signal<string | null>(null);

  private readonly todayAttendanceRecord = signal<AttendanceApiRecord | null>(null);
  private readonly todayAttendanceBlockedMessage = signal<string | null>(null);
  readonly isTodayAttendanceLoading = signal(false);
  readonly todayAttendanceError = signal<string | null>(null);
  readonly isTodayAttendanceSubmitting = signal(false);
  readonly todayAttendanceSubmitError = signal<string | null>(null);

  private readonly detailRecord = signal<AttendanceApiRecord | null>(null);
  readonly isDetailLoading = signal(false);
  readonly detailError = signal<string | null>(null);

  readonly employeeOptions = signal<AttendanceEmployeeOption[]>([]);
  readonly isReferenceLoading = signal(false);
  readonly referenceError = signal<string | null>(null);

  readonly isSubmitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly formErrors = signal<AttendanceFormErrors>({});

  readonly deletingAttendanceId = signal<number | null>(null);
  readonly deleteError = signal<string | null>(null);
  readonly deleteSuccessMessage = signal<string | null>(null);
  readonly isExportingCsv = signal(false);
  readonly exportError = signal<string | null>(null);

  private deleteToastTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly authenticatedUser = computed(() => this.authSession.authenticatedUser());
  readonly isAdmin = computed(() => this.authSession.authenticatedUser()?.role === 'admin_hr');
  readonly todayDate = computed(() => getTodayDateLocal());

  private readonly employeeLookup = computed(
    () => new Map(this.employeeOptions().map((employee) => [employee.id, employee] as const)),
  );

  readonly attendances = computed(() =>
    this.attendanceRecords().map((attendance) =>
      mapAttendanceToListItem(attendance, this.employeeLookup()),
    ),
  );

  readonly filteredAttendances = computed<AttendanceListItem[]>(() => {
    const term = this.filters().search.trim().toLowerCase();
    const attendances = this.attendances();

    if (!term) {
      return attendances;
    }

    return attendances.filter((attendance) =>
      [
        attendance.employeeCode,
        attendance.fullName,
        attendance.departmentName,
        attendance.positionName,
        attendance.notesLabel,
      ].some((value) => value.toLowerCase().includes(term)),
    );
  });

  readonly detail = computed<AttendanceDetail | null>(() => {
    const attendance = this.detailRecord();
    return attendance ? mapAttendanceToDetail(attendance, this.employeeLookup()) : null;
  });

  readonly todayAttendance = computed<AttendanceListItem | null>(() => {
    const attendance = this.todayAttendanceRecord();
    return attendance ? mapAttendanceToListItem(attendance, this.employeeLookup()) : null;
  });

  readonly todayAttendanceState = computed<DailyAttendanceState>(() => {
    const attendance = this.todayAttendanceRecord();
    const blockedMessage = this.todayAttendanceBlockedMessage();

    if (blockedMessage) {
      return {
        action: 'unavailable',
        title: 'Check in unavailable',
        description: blockedMessage,
        actionLabel: 'Check in unavailable',
      };
    }

    if (!attendance) {
      return {
        action: 'check-in',
        title: 'Ready to check in',
        description: 'No attendance record was found for today. Start your workday by checking in.',
        actionLabel: 'Check in',
      };
    }

    if (attendance.checkIn && !attendance.checkOut) {
      return {
        action: 'check-out',
        title: 'Ready to check out',
        description:
          'You already checked in today. Complete today attendance when you are ready to end the session.',
        actionLabel: 'Check out',
      };
    }

    if (attendance.checkOut) {
      return {
        action: 'completed',
        title: 'Attendance completed',
        description: 'Your attendance for today is complete. No further action is needed.',
        actionLabel: 'Attendance completed',
      };
    }

    return {
      action: 'unavailable',
      title: 'Attendance action unavailable',
      description:
        'Today attendance already exists with a non-working status. Please contact HR if this needs adjustment.',
      actionLabel: 'Attendance completed',
    };
  });

  readonly hasAttendances = computed(() => this.filteredAttendances().length > 0);
  readonly isEmpty = computed(
    () => !this.isListLoading() && !this.listError() && this.filteredAttendances().length === 0,
  );

  async loadAttendances(): Promise<void> {
    this.isListLoading.set(true);
    this.listError.set(null);

    try {
      if (this.isAdmin()) {
        void this.loadEmployeeOptions(false, false);
      }

      const response = await firstValueFrom(this.attendanceApi.getAttendances(this.filters()));

      this.attendanceRecords.set(response.items);
      this.pagination.set(response.pagination);
      this.summary.update((state) => ({
        ...state,
        totalRecords: response.pagination.total,
      }));

      const currentPage = this.filters().page;
      const lastPage = response.pagination.totalPages;

      if (lastPage > 0 && currentPage > lastPage) {
        this.filters.update((state) => ({ ...state, page: lastPage }));
        await this.loadAttendances();
      }
    } catch (error) {
      this.attendanceRecords.set([]);
      this.pagination.set({
        ...this.pagination(),
        total: 0,
        totalPages: 0,
      });
      this.summary.update((state) => ({ ...state, totalRecords: 0 }));
      this.listError.set(
        getApiErrorMessage(
          error,
          'Attendance information is unavailable right now. Please try again.',
        ),
      );
    } finally {
      this.isListLoading.set(false);
    }
  }

  async loadSummary(): Promise<void> {
    this.isSummaryLoading.set(true);
    this.summaryError.set(null);

    const today = new Date().toISOString().slice(0, 10);

    try {
      const [presentToday, sickToday, absentToday] = await Promise.all([
        this.loadStatusCount(today, 'present'),
        this.loadStatusCount(today, 'sick'),
        this.loadStatusCount(today, 'absent'),
      ]);

      this.summary.update((state) => ({
        ...state,
        presentToday,
        sickToday,
        absentToday,
      }));
    } catch (error) {
      this.summaryError.set(
        getApiErrorMessage(error, 'Today attendance summary could not be loaded.'),
      );
    } finally {
      this.isSummaryLoading.set(false);
    }
  }

  async loadAttendance(id: number): Promise<void> {
    this.isDetailLoading.set(true);
    this.detailError.set(null);
    this.detailRecord.set(null);

    try {
      if (this.isAdmin()) {
        void this.loadEmployeeOptions(false, false);
      }

      const attendance = await firstValueFrom(this.attendanceApi.getAttendanceById(id));
      this.detailRecord.set(attendance);
    } catch (error) {
      this.detailError.set(
        getApiErrorMessage(error, 'Attendance detail could not be loaded right now.'),
      );
    } finally {
      this.isDetailLoading.set(false);
    }
  }

  async loadTodayAttendance(): Promise<void> {
    const authenticatedUser = this.authenticatedUser();

    if (!authenticatedUser) {
      this.todayAttendanceRecord.set(null);
      this.todayAttendanceBlockedMessage.set(null);
      this.todayAttendanceError.set('Your session is unavailable. Please sign in again.');
      return;
    }

    this.isTodayAttendanceLoading.set(true);
    this.todayAttendanceBlockedMessage.set(null);
    this.todayAttendanceError.set(null);

    try {
      const response = await firstValueFrom(
        this.attendanceApi.getMyAttendances({
          search: '',
          status: 'all',
          attendanceDate: this.todayDate(),
          page: 1,
          limit: todayAttendancePageSize,
        }),
      );

      this.todayAttendanceRecord.set(
        pickLatestAttendanceForUser(response.items, authenticatedUser.id),
      );
    } catch (error) {
      this.todayAttendanceRecord.set(null);
      this.todayAttendanceError.set(
        getApiErrorMessage(error, 'Today attendance status could not be loaded right now.'),
      );
    } finally {
      this.isTodayAttendanceLoading.set(false);
    }
  }

  async loadEmployeeOptions(forceReload = false, showError = true): Promise<void> {
    if (!this.isAdmin()) {
      this.employeeOptions.set([]);
      return;
    }

    if (!forceReload && this.employeeOptions().length > 0) {
      return;
    }

    this.isReferenceLoading.set(true);

    if (showError) {
      this.referenceError.set(null);
    }

    try {
      const employees = await firstValueFrom(this.attendanceApi.getEmployeeOptions());
      this.employeeOptions.set(employees);
    } catch (error) {
      if (showError) {
        this.referenceError.set(
          getApiErrorMessage(error, 'Employee options could not be loaded.'),
        );
      }
    } finally {
      this.isReferenceLoading.set(false);
    }
  }

  async createAttendance(value: AttendanceFormValue): Promise<AttendanceDetail | null> {
    return this.submitAttendance('create', null, value);
  }

  async updateAttendance(id: number, value: AttendanceFormValue): Promise<AttendanceDetail | null> {
    return this.submitAttendance('edit', id, value);
  }

  async deleteAttendance(id: number): Promise<boolean> {
    this.deletingAttendanceId.set(id);
    this.deleteError.set(null);

    try {
      const apiMessage = await firstValueFrom(this.attendanceApi.deleteAttendance(id));
      await Promise.allSettled([this.loadAttendances(), this.loadSummary()]);
      this.showDeleteSuccessMessage(apiMessage);
      return true;
    } catch (error) {
      this.deleteError.set(getApiErrorMessage(error, 'Attendance entry could not be removed.'));
      return false;
    } finally {
      this.deletingAttendanceId.set(null);
    }
  }

  async exportAttendancesCsv(): Promise<boolean> {
    this.isExportingCsv.set(true);
    this.exportError.set(null);

    try {
      const download = await firstValueFrom(this.attendanceApi.exportAttendancesCsv(this.filters()));
      downloadFile(download);
      return true;
    } catch (error) {
      this.exportError.set(
        getApiErrorMessage(
          error,
          'Attendance CSV could not be exported right now. Please try again.',
        ),
      );
      return false;
    } finally {
      this.isExportingCsv.set(false);
    }
  }

  async submitTodayAttendanceAction(): Promise<boolean> {
    const authenticatedUser = this.authenticatedUser();

    if (!authenticatedUser) {
      this.todayAttendanceSubmitError.set('Your session is unavailable. Please sign in again.');
      return false;
    }

    const action = this.todayAttendanceState().action;

    if (action === 'completed' || action === 'unavailable') {
      return false;
    }

    this.isTodayAttendanceSubmitting.set(true);
    this.todayAttendanceBlockedMessage.set(null);
    this.todayAttendanceSubmitError.set(null);

    try {
      if (action === 'check-in') {
        await firstValueFrom(this.attendanceApi.checkIn());
      } else {
        await firstValueFrom(this.attendanceApi.checkOut());
      }

      await Promise.allSettled([
        this.loadTodayAttendance(),
        this.loadAttendances(),
        this.loadSummary(),
      ]);

      return true;
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, 'Today attendance action could not be completed.');
      this.todayAttendanceSubmitError.set(errorMessage);

      if (isApprovedLeaveCheckInConflict(errorMessage)) {
        this.todayAttendanceBlockedMessage.set(errorMessage);
      }

      return false;
    } finally {
      this.isTodayAttendanceSubmitting.set(false);
    }
  }

  updateSearch(search: string): void {
    this.filters.update((state) => ({
      ...state,
      search,
      page: 1,
    }));
  }

  updateStatus(status: AttendanceListQuery['status']): void {
    this.filters.update((state) => ({
      ...state,
      status,
      page: 1,
    }));
  }

  updateDate(attendanceDate: string): void {
    this.filters.update((state) => ({
      ...state,
      attendanceDate,
      page: 1,
    }));
  }

  updatePage(page: number): void {
    this.filters.update((state) => ({
      ...state,
      page,
    }));
  }

  clearSubmitState(): void {
    this.submitError.set(null);
    this.formErrors.set({});
  }

  clearTodayAttendanceSubmitError(): void {
    this.todayAttendanceSubmitError.set(null);
  }

  clearDeleteError(): void {
    this.deleteError.set(null);
  }

  clearExportError(): void {
    this.exportError.set(null);
  }

  clearDeleteSuccessMessage(): void {
    this.deleteSuccessMessage.set(null);

    if (this.deleteToastTimeout) {
      clearTimeout(this.deleteToastTimeout);
      this.deleteToastTimeout = null;
    }
  }

  private async submitAttendance(
    mode: AttendanceFormMode,
    id: number | null,
    value: AttendanceFormValue,
  ): Promise<AttendanceDetail | null> {
    this.isSubmitting.set(true);
    this.clearSubmitState();

    try {
      const payload = mapAttendanceFormToRequest(value);
      const attendance =
        mode === 'create'
          ? await firstValueFrom(this.attendanceApi.createAttendance(payload))
          : await firstValueFrom(this.attendanceApi.updateAttendance(Number(id), payload));

      await Promise.allSettled([this.loadAttendances(), this.loadSummary()]);

      return mapAttendanceToDetail(attendance, this.employeeLookup());
    } catch (error) {
      this.handleSubmitError(error);
      return null;
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private handleSubmitError(error: unknown): void {
    const submitError = getApiErrorMessage(error, 'Changes could not be saved.');
    this.submitError.set(submitError);

    if (error instanceof HttpErrorResponse) {
      const apiError = error.error as ApiErrorResponse | undefined;
      const fieldErrors = mapValidationErrors(apiError?.errors);

      if (isApprovedLeavePresentConflict(submitError)) {
        fieldErrors.status = [submitError];
        fieldErrors.attendanceDate = [submitError];
      }

      this.formErrors.set(fieldErrors);
    }
  }

  private async loadStatusCount(date: string, status: AttendanceStatus): Promise<number> {
    return firstValueFrom(this.attendanceApi.getAttendanceCount(date, status));
  }

  private showDeleteSuccessMessage(apiMessage: string): void {
    const message =
      apiMessage.trim() === 'Attendance deleted successfully'
        ? 'Attendance record berhasil dihapus dari daftar.'
        : apiMessage.trim() || 'Attendance record berhasil dihapus.';

    this.deleteSuccessMessage.set(message);

    if (this.deleteToastTimeout) {
      clearTimeout(this.deleteToastTimeout);
    }

    this.deleteToastTimeout = setTimeout(() => {
      this.deleteSuccessMessage.set(null);
      this.deleteToastTimeout = null;
    }, 4000);
  }
}

function pickLatestAttendanceForUser(
  attendances: AttendanceApiRecord[],
  userId: number,
): AttendanceApiRecord | null {
  const matchedAttendances = attendances.filter((attendance) => attendance.userId === userId);

  if (matchedAttendances.length === 0) {
    return null;
  }

  return matchedAttendances.reduce((latest, current) =>
    getAttendanceSortValue(current) > getAttendanceSortValue(latest) ? current : latest,
  );
}

function getAttendanceSortValue(attendance: AttendanceApiRecord): number {
  return new Date(attendance.updatedAt || attendance.createdAt).getTime();
}

function getTodayDateLocal(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function isApprovedLeaveCheckInConflict(message: string): boolean {
  return message.startsWith('Cannot check in while on approved leave (');
}

function isApprovedLeavePresentConflict(message: string): boolean {
  return message.startsWith('Cannot mark attendance as present during approved leave (');
}
