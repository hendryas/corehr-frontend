import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/constants/api.constants';
import { ApiSuccessResponse, FileDownloadPayload } from '../../../core/models/api.model';
import { resolveDownloadFilename } from '../../../shared/utils/file.utils';
import {
  DepartmentOption,
  EmployeeApiRecord,
  EmployeeListQuery,
  EmployeesListResponse,
  EmployeeUpsertRequest,
  PositionOption,
} from '../domain/models/employee.model';
import { statusFilterToQuery } from '../domain/mappers/employee.mapper';

@Injectable()
export class EmployeesApiService {
  private readonly http = inject(HttpClient);

  getEmployees(query: EmployeeListQuery): Observable<EmployeesListResponse> {
    return this.http
      .get<ApiSuccessResponse<EmployeesListResponse>>(`${API_BASE_URL}/employees`, {
        params: this.buildEmployeeListParams(query),
      })
      .pipe(map((response) => response.data));
  }

  exportEmployeesCsv(query: EmployeeListQuery): Observable<FileDownloadPayload> {
    return this.http
      .get(`${API_BASE_URL}/employees/export/csv`, {
        params: this.buildEmployeeListParams(query),
        observe: 'response',
        responseType: 'blob',
      })
      .pipe(
        map((response) => ({
          blob: response.body ?? new Blob([], { type: 'text/csv;charset=utf-8' }),
          filename: resolveDownloadFilename(
            response.headers.get('content-disposition'),
            'employees.csv',
          ),
        })),
      );
  }

  getEmployeeById(id: number): Observable<EmployeeApiRecord> {
    return this.http
      .get<ApiSuccessResponse<EmployeeApiRecord>>(`${API_BASE_URL}/employees/${id}`)
      .pipe(map((response) => response.data));
  }

  getDepartments(): Observable<DepartmentOption[]> {
    return this.http
      .get<ApiSuccessResponse<DepartmentOption[]>>(`${API_BASE_URL}/departments`)
      .pipe(map((response) => response.data));
  }

  getPositions(): Observable<PositionOption[]> {
    return this.http
      .get<ApiSuccessResponse<PositionOption[]>>(`${API_BASE_URL}/positions`)
      .pipe(map((response) => response.data));
  }

  createEmployee(payload: EmployeeUpsertRequest): Observable<EmployeeApiRecord> {
    return this.http
      .post<ApiSuccessResponse<EmployeeApiRecord>>(`${API_BASE_URL}/employees`, payload)
      .pipe(map((response) => response.data));
  }

  updateEmployee(id: number, payload: EmployeeUpsertRequest): Observable<EmployeeApiRecord> {
    return this.http
      .put<ApiSuccessResponse<EmployeeApiRecord>>(`${API_BASE_URL}/employees/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  deleteEmployee(id: number): Observable<string> {
    return this.http
      .delete<ApiSuccessResponse<null>>(`${API_BASE_URL}/employees/${id}`)
      .pipe(map((response) => response.message));
  }

  private buildEmployeeListParams(query: EmployeeListQuery): HttpParams {
    let params = new HttpParams()
      .set('page', query.page)
      .set('limit', query.limit);

    const normalizedSearch = query.search.trim();
    const isActive = statusFilterToQuery(query.status);

    if (normalizedSearch) {
      params = params.set('search', normalizedSearch);
    }

    if (isActive !== null) {
      params = params.set('is_active', isActive ? '1' : '0');
    }

    return params;
  }
}
