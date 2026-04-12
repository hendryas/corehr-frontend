import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/constants/api.constants';
import { ApiSuccessResponse } from '../../../core/models/api.model';
import {
  LeaveTypeRecord,
  LeaveTypeUpsertRequest,
} from '../domain/models/leave-type.model';

@Injectable()
export class LeaveTypeApiService {
  private readonly http = inject(HttpClient);

  getLeaveTypes(): Observable<LeaveTypeRecord[]> {
    return this.http
      .get<ApiSuccessResponse<LeaveTypeRecord[]>>(`${API_BASE_URL}/leave-types`)
      .pipe(map((response) => response.data));
  }

  getLeaveTypeById(id: number): Observable<LeaveTypeRecord> {
    return this.http
      .get<ApiSuccessResponse<LeaveTypeRecord>>(`${API_BASE_URL}/leave-types/${id}`)
      .pipe(map((response) => response.data));
  }

  createLeaveType(payload: LeaveTypeUpsertRequest): Observable<LeaveTypeRecord> {
    return this.http
      .post<ApiSuccessResponse<LeaveTypeRecord>>(`${API_BASE_URL}/leave-types`, payload)
      .pipe(map((response) => response.data));
  }

  updateLeaveType(id: number, payload: LeaveTypeUpsertRequest): Observable<LeaveTypeRecord> {
    return this.http
      .put<ApiSuccessResponse<LeaveTypeRecord>>(`${API_BASE_URL}/leave-types/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  deleteLeaveType(id: number): Observable<string> {
    return this.http
      .delete<ApiSuccessResponse<null>>(`${API_BASE_URL}/leave-types/${id}`)
      .pipe(map((response) => response.message));
  }
}
