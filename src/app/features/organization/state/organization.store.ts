import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiErrorResponse } from '../../../core/models/api.model';
import { LeaveTypeApiService } from '../../leave/data-access/leave-type-api.service';
import {
  getLeaveTypeApiErrorMessage,
  mapLeaveTypeFormToRequest,
  mapLeaveTypeToFormValue,
  mapLeaveTypeToListItem,
  mapLeaveTypeValidationErrors,
} from '../../leave/domain/mappers/leave-type.mapper';
import {
  LeaveTypeFormErrors,
  LeaveTypeFormValue,
  LeaveTypeListItem,
  LeaveTypeRecord,
} from '../../leave/domain/models/leave-type.model';
import { OrganizationApiService } from '../data-access/organization-api.service';
import {
  getApiErrorMessage,
  mapDepartmentFormToRequest,
  mapDepartmentToListItem,
  mapDepartmentToFormValue,
  mapDepartmentValidationErrors,
  mapPositionFormToRequest,
  mapPositionToFormValue,
  mapPositionToListItem,
  mapPositionValidationErrors,
} from '../domain/mappers/organization.mapper';
import {
  DepartmentApiRecord,
  DepartmentFormErrors,
  DepartmentFormValue,
  LeaveTypeListFilters,
  DepartmentListFilters,
  DepartmentListItem,
  OrganizationSummary,
  PositionApiRecord,
  PositionFormErrors,
  PositionFormValue,
  PositionListFilters,
  PositionListItem,
} from '../domain/models/organization.model';

const initialDepartmentFilters: DepartmentListFilters = {
  search: '',
};

const initialPositionFilters: PositionListFilters = {
  search: '',
  departmentId: 'all',
};

const initialLeaveTypeFilters: LeaveTypeListFilters = {
  search: '',
};

const initialSummary: OrganizationSummary = {
  totalDepartments: 0,
  activeDepartments: 0,
  totalPositions: 0,
  activePositions: 0,
};

@Injectable()
export class OrganizationStore {
  private readonly organizationApi = inject(OrganizationApiService);
  private readonly leaveTypeApi = inject(LeaveTypeApiService);

  readonly departmentFilters = signal<DepartmentListFilters>(initialDepartmentFilters);
  readonly positionFilters = signal<PositionListFilters>(initialPositionFilters);
  readonly leaveTypeFilters = signal<LeaveTypeListFilters>(initialLeaveTypeFilters);

  private readonly departmentRecords = signal<DepartmentApiRecord[]>([]);
  readonly isDepartmentsLoading = signal(false);
  readonly departmentsError = signal<string | null>(null);

  private readonly positionRecords = signal<PositionApiRecord[]>([]);
  readonly isPositionsLoading = signal(false);
  readonly positionsError = signal<string | null>(null);

  private readonly departmentDetailRecord = signal<DepartmentApiRecord | null>(null);
  readonly isDepartmentDetailLoading = signal(false);
  readonly departmentDetailError = signal<string | null>(null);

  private readonly positionDetailRecord = signal<PositionApiRecord | null>(null);
  readonly isPositionDetailLoading = signal(false);
  readonly positionDetailError = signal<string | null>(null);

  private readonly leaveTypeRecords = signal<LeaveTypeRecord[]>([]);
  readonly isLeaveTypesLoading = signal(false);
  readonly leaveTypesError = signal<string | null>(null);

  private readonly leaveTypeDetailRecord = signal<LeaveTypeRecord | null>(null);
  readonly isLeaveTypeDetailLoading = signal(false);
  readonly leaveTypeDetailError = signal<string | null>(null);

  readonly isDepartmentSubmitting = signal(false);
  readonly departmentSubmitError = signal<string | null>(null);
  readonly departmentFormErrors = signal<DepartmentFormErrors>({});

  readonly isPositionSubmitting = signal(false);
  readonly positionSubmitError = signal<string | null>(null);
  readonly positionFormErrors = signal<PositionFormErrors>({});

  readonly isLeaveTypeSubmitting = signal(false);
  readonly leaveTypeSubmitError = signal<string | null>(null);
  readonly leaveTypeFormErrors = signal<LeaveTypeFormErrors>({});

  readonly deletingDepartmentId = signal<number | null>(null);
  readonly departmentDeleteError = signal<string | null>(null);
  readonly departmentSuccessMessage = signal<string | null>(null);

  readonly deletingPositionId = signal<number | null>(null);
  readonly positionDeleteError = signal<string | null>(null);
  readonly positionSuccessMessage = signal<string | null>(null);

  readonly deletingLeaveTypeId = signal<number | null>(null);
  readonly leaveTypeDeleteError = signal<string | null>(null);
  readonly leaveTypeSuccessMessage = signal<string | null>(null);

  private departmentToastTimeout: ReturnType<typeof setTimeout> | null = null;
  private positionToastTimeout: ReturnType<typeof setTimeout> | null = null;
  private leaveTypeToastTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly departments = computed(() =>
    this.departmentRecords().map(mapDepartmentToListItem),
  );

  readonly positions = computed(() => this.positionRecords().map(mapPositionToListItem));
  readonly leaveTypes = computed(() => this.leaveTypeRecords().map(mapLeaveTypeToListItem));

  readonly filteredDepartments = computed<DepartmentListItem[]>(() => {
    const term = this.departmentFilters().search.trim().toLowerCase();
    const departments = this.departments();

    if (!term) {
      return departments;
    }

    return departments.filter((department) =>
      [department.name, department.descriptionLabel].some((value) =>
        value.toLowerCase().includes(term),
      ),
    );
  });

  readonly filteredPositions = computed<PositionListItem[]>(() => {
    const term = this.positionFilters().search.trim().toLowerCase();
    const departmentId = this.positionFilters().departmentId;
    let positions = this.positions();

    if (departmentId !== 'all') {
      positions = positions.filter((position) => position.departmentId === departmentId);
    }

    if (!term) {
      return positions;
    }

    return positions.filter((position) =>
      [position.name, position.departmentName, position.descriptionLabel].some((value) =>
        value.toLowerCase().includes(term),
      ),
    );
  });

  readonly filteredLeaveTypes = computed<LeaveTypeListItem[]>(() => {
    const term = this.leaveTypeFilters().search.trim().toLowerCase();
    const leaveTypes = this.leaveTypes();

    if (!term) {
      return leaveTypes;
    }

    return leaveTypes.filter((leaveType) =>
      [leaveType.code, leaveType.name, leaveType.descriptionLabel].some((value) =>
        value.toLowerCase().includes(term),
      ),
    );
  });

  readonly summary = computed<OrganizationSummary>(() => ({
    totalDepartments: this.departmentRecords().length,
    activeDepartments: this.departmentRecords().length,
    totalPositions: this.positionRecords().length,
    activePositions: this.positionRecords().length,
  }));

  readonly isSummaryLoading = computed(
    () => this.isDepartmentsLoading() || this.isPositionsLoading(),
  );

  readonly hasDepartments = computed(() => this.filteredDepartments().length > 0);
  readonly hasPositions = computed(() => this.filteredPositions().length > 0);
  readonly hasLeaveTypes = computed(() => this.filteredLeaveTypes().length > 0);

  readonly isDepartmentsEmpty = computed(
    () =>
      !this.isDepartmentsLoading() &&
      !this.departmentsError() &&
      this.filteredDepartments().length === 0,
  );

  readonly isPositionsEmpty = computed(
    () =>
      !this.isPositionsLoading() &&
      !this.positionsError() &&
      this.filteredPositions().length === 0,
  );

  readonly isLeaveTypesEmpty = computed(
    () =>
      !this.isLeaveTypesLoading() &&
      !this.leaveTypesError() &&
      this.filteredLeaveTypes().length === 0,
  );

  readonly departmentDetail = computed(() => {
    const department = this.departmentDetailRecord();
    return department ? mapDepartmentToFormValue(department) : null;
  });

  readonly positionDetail = computed(() => {
    const position = this.positionDetailRecord();
    return position ? mapPositionToFormValue(position) : null;
  });

  readonly leaveTypeDetail = computed(() => {
    const leaveType = this.leaveTypeDetailRecord();
    return leaveType ? mapLeaveTypeToFormValue(leaveType) : null;
  });

  async loadDepartments(forceReload = false): Promise<void> {
    if (!forceReload && this.departmentRecords().length > 0) {
      return;
    }

    this.isDepartmentsLoading.set(true);
    this.departmentsError.set(null);

    try {
      const departments = await firstValueFrom(this.organizationApi.getDepartments());
      this.departmentRecords.set(departments);
    } catch (error) {
      this.departmentRecords.set([]);
      this.departmentsError.set(
        getApiErrorMessage(error, 'Department information is unavailable right now.'),
      );
    } finally {
      this.isDepartmentsLoading.set(false);
    }
  }

  async loadPositions(forceReload = false): Promise<void> {
    if (!forceReload && this.positionRecords().length > 0) {
      return;
    }

    this.isPositionsLoading.set(true);
    this.positionsError.set(null);

    try {
      const positions = await firstValueFrom(this.organizationApi.getPositions());
      this.positionRecords.set(positions);
    } catch (error) {
      this.positionRecords.set([]);
      this.positionsError.set(
        getApiErrorMessage(error, 'Position information is unavailable right now.'),
      );
    } finally {
      this.isPositionsLoading.set(false);
    }
  }

  async loadOrganizationOverview(forceReload = false): Promise<void> {
    await Promise.all([this.loadDepartments(forceReload), this.loadPositions(forceReload)]);
  }

  async loadLeaveTypes(forceReload = false): Promise<void> {
    if (!forceReload && this.leaveTypeRecords().length > 0) {
      return;
    }

    this.isLeaveTypesLoading.set(true);
    this.leaveTypesError.set(null);

    try {
      const leaveTypes = await firstValueFrom(this.leaveTypeApi.getLeaveTypes());
      this.leaveTypeRecords.set(leaveTypes);
    } catch (error) {
      this.leaveTypeRecords.set([]);
      this.leaveTypesError.set(
        getLeaveTypeApiErrorMessage(error, 'Leave types are unavailable right now.'),
      );
    } finally {
      this.isLeaveTypesLoading.set(false);
    }
  }

  async loadDepartment(id: number): Promise<void> {
    this.isDepartmentDetailLoading.set(true);
    this.departmentDetailError.set(null);
    this.departmentDetailRecord.set(null);

    try {
      const department =
        this.departmentRecords().find((item) => item.id === id) ??
        (await firstValueFrom(this.organizationApi.getDepartmentById(id)));
      this.departmentDetailRecord.set(department);
    } catch (error) {
      this.departmentDetailError.set(
        getApiErrorMessage(error, 'Department detail could not be loaded right now.'),
      );
    } finally {
      this.isDepartmentDetailLoading.set(false);
    }
  }

  async loadPosition(id: number): Promise<void> {
    this.isPositionDetailLoading.set(true);
    this.positionDetailError.set(null);
    this.positionDetailRecord.set(null);

    try {
      const position =
        this.positionRecords().find((item) => item.id === id) ??
        (await firstValueFrom(this.organizationApi.getPositionById(id)));
      this.positionDetailRecord.set(position);
    } catch (error) {
      this.positionDetailError.set(
        getApiErrorMessage(error, 'Position detail could not be loaded right now.'),
      );
    } finally {
      this.isPositionDetailLoading.set(false);
    }
  }

  async loadLeaveType(id: number): Promise<void> {
    this.isLeaveTypeDetailLoading.set(true);
    this.leaveTypeDetailError.set(null);
    this.leaveTypeDetailRecord.set(null);

    try {
      const leaveType =
        this.leaveTypeRecords().find((item) => item.id === id) ??
        (await firstValueFrom(this.leaveTypeApi.getLeaveTypeById(id)));
      this.leaveTypeDetailRecord.set(leaveType);
    } catch (error) {
      this.leaveTypeDetailError.set(
        getLeaveTypeApiErrorMessage(error, 'Leave type detail could not be loaded right now.'),
      );
    } finally {
      this.isLeaveTypeDetailLoading.set(false);
    }
  }

  async createDepartment(value: DepartmentFormValue): Promise<DepartmentApiRecord | null> {
    this.isDepartmentSubmitting.set(true);
    this.clearDepartmentSubmitState();

    try {
      const department = await firstValueFrom(
        this.organizationApi.createDepartment(mapDepartmentFormToRequest(value)),
      );

      await this.loadDepartments(true);
      return department;
    } catch (error) {
      this.handleDepartmentSubmitError(error);
      return null;
    } finally {
      this.isDepartmentSubmitting.set(false);
    }
  }

  async updateDepartment(
    id: number,
    value: DepartmentFormValue,
  ): Promise<DepartmentApiRecord | null> {
    this.isDepartmentSubmitting.set(true);
    this.clearDepartmentSubmitState();

    try {
      const department = await firstValueFrom(
        this.organizationApi.updateDepartment(id, mapDepartmentFormToRequest(value)),
      );

      await this.loadDepartments(true);
      this.departmentDetailRecord.set(department);
      return department;
    } catch (error) {
      this.handleDepartmentSubmitError(error);
      return null;
    } finally {
      this.isDepartmentSubmitting.set(false);
    }
  }

  async deleteDepartment(id: number): Promise<boolean> {
    this.deletingDepartmentId.set(id);
    this.departmentDeleteError.set(null);

    try {
      const apiMessage = await firstValueFrom(this.organizationApi.deleteDepartment(id));
      await Promise.all([this.loadDepartments(true), this.loadPositions(true)]);
      this.showDepartmentSuccessMessage(
        apiMessage.trim() || 'Department berhasil dihapus.',
      );
      return true;
    } catch (error) {
      this.departmentDeleteError.set(
        getApiErrorMessage(error, 'Department could not be removed.'),
      );
      return false;
    } finally {
      this.deletingDepartmentId.set(null);
    }
  }

  async createPosition(value: PositionFormValue): Promise<PositionApiRecord | null> {
    this.isPositionSubmitting.set(true);
    this.clearPositionSubmitState();

    try {
      const position = await firstValueFrom(
        this.organizationApi.createPosition(mapPositionFormToRequest(value)),
      );

      await this.loadPositions(true);
      return position;
    } catch (error) {
      this.handlePositionSubmitError(error);
      return null;
    } finally {
      this.isPositionSubmitting.set(false);
    }
  }

  async updatePosition(id: number, value: PositionFormValue): Promise<PositionApiRecord | null> {
    this.isPositionSubmitting.set(true);
    this.clearPositionSubmitState();

    try {
      const position = await firstValueFrom(
        this.organizationApi.updatePosition(id, mapPositionFormToRequest(value)),
      );

      await this.loadPositions(true);
      this.positionDetailRecord.set(position);
      return position;
    } catch (error) {
      this.handlePositionSubmitError(error);
      return null;
    } finally {
      this.isPositionSubmitting.set(false);
    }
  }

  async deletePosition(id: number): Promise<boolean> {
    this.deletingPositionId.set(id);
    this.positionDeleteError.set(null);

    try {
      const apiMessage = await firstValueFrom(this.organizationApi.deletePosition(id));
      await this.loadPositions(true);
      this.showPositionSuccessMessage(apiMessage.trim() || 'Position berhasil dihapus.');
      return true;
    } catch (error) {
      this.positionDeleteError.set(
        getApiErrorMessage(error, 'Position could not be removed.'),
      );
      return false;
    } finally {
      this.deletingPositionId.set(null);
    }
  }

  async createLeaveType(value: LeaveTypeFormValue): Promise<LeaveTypeRecord | null> {
    this.isLeaveTypeSubmitting.set(true);
    this.clearLeaveTypeSubmitState();

    try {
      const leaveType = await firstValueFrom(
        this.leaveTypeApi.createLeaveType(mapLeaveTypeFormToRequest(value)),
      );

      await this.loadLeaveTypes(true);
      return leaveType;
    } catch (error) {
      this.handleLeaveTypeSubmitError(error);
      return null;
    } finally {
      this.isLeaveTypeSubmitting.set(false);
    }
  }

  async updateLeaveType(id: number, value: LeaveTypeFormValue): Promise<LeaveTypeRecord | null> {
    this.isLeaveTypeSubmitting.set(true);
    this.clearLeaveTypeSubmitState();

    try {
      const leaveType = await firstValueFrom(
        this.leaveTypeApi.updateLeaveType(id, mapLeaveTypeFormToRequest(value)),
      );

      await this.loadLeaveTypes(true);
      this.leaveTypeDetailRecord.set(leaveType);
      return leaveType;
    } catch (error) {
      this.handleLeaveTypeSubmitError(error);
      return null;
    } finally {
      this.isLeaveTypeSubmitting.set(false);
    }
  }

  async deleteLeaveType(id: number): Promise<boolean> {
    this.deletingLeaveTypeId.set(id);
    this.leaveTypeDeleteError.set(null);

    try {
      const apiMessage = await firstValueFrom(this.leaveTypeApi.deleteLeaveType(id));
      await this.loadLeaveTypes(true);
      this.showLeaveTypeSuccessMessage(apiMessage.trim() || 'Leave type berhasil dihapus.');
      return true;
    } catch (error) {
      this.leaveTypeDeleteError.set(
        getLeaveTypeApiErrorMessage(error, 'Leave type could not be removed.'),
      );
      return false;
    } finally {
      this.deletingLeaveTypeId.set(null);
    }
  }

  updateDepartmentSearch(search: string): void {
    this.departmentFilters.set({ search });
  }

  updatePositionSearch(search: string): void {
    this.positionFilters.update((state) => ({ ...state, search }));
  }

  updatePositionDepartmentFilter(departmentId: number | 'all'): void {
    this.positionFilters.update((state) => ({ ...state, departmentId }));
  }

  updateLeaveTypeSearch(search: string): void {
    this.leaveTypeFilters.set({ search });
  }

  clearDepartmentDeleteError(): void {
    this.departmentDeleteError.set(null);
  }

  clearPositionDeleteError(): void {
    this.positionDeleteError.set(null);
  }

  clearLeaveTypeDeleteError(): void {
    this.leaveTypeDeleteError.set(null);
  }

  clearDepartmentSuccessMessage(): void {
    this.departmentSuccessMessage.set(null);

    if (this.departmentToastTimeout) {
      clearTimeout(this.departmentToastTimeout);
      this.departmentToastTimeout = null;
    }
  }

  clearPositionSuccessMessage(): void {
    this.positionSuccessMessage.set(null);

    if (this.positionToastTimeout) {
      clearTimeout(this.positionToastTimeout);
      this.positionToastTimeout = null;
    }
  }

  clearLeaveTypeSuccessMessage(): void {
    this.leaveTypeSuccessMessage.set(null);

    if (this.leaveTypeToastTimeout) {
      clearTimeout(this.leaveTypeToastTimeout);
      this.leaveTypeToastTimeout = null;
    }
  }

  private clearDepartmentSubmitState(): void {
    this.departmentSubmitError.set(null);
    this.departmentFormErrors.set({});
  }

  private clearPositionSubmitState(): void {
    this.positionSubmitError.set(null);
    this.positionFormErrors.set({});
  }

  private clearLeaveTypeSubmitState(): void {
    this.leaveTypeSubmitError.set(null);
    this.leaveTypeFormErrors.set({});
  }

  private handleDepartmentSubmitError(error: unknown): void {
    this.departmentSubmitError.set(getApiErrorMessage(error, 'Changes could not be saved.'));

    if (error instanceof HttpErrorResponse) {
      const apiError = error.error as ApiErrorResponse | undefined;
      this.departmentFormErrors.set(mapDepartmentValidationErrors(apiError?.errors));
    }
  }

  private handlePositionSubmitError(error: unknown): void {
    this.positionSubmitError.set(getApiErrorMessage(error, 'Changes could not be saved.'));

    if (error instanceof HttpErrorResponse) {
      const apiError = error.error as ApiErrorResponse | undefined;
      this.positionFormErrors.set(mapPositionValidationErrors(apiError?.errors));
    }
  }

  private handleLeaveTypeSubmitError(error: unknown): void {
    this.leaveTypeSubmitError.set(
      getLeaveTypeApiErrorMessage(error, 'Changes could not be saved.'),
    );

    if (error instanceof HttpErrorResponse) {
      const apiError = error.error as ApiErrorResponse | undefined;
      this.leaveTypeFormErrors.set(mapLeaveTypeValidationErrors(apiError?.errors));
    }
  }

  private showDepartmentSuccessMessage(message: string): void {
    this.departmentSuccessMessage.set(message);

    if (this.departmentToastTimeout) {
      clearTimeout(this.departmentToastTimeout);
    }

    this.departmentToastTimeout = setTimeout(() => {
      this.departmentSuccessMessage.set(null);
      this.departmentToastTimeout = null;
    }, 4000);
  }

  private showPositionSuccessMessage(message: string): void {
    this.positionSuccessMessage.set(message);

    if (this.positionToastTimeout) {
      clearTimeout(this.positionToastTimeout);
    }

    this.positionToastTimeout = setTimeout(() => {
      this.positionSuccessMessage.set(null);
      this.positionToastTimeout = null;
    }, 4000);
  }

  private showLeaveTypeSuccessMessage(message: string): void {
    this.leaveTypeSuccessMessage.set(message);

    if (this.leaveTypeToastTimeout) {
      clearTimeout(this.leaveTypeToastTimeout);
    }

    this.leaveTypeToastTimeout = setTimeout(() => {
      this.leaveTypeSuccessMessage.set(null);
      this.leaveTypeToastTimeout = null;
    }, 4000);
  }
}
