import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/constants/api.constants';
import { ApiSuccessResponse } from '../../../core/models/api.model';
import {
  DepartmentApiRecord,
  DepartmentUpsertRequest,
  PositionApiRecord,
  PositionUpsertRequest,
} from '../domain/models/organization.model';

@Injectable()
export class OrganizationApiService {
  private readonly http = inject(HttpClient);

  getDepartments(): Observable<DepartmentApiRecord[]> {
    return this.http
      .get<ApiSuccessResponse<DepartmentApiRecord[]>>(`${API_BASE_URL}/departments`)
      .pipe(map((response) => response.data));
  }

  getDepartmentById(id: number): Observable<DepartmentApiRecord> {
    return this.http
      .get<ApiSuccessResponse<DepartmentApiRecord>>(`${API_BASE_URL}/departments/${id}`)
      .pipe(map((response) => response.data));
  }

  createDepartment(payload: DepartmentUpsertRequest): Observable<DepartmentApiRecord> {
    return this.http
      .post<ApiSuccessResponse<DepartmentApiRecord>>(`${API_BASE_URL}/departments`, payload)
      .pipe(map((response) => response.data));
  }

  updateDepartment(id: number, payload: DepartmentUpsertRequest): Observable<DepartmentApiRecord> {
    return this.http
      .put<ApiSuccessResponse<DepartmentApiRecord>>(`${API_BASE_URL}/departments/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  deleteDepartment(id: number): Observable<string> {
    return this.http
      .delete<ApiSuccessResponse<null>>(`${API_BASE_URL}/departments/${id}`)
      .pipe(map((response) => response.message));
  }

  getPositions(): Observable<PositionApiRecord[]> {
    return this.http
      .get<ApiSuccessResponse<PositionApiRecord[]>>(`${API_BASE_URL}/positions`)
      .pipe(map((response) => response.data));
  }

  getPositionById(id: number): Observable<PositionApiRecord> {
    return this.http
      .get<ApiSuccessResponse<PositionApiRecord>>(`${API_BASE_URL}/positions/${id}`)
      .pipe(map((response) => response.data));
  }

  createPosition(payload: PositionUpsertRequest): Observable<PositionApiRecord> {
    return this.http
      .post<ApiSuccessResponse<PositionApiRecord>>(`${API_BASE_URL}/positions`, payload)
      .pipe(map((response) => response.data));
  }

  updatePosition(id: number, payload: PositionUpsertRequest): Observable<PositionApiRecord> {
    return this.http
      .put<ApiSuccessResponse<PositionApiRecord>>(`${API_BASE_URL}/positions/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  deletePosition(id: number): Observable<string> {
    return this.http
      .delete<ApiSuccessResponse<null>>(`${API_BASE_URL}/positions/${id}`)
      .pipe(map((response) => response.message));
  }
}
