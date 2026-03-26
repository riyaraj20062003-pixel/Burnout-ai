import type { ApiFailure, ApiSuccess } from "../../shared/api";

export function success<T>(data: T): ApiSuccess<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function failure(
  code: string,
  message: string,
  details?: Record<string, unknown>,
): ApiFailure {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  };
}
