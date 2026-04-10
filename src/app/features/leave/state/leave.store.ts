import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiErrorResponse } from '../../../core/models/api.model';
import { AuthSessionService } from '../../../core/services/auth-session.service';
import { LeaveApiService } from '../data-access/leave-api.service';
import {
  getApiErrorMessage,
  mapAuthenticatedUserToLeaveOption,
  mapLeaveFormToRequest,
  mapLeaveToDetail,
  mapLeaveToListItem,
  mapValidationErrors,
} from '../domain/mappers/leave.mapper';
import {
  LeaveActionType,
  LeaveApiRecord,
  LeaveDetail,
  LeaveEmployeeOption,
  LeaveFormErrors,
  LeaveFormMode,
  LeaveFormValue,
  LeaveListItem,
  LeaveListQuery,
  LeavePagination,
  LeaveRequestStatus,
  LeaveSummary,
} from '../domain/models/leave.model';

const initialFilters: LeaveListQuery = {
  search: '',
  status: 'all',
  leaveType: '',
  startDate: '',
  endDate: '',
  page: 1,
  limit: 10,
};

const initialPagination: LeavePagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

const initialSummary: LeaveSummary = {
  totalRequests: 0,
  pendingRequests: 0,
  approvedRequests: 0,
  rejectedRequests: 0,
};

@Injectable()
export class LeaveStore {
  private readonly leaveApi = inject(LeaveApiService);
  private readonly authSession = inject(AuthSessionService);

  readonly filters = signal<LeaveListQuery>(initialFilters);
  private readonly leaveRecords = signal<LeaveApiRecord[]>([]);
  readonly pagination = signal<LeavePagination>(initialPagination);
  readonly isListLoading = signal(false);
  readonly listError = signal<string | null>(null);

  readonly summary = signal<LeaveSummary>(initialSummary);
  readonly isSummaryLoading = signal(false);
  readonly summaryError = signal<string | null>(null);

  private readonly detailRecord = signal<LeaveApiRecord | null>(null);
  readonly isDetailLoading = signal(false);
  readonly detailError = signal<string | null>(null);

  readonly employeeOptions = signal<LeaveEmployeeOption[]>([]);
  readonly isReferenceLoading = signal(false);
  readonly referenceError = signal<string | null>(null);

  readonly isSubmitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly formErrors = signal<LeaveFormErrors>({});

  readonly processingLeaveId = signal<number | null>(null);
  readonly processingAction = signal<LeaveActionType>(null);
  readonly actionError = signal<string | null>(null);
  readonly actionSuccessMessage = signal<string | null>(null);

  private actionToastTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly authenticatedUser = computed(() => this.authSession.authenticatedUser());
  readonly isAdmin = computed(() => this.authenticatedUser()?.role === 'admin_hr');

  private readonly employeeLookup = computed(
    () => new Map(this.employeeOptions().map((employee) => [employee.id, employee] as const)),
  );

  readonly leaves = computed(() =>
    this.leaveRecords().map((leave) => mapLeaveToListItem(leave, this.employeeLookup())),
  );

  readonly filteredLeaves = computed<LeaveListItem[]>(() => {
    const term = this.filters().search.trim().toLowerCase();
    const leaves = this.leaves();

    if (!term) {
      return leaves;
    }

    return leaves.filter((leave) =>
      [
        leave.employeeCode,
        leave.fullName,
        leave.departmentName,
        leave.leaveType,
        leave.reasonLabel,
      ].some((value) => value.toLowerCase().includes(term)),
    );
  });

  readonly detail = computed<LeaveDetail | null>(() => {
    const leave = this.detailRecord();
    return leave ? mapLeaveToDetail(leave, this.employeeLookup()) : null;
  });

  readonly availableLeaveTypes = computed(() =>
    Array.from(
      new Set(
        this.leaveRecords()
          .map((leave) => leave.leaveType.trim())
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b)),
  );

  readonly hasLeaves = computed(() => this.filteredLeaves().length > 0);
  readonly isEmpty = computed(
    () => !this.isListLoading() && !this.listError() && this.filteredLeaves().length === 0,
  );

  async loadLeaves(): Promise<void> {
    this.isListLoading.set(true);
    this.listError.set(null);

    try {
      void this.loadEmployeeOptions(false, false);

      const response = await firstValueFrom(this.leaveApi.getLeaves(this.filters()));

      this.leaveRecords.set(response.items);
      this.pagination.set(response.pagination);
      this.summary.update((state) => ({
        ...state,
        totalRequests: response.pagination.total,
      }));

      const currentPage = this.filters().page;
      const lastPage = response.pagination.totalPages;

      if (lastPage > 0 && currentPage > lastPage) {
        this.filters.update((state) => ({ ...state, page: lastPage }));
        await this.loadLeaves();
      }
    } catch (error) {
      this.leaveRecords.set([]);
      this.pagination.set({
        ...this.pagination(),
        total: 0,
        totalPages: 0,
      });
      this.summary.update((state) => ({ ...state, totalRequests: 0 }));
      this.listError.set(
        getApiErrorMessage(error, 'Leave information is unavailable right now. Please try again.'),
      );
    } finally {
      this.isListLoading.set(false);
    }
  }

  async loadSummary(): Promise<void> {
    this.isSummaryLoading.set(true);
    this.summaryError.set(null);

    try {
      const [pendingRequests, approvedRequests, rejectedRequests] = await Promise.all([
        this.loadStatusCount('pending'),
        this.loadStatusCount('approved'),
        this.loadStatusCount('rejected'),
      ]);

      this.summary.update((state) => ({
        ...state,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
      }));
    } catch (error) {
      this.summaryError.set(
        getApiErrorMessage(error, 'Leave request summary could not be loaded.'),
      );
    } finally {
      this.isSummaryLoading.set(false);
    }
  }

  async loadLeave(id: number): Promise<void> {
    this.isDetailLoading.set(true);
    this.detailError.set(null);
    this.detailRecord.set(null);

    try {
      void this.loadEmployeeOptions(false, false);

      const leave = await firstValueFrom(this.leaveApi.getLeaveById(id));
      this.detailRecord.set(leave);
    } catch (error) {
      this.detailError.set(
        getApiErrorMessage(error, 'Leave request detail could not be loaded right now.'),
      );
    } finally {
      this.isDetailLoading.set(false);
    }
  }

  async loadEmployeeOptions(forceReload = false, showError = true): Promise<void> {
    if (!forceReload && this.employeeOptions().length > 0) {
      return;
    }

    const authenticatedUser = this.authenticatedUser();

    if (!authenticatedUser) {
      this.employeeOptions.set([]);
      return;
    }

    if (!this.isAdmin()) {
      this.employeeOptions.set([mapAuthenticatedUserToLeaveOption(authenticatedUser)]);
      return;
    }

    this.isReferenceLoading.set(true);

    if (showError) {
      this.referenceError.set(null);
    }

    try {
      const employees = await firstValueFrom(this.leaveApi.getEmployeeOptions());
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

  async createLeave(value: LeaveFormValue): Promise<LeaveDetail | null> {
    return this.submitLeave('create', null, value);
  }

  async updateLeave(id: number, value: LeaveFormValue): Promise<LeaveDetail | null> {
    return this.submitLeave('edit', id, value);
  }

  async deleteLeave(id: number): Promise<boolean> {
    return this.runAction(id, 'delete', async () => {
      const apiMessage = await firstValueFrom(this.leaveApi.deleteLeave(id));
      await Promise.allSettled([this.loadLeaves(), this.loadSummary()]);
      this.showActionSuccessMessage(
        apiMessage,
        'Leave request berhasil dihapus dari daftar.',
      );
    });
  }

  async approveLeave(id: number): Promise<boolean> {
    return this.runAction(id, 'approve', async () => {
      const leave = await firstValueFrom(this.leaveApi.approveLeave(id));
      this.detailRecord.set(leave);
      await Promise.allSettled([this.loadLeaves(), this.loadSummary()]);
      this.showActionSuccessMessage(
        'Leave request approved successfully',
        'Leave request berhasil disetujui.',
      );
    });
  }

  async rejectLeave(id: number, rejectionReason: string): Promise<boolean> {
    return this.runAction(id, 'reject', async () => {
      const leave = await firstValueFrom(
        this.leaveApi.rejectLeave(id, {
          rejection_reason: rejectionReason.trim(),
        }),
      );
      this.detailRecord.set(leave);
      await Promise.allSettled([this.loadLeaves(), this.loadSummary()]);
      this.showActionSuccessMessage(
        'Leave request rejected successfully',
        'Leave request berhasil ditolak.',
      );
    });
  }

  updateSearch(search: string): void {
    this.filters.update((state) => ({
      ...state,
      search,
      page: 1,
    }));
  }

  updateStatus(status: LeaveListQuery['status']): void {
    this.filters.update((state) => ({
      ...state,
      status,
      page: 1,
    }));
  }

  updateLeaveType(leaveType: string): void {
    this.filters.update((state) => ({
      ...state,
      leaveType,
      page: 1,
    }));
  }

  updateStartDate(startDate: string): void {
    this.filters.update((state) => ({
      ...state,
      startDate,
      page: 1,
    }));
  }

  updateEndDate(endDate: string): void {
    this.filters.update((state) => ({
      ...state,
      endDate,
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

  clearActionError(): void {
    this.actionError.set(null);
  }

  clearActionSuccessMessage(): void {
    this.actionSuccessMessage.set(null);

    if (this.actionToastTimeout) {
      clearTimeout(this.actionToastTimeout);
      this.actionToastTimeout = null;
    }
  }

  private async submitLeave(
    mode: LeaveFormMode,
    id: number | null,
    value: LeaveFormValue,
  ): Promise<LeaveDetail | null> {
    this.isSubmitting.set(true);
    this.clearSubmitState();

    try {
      const payload = mapLeaveFormToRequest(value, this.isAdmin());
      const leave =
        mode === 'create'
          ? await firstValueFrom(this.leaveApi.createLeave(payload))
          : await firstValueFrom(this.leaveApi.updateLeave(Number(id), payload));

      await Promise.allSettled([this.loadLeaves(), this.loadSummary()]);

      return mapLeaveToDetail(leave, this.employeeLookup());
    } catch (error) {
      this.handleSubmitError(error);
      return null;
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private handleSubmitError(error: unknown): void {
    this.submitError.set(getApiErrorMessage(error, 'Changes could not be saved.'));

    if (error instanceof HttpErrorResponse) {
      const apiError = error.error as ApiErrorResponse | undefined;
      this.formErrors.set(mapValidationErrors(apiError?.errors));
    }
  }

  private async runAction(
    id: number,
    action: Exclude<LeaveActionType, null>,
    task: () => Promise<void>,
  ): Promise<boolean> {
    this.processingLeaveId.set(id);
    this.processingAction.set(action);
    this.actionError.set(null);

    try {
      await task();
      return true;
    } catch (error) {
      const fallback =
        action === 'approve'
          ? 'Leave request could not be approved.'
          : action === 'reject'
            ? 'Leave request could not be rejected.'
            : 'Leave request could not be removed.';
      this.actionError.set(getApiErrorMessage(error, fallback));
      return false;
    } finally {
      this.processingLeaveId.set(null);
      this.processingAction.set(null);
    }
  }

  private async loadStatusCount(status: LeaveRequestStatus): Promise<number> {
    return firstValueFrom(this.leaveApi.getLeaveCount(status));
  }

  private showActionSuccessMessage(apiMessage: string, defaultMessage: string): void {
    this.actionSuccessMessage.set(apiMessage.trim() || defaultMessage);

    if (this.actionToastTimeout) {
      clearTimeout(this.actionToastTimeout);
    }

    this.actionToastTimeout = setTimeout(() => {
      this.actionSuccessMessage.set(null);
      this.actionToastTimeout = null;
    }, 4000);
  }
}
