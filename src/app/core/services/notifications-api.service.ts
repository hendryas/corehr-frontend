import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import { ApiSuccessResponse } from '../models/api.model';
import {
  MarkAllNotificationsResult,
  NotificationRecord,
  NotificationsQuery,
  NotificationsResponse,
} from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationsApiService {
  private readonly http = inject(HttpClient);

  getNotifications(query: NotificationsQuery): Observable<NotificationsResponse> {
    return this.http
      .get<ApiSuccessResponse<NotificationsResponse>>(`${API_BASE_URL}/notifications`, {
        params: this.buildQueryParams(query),
      })
      .pipe(map((response) => response.data));
  }

  markAsRead(id: number): Observable<NotificationRecord> {
    return this.http
      .patch<ApiSuccessResponse<NotificationRecord>>(`${API_BASE_URL}/notifications/${id}/read`, {})
      .pipe(map((response) => response.data));
  }

  markAllAsRead(): Observable<MarkAllNotificationsResult> {
    return this.http
      .patch<ApiSuccessResponse<MarkAllNotificationsResult>>(
        `${API_BASE_URL}/notifications/read-all`,
        {},
      )
      .pipe(map((response) => response.data));
  }

  private buildQueryParams(query: NotificationsQuery): HttpParams {
    let params = new HttpParams()
      .set('page', query.page)
      .set('limit', query.limit);

    if (query.unreadOnly) {
      params = params.set('unread_only', '1');
    }

    return params;
  }
}
