import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/constants/api.constants';
import { ApiSuccessResponse, FileDownloadPayload } from '../../../core/models/api.model';
import { resolveDownloadFilename } from '../../../shared/utils/file.utils';
import { statusFilterToQuery } from '../domain/mappers/leave.mapper';
import {
  LeaveApiRecord,
  LeaveEmployeeListResponse,
  LeaveEmployeeOption,
  LeaveListQuery,
  LeaveRequestStatus,
  LeaveRejectRequest,
  LeavesListResponse,
  LeaveUpsertRequest,
} from '../domain/models/leave.model';

@Injectable()
export class LeaveApiService {
  private readonly http = inject(HttpClient);

  getLeaves(query: LeaveListQuery): Observable<LeavesListResponse> {
    return this.http
      .get<ApiSuccessResponse<LeavesListResponse>>(`${API_BASE_URL}/leaves`, {
        params: this.buildLeaveListParams(query),
      })
      .pipe(map((response) => response.data));
  }

  exportLeavesCsv(query: LeaveListQuery): Observable<FileDownloadPayload> {
    return this.http
      .get(`${API_BASE_URL}/leaves/export/csv`, {
        params: this.buildLeaveListParams(query),
        observe: 'response',
        responseType: 'blob',
      })
      .pipe(
        map((response) => ({
          blob: response.body ?? new Blob([], { type: 'text/csv;charset=utf-8' }),
          filename: resolveDownloadFilename(
            response.headers.get('content-disposition'),
            'leave-requests.csv',
          ),
        })),
      );
  }

  getLeaveById(id: number): Observable<LeaveApiRecord> {
    return this.http
      .get<ApiSuccessResponse<LeaveApiRecord>>(`${API_BASE_URL}/leaves/${id}`)
      .pipe(map((response) => response.data));
  }

  getEmployeeOptions(): Observable<LeaveEmployeeOption[]> {
    const params = new HttpParams()
      .set('page', 1)
      .set('limit', 100)
      .set('is_active', '1');

    return this.http
      .get<ApiSuccessResponse<LeaveEmployeeListResponse>>(`${API_BASE_URL}/employees`, { params })
      .pipe(map((response) => response.data.items));
  }

  getLeaveCount(status?: LeaveRequestStatus): Observable<number> {
    let params = new HttpParams().set('page', 1).set('limit', 1);

    if (status) {
      params = params.set('status', status);
    }

    return this.http
      .get<ApiSuccessResponse<LeavesListResponse>>(`${API_BASE_URL}/leaves`, { params })
      .pipe(map((response) => response.data.pagination.total));
  }

  createLeave(payload: LeaveUpsertRequest): Observable<LeaveApiRecord> {
    return this.http
      .post<ApiSuccessResponse<LeaveApiRecord>>(`${API_BASE_URL}/leaves`, payload)
      .pipe(map((response) => response.data));
  }

  updateLeave(id: number, payload: LeaveUpsertRequest): Observable<LeaveApiRecord> {
    return this.http
      .put<ApiSuccessResponse<LeaveApiRecord>>(`${API_BASE_URL}/leaves/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  deleteLeave(id: number): Observable<string> {
    return this.http
      .delete<ApiSuccessResponse<null>>(`${API_BASE_URL}/leaves/${id}`)
      .pipe(map((response) => response.message));
  }

  approveLeave(id: number): Observable<LeaveApiRecord> {
    return this.http
      .patch<ApiSuccessResponse<LeaveApiRecord>>(`${API_BASE_URL}/leaves/${id}/approve`, {})
      .pipe(map((response) => response.data));
  }

  rejectLeave(id: number, payload: LeaveRejectRequest): Observable<LeaveApiRecord> {
    return this.http
      .patch<ApiSuccessResponse<LeaveApiRecord>>(`${API_BASE_URL}/leaves/${id}/reject`, payload)
      .pipe(map((response) => response.data));
  }

  private buildLeaveListParams(query: LeaveListQuery): HttpParams {
    let params = new HttpParams()
      .set('page', query.page)
      .set('limit', query.limit);

    const search = query.search.trim();
    const status = statusFilterToQuery(query.status);
    const startDate = query.startDate.trim();
    const endDate = query.endDate.trim();

    if (search) {
      params = params.set('search', search);
    }

    if (status) {
      params = params.set('status', status);
    }

    if (query.leaveTypeId) {
      params = params.set('leave_type_id', query.leaveTypeId);
    }

    if (startDate) {
      params = params.set('start_date', startDate);
    }

    if (endDate) {
      params = params.set('end_date', endDate);
    }

    return params;
  }
}
