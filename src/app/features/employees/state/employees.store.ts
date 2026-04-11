import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiErrorResponse } from '../../../core/models/api.model';
import {
  getApiErrorMessage,
  mapEmployeeFormToRequest,
  mapEmployeeToDetail,
  mapEmployeeToListItem,
  mapValidationErrors,
} from '../domain/mappers/employee.mapper';
import {
  DepartmentOption,
  EmployeeApiRecord,
  EmployeeDetail,
  EmployeeFormErrors,
  EmployeeFormMode,
  EmployeeFormValue,
  EmployeeListItem,
  EmployeeListQuery,
  EmployeesPagination,
  PositionOption,
} from '../domain/models/employee.model';
import { EmployeesApiService } from '../data-access/employees-api.service';

const initialFilters: EmployeeListQuery = {
  search: '',
  status: 'all',
  page: 1,
  limit: 10,
};

const initialPagination: EmployeesPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

const employeeCodePrefix = 'EMP';
const employeeCodePattern = /^EMP(\d+)$/i;
const employeeCodePageSize = 100;

@Injectable()
export class EmployeesStore {
  private readonly employeesApi = inject(EmployeesApiService);

  readonly filters = signal<EmployeeListQuery>(initialFilters);
  readonly employees = signal<EmployeeListItem[]>([]);
  readonly pagination = signal<EmployeesPagination>(initialPagination);
  readonly isListLoading = signal(false);
  readonly listError = signal<string | null>(null);

  readonly detail = signal<EmployeeDetail | null>(null);
  readonly isDetailLoading = signal(false);
  readonly detailError = signal<string | null>(null);

  readonly departments = signal<DepartmentOption[]>([]);
  readonly positions = signal<PositionOption[]>([]);
  readonly isReferenceLoading = signal(false);
  readonly referenceError = signal<string | null>(null);
  readonly suggestedEmployeeCode = signal('');
  readonly isEmployeeCodeLoading = signal(false);
  readonly employeeCodeError = signal<string | null>(null);

  readonly isSubmitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly formErrors = signal<EmployeeFormErrors>({});

  readonly deletingEmployeeId = signal<number | null>(null);
  readonly deleteError = signal<string | null>(null);
  readonly deleteSuccessMessage = signal<string | null>(null);

  private deleteToastTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly hasEmployees = computed(() => this.employees().length > 0);
  readonly isEmpty = computed(
    () => !this.isListLoading() && !this.listError() && this.employees().length === 0,
  );

  async loadEmployees(): Promise<void> {
    this.isListLoading.set(true);
    this.listError.set(null);

    try {
      const response = await firstValueFrom(this.employeesApi.getEmployees(this.filters()));

      this.employees.set(response.items.map(mapEmployeeToListItem));
      this.pagination.set(response.pagination);

      const currentPage = this.filters().page;
      const lastPage = response.pagination.totalPages;

      if (lastPage > 0 && currentPage > lastPage) {
        this.filters.update((state) => ({ ...state, page: lastPage }));
        await this.loadEmployees();
      }
    } catch (error) {
      this.employees.set([]);
      this.pagination.set({
        ...this.pagination(),
        total: 0,
        totalPages: 0,
      });
      this.listError.set(
        getApiErrorMessage(error, 'Employee information is unavailable right now. Please try again.'),
      );
    } finally {
      this.isListLoading.set(false);
    }
  }

  async loadEmployee(id: number): Promise<void> {
    this.isDetailLoading.set(true);
    this.detailError.set(null);
    this.detail.set(null);

    try {
      const employee = await firstValueFrom(this.employeesApi.getEmployeeById(id));
      this.detail.set(mapEmployeeToDetail(employee));
    } catch (error) {
      this.detailError.set(
        getApiErrorMessage(error, 'Employee information could not be loaded right now.'),
      );
    } finally {
      this.isDetailLoading.set(false);
    }
  }

  async loadReferenceData(forceReload = false): Promise<void> {
    if (!forceReload && this.departments().length > 0 && this.positions().length > 0) {
      return;
    }

    this.isReferenceLoading.set(true);
    this.referenceError.set(null);

    try {
      const [departments, positions] = await Promise.all([
        firstValueFrom(this.employeesApi.getDepartments()),
        firstValueFrom(this.employeesApi.getPositions()),
      ]);

      this.departments.set(departments);
      this.positions.set(positions);
    } catch (error) {
      this.referenceError.set(
        getApiErrorMessage(error, 'Department and position options could not be loaded.'),
      );
    } finally {
      this.isReferenceLoading.set(false);
    }
  }

  async createEmployee(value: EmployeeFormValue): Promise<EmployeeDetail | null> {
    return this.submitEmployee('create', null, value);
  }

  async loadNextEmployeeCode(forceReload = false): Promise<void> {
    if (!forceReload && this.suggestedEmployeeCode()) {
      return;
    }

    this.isEmployeeCodeLoading.set(true);
    this.employeeCodeError.set(null);

    try {
      const firstPage = await firstValueFrom(
        this.employeesApi.getEmployees({
          search: '',
          status: 'all',
          page: 1,
          limit: employeeCodePageSize,
        }),
      );

      const employeeRecords = [...firstPage.items];
      const remainingPages = Array.from(
        { length: Math.max(firstPage.pagination.totalPages - 1, 0) },
        (_, index) => index + 2,
      );

      if (remainingPages.length > 0) {
        const pageResponses = await Promise.all(
          remainingPages.map((page) =>
            firstValueFrom(
              this.employeesApi.getEmployees({
                search: '',
                status: 'all',
                page,
                limit: employeeCodePageSize,
              }),
            ),
          ),
        );

        employeeRecords.push(...pageResponses.flatMap((response) => response.items));
      }

      this.suggestedEmployeeCode.set(buildNextEmployeeCode(employeeRecords));
    } catch (error) {
      this.suggestedEmployeeCode.set('');
      this.employeeCodeError.set(
        getApiErrorMessage(
          error,
          'Latest employee code could not be prepared automatically. Please verify it manually.',
        ),
      );
    } finally {
      this.isEmployeeCodeLoading.set(false);
    }
  }

  async updateEmployee(id: number, value: EmployeeFormValue): Promise<EmployeeDetail | null> {
    return this.submitEmployee('edit', id, value);
  }

  async deleteEmployee(id: number): Promise<boolean> {
    this.deletingEmployeeId.set(id);
    this.deleteError.set(null);

    try {
      const apiMessage = await firstValueFrom(this.employeesApi.deleteEmployee(id));
      await this.loadEmployees();
      this.showDeleteSuccessMessage(apiMessage);
      return true;
    } catch (error) {
      this.deleteError.set(
        getApiErrorMessage(error, 'Employee could not be removed.'),
      );
      return false;
    } finally {
      this.deletingEmployeeId.set(null);
    }
  }

  updateSearch(search: string): void {
    this.filters.update((state) => ({
      ...state,
      search,
      page: 1,
    }));
  }

  updateStatus(status: EmployeeListQuery['status']): void {
    this.filters.update((state) => ({
      ...state,
      status,
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

  clearDeleteError(): void {
    this.deleteError.set(null);
  }

  clearDeleteSuccessMessage(): void {
    this.deleteSuccessMessage.set(null);

    if (this.deleteToastTimeout) {
      clearTimeout(this.deleteToastTimeout);
      this.deleteToastTimeout = null;
    }
  }

  private async submitEmployee(
    mode: EmployeeFormMode,
    id: number | null,
    value: EmployeeFormValue,
  ): Promise<EmployeeDetail | null> {
    this.isSubmitting.set(true);
    this.clearSubmitState();

    try {
      const payload = mapEmployeeFormToRequest(value, mode);
      const employee =
        mode === 'create'
          ? await firstValueFrom(this.employeesApi.createEmployee(payload))
          : await firstValueFrom(this.employeesApi.updateEmployee(Number(id), payload));

      return mapEmployeeToDetail(employee);
    } catch (error) {
      this.handleSubmitError(error);
      return null;
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private handleSubmitError(error: unknown): void {
    this.submitError.set(
      getApiErrorMessage(error, 'Changes could not be saved.'),
    );

    if (error instanceof HttpErrorResponse) {
      const apiError = error.error as ApiErrorResponse | undefined;
      this.formErrors.set(mapValidationErrors(apiError?.errors));
    }
  }

  private showDeleteSuccessMessage(apiMessage: string): void {
    const message =
      apiMessage.trim() === 'Employee deleted successfully'
        ? 'Employee berhasil dihapus dari daftar.'
        : apiMessage.trim() || 'Employee berhasil dihapus.';

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

function buildNextEmployeeCode(employees: EmployeeApiRecord[]): string {
  const highestNumber = employees.reduce((currentHighest, employee) => {
    const match = employee.employeeCode.trim().match(employeeCodePattern);
    const employeeNumber = match ? Number(match[1]) : Number.NaN;

    return Number.isFinite(employeeNumber) && employeeNumber > currentHighest
      ? employeeNumber
      : currentHighest;
  }, 0);

  const nextNumber = highestNumber + 1;
  const width = Math.max(3, String(nextNumber).length);

  return `${employeeCodePrefix}${String(nextNumber).padStart(width, '0')}`;
}
