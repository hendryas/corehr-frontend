export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface FileDownloadPayload {
  blob: Blob;
  filename: string;
}

export interface ApiErrorResponse {
  success: false;
  code?: string | null;
  message: string;
  errors?: Record<string, string[]> | null;
  requestId?: string | null;
}
