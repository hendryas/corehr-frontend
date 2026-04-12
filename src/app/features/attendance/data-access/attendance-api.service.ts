import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/constants/api.constants';
import { ApiSuccessResponse, FileDownloadPayload } from '../../../core/models/api.model';
import { resolveDownloadFilename } from '../../../shared/utils/file.utils';
import { statusFilterToQuery } from '../domain/mappers/attendance.mapper';
import {
  AttendanceApiRecord,
  AttendanceEmployeeListResponse,
  AttendanceEmployeeOption,
  AttendanceListQuery,
  AttendanceStatus,
  AttendancesListResponse,
  AttendanceUpsertRequest,
} from '../domain/models/attendance.model';

@Injectable()
export class AttendanceApiService {
  private readonly http = inject(HttpClient);

  getAttendances(query: AttendanceListQuery): Observable<AttendancesListResponse> {
    const params = this.buildAttendanceListParams(query);

    return this.http
      .get<ApiSuccessResponse<AttendancesListResponse>>(`${API_BASE_URL}/attendances`, { params })
      .pipe(map((response) => response.data));
  }

  getMyAttendances(query: AttendanceListQuery): Observable<AttendancesListResponse> {
    const params = this.buildAttendanceListParams(query);

    return this.http
      .get<ApiSuccessResponse<AttendancesListResponse>>(`${API_BASE_URL}/attendances/me`, {
        params,
      })
      .pipe(map((response) => response.data));
  }

  exportAttendancesCsv(query: AttendanceListQuery): Observable<FileDownloadPayload> {
    return this.http
      .get(`${API_BASE_URL}/attendances/export/csv`, {
        params: this.buildAttendanceListParams(query),
        observe: 'response',
        responseType: 'blob',
      })
      .pipe(
        map((response) => ({
          blob: response.body ?? new Blob([], { type: 'text/csv;charset=utf-8' }),
          filename: resolveDownloadFilename(
            response.headers.get('content-disposition'),
            'attendances.csv',
          ),
        })),
      );
  }

  getAttendanceById(id: number): Observable<AttendanceApiRecord> {
    return this.http
      .get<ApiSuccessResponse<AttendanceApiRecord>>(`${API_BASE_URL}/attendances/${id}`)
      .pipe(map((response) => response.data));
  }

  getEmployeeOptions(): Observable<AttendanceEmployeeOption[]> {
    const params = new HttpParams()
      .set('page', 1)
      .set('limit', 100)
      .set('is_active', '1');

    return this.http
      .get<ApiSuccessResponse<AttendanceEmployeeListResponse>>(`${API_BASE_URL}/employees`, { params })
      .pipe(map((response) => response.data.items));
  }

  getAttendanceCount(attendanceDate: string, status: AttendanceStatus): Observable<number> {
    const params = new HttpParams()
      .set('page', 1)
      .set('limit', 1)
      .set('attendance_date', attendanceDate)
      .set('status', status);

    return this.http
      .get<ApiSuccessResponse<AttendancesListResponse>>(`${API_BASE_URL}/attendances`, { params })
      .pipe(map((response) => response.data.pagination.total));
  }

  createAttendance(payload: AttendanceUpsertRequest): Observable<AttendanceApiRecord> {
    return this.http
      .post<ApiSuccessResponse<AttendanceApiRecord>>(`${API_BASE_URL}/attendances`, payload)
      .pipe(map((response) => response.data));
  }

  updateAttendance(id: number, payload: AttendanceUpsertRequest): Observable<AttendanceApiRecord> {
    return this.http
      .put<ApiSuccessResponse<AttendanceApiRecord>>(`${API_BASE_URL}/attendances/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  deleteAttendance(id: number): Observable<string> {
    return this.http
      .delete<ApiSuccessResponse<null>>(`${API_BASE_URL}/attendances/${id}`)
      .pipe(map((response) => response.message));
  }

  checkIn(): Observable<AttendanceApiRecord> {
    return this.http
      .post<ApiSuccessResponse<AttendanceApiRecord>>(`${API_BASE_URL}/attendances/check-in`, {})
      .pipe(map((response) => response.data));
  }

  checkOut(): Observable<AttendanceApiRecord> {
    return this.http
      .post<ApiSuccessResponse<AttendanceApiRecord>>(`${API_BASE_URL}/attendances/check-out`, {})
      .pipe(map((response) => response.data));
  }

  private buildAttendanceListParams(query: AttendanceListQuery): HttpParams {
    let params = new HttpParams()
      .set('page', query.page)
      .set('limit', query.limit);

    const status = statusFilterToQuery(query.status);
    const attendanceDate = query.attendanceDate.trim();

    if (status) {
      params = params.set('status', status);
    }

    if (attendanceDate) {
      params = params.set('attendance_date', attendanceDate);
    }

    return params;
  }
}
