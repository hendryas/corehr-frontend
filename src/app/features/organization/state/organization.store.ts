import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiErrorResponse } from '../../../core/models/api.model';
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

const initialSummary: OrganizationSummary = {
  totalDepartments: 0,
  activeDepartments: 0,
  totalPositions: 0,
  activePositions: 0,
};

@Injectable()
export class OrganizationStore {
  private readonly organizationApi = inject(OrganizationApiService);

  readonly departmentFilters = signal<DepartmentListFilters>(initialDepartmentFilters);
  readonly positionFilters = signal<PositionListFilters>(initialPositionFilters);

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

  readonly isDepartmentSubmitting = signal(false);
  readonly departmentSubmitError = signal<string | null>(null);
  readonly departmentFormErrors = signal<DepartmentFormErrors>({});

  readonly isPositionSubmitting = signal(false);
  readonly positionSubmitError = signal<string | null>(null);
  readonly positionFormErrors = signal<PositionFormErrors>({});

  readonly deletingDepartmentId = signal<number | null>(null);
  readonly departmentDeleteError = signal<string | null>(null);
  readonly departmentSuccessMessage = signal<string | null>(null);

  readonly deletingPositionId = signal<number | null>(null);
  readonly positionDeleteError = signal<string | null>(null);
  readonly positionSuccessMessage = signal<string | null>(null);

  private departmentToastTimeout: ReturnType<typeof setTimeout> | null = null;
  private positionToastTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly departments = computed(() =>
    this.departmentRecords().map(mapDepartmentToListItem),
  );

  readonly positions = computed(() => this.positionRecords().map(mapPositionToListItem));

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

  readonly departmentDetail = computed(() => {
    const department = this.departmentDetailRecord();
    return department ? mapDepartmentToFormValue(department) : null;
  });

  readonly positionDetail = computed(() => {
    const position = this.positionDetailRecord();
    return position ? mapPositionToFormValue(position) : null;
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

  updateDepartmentSearch(search: string): void {
    this.departmentFilters.set({ search });
  }

  updatePositionSearch(search: string): void {
    this.positionFilters.update((state) => ({ ...state, search }));
  }

  updatePositionDepartmentFilter(departmentId: number | 'all'): void {
    this.positionFilters.update((state) => ({ ...state, departmentId }));
  }

  clearDepartmentDeleteError(): void {
    this.departmentDeleteError.set(null);
  }

  clearPositionDeleteError(): void {
    this.positionDeleteError.set(null);
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

  private clearDepartmentSubmitState(): void {
    this.departmentSubmitError.set(null);
    this.departmentFormErrors.set({});
  }

  private clearPositionSubmitState(): void {
    this.positionSubmitError.set(null);
    this.positionFormErrors.set({});
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
}
