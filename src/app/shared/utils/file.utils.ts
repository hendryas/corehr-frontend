import { FileDownloadPayload } from '../../core/models/api.model';

export function resolveDownloadFilename(
  contentDisposition: string | null,
  fallbackFilename: string,
): string {
  if (!contentDisposition) {
    return fallbackFilename;
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);

  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const basicMatch = contentDisposition.match(/filename="([^"]+)"|filename=([^;]+)/i);
  const filename = basicMatch?.[1] ?? basicMatch?.[2];

  return filename?.trim() || fallbackFilename;
}

export function downloadFile({ blob, filename }: FileDownloadPayload): void {
  if (typeof document === 'undefined') {
    return;
  }

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = filename;
  link.style.display = 'none';

  document.body.append(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}
