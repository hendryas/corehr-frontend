import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/constants/api.constants';
import { ApiSuccessResponse } from '../../../core/models/api.model';
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

    return this.http
      .get<ApiSuccessResponse<EmployeesListResponse>>(`${API_BASE_URL}/employees`, { params })
      .pipe(map((response) => response.data));
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
}
