export interface ApiErrorResponse {
    success: false;
    error: string;
    code: 'SESSION_EXPIRED' | 'INVALID_CREDENTIALS' | 'UPSTREAM_ERROR' | 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'RATE_LIMITED' | 'UNKNOWN';
    expired?: boolean;
    locked?: boolean;
    retryAfter?: number;
}

export interface ApiSuccessResponse<T = unknown> {
    success: true;
    data: T;
}