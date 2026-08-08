export interface ApiErrorResponse {
    success: false;
    error: string;
    code: 'SESSION_EXPIRED' | 'INVALID_CREDENTIALS' | 'INVALID_CAPTCHA' | 'UPSTREAM_ERROR' | 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'RATE_LIMITED' | 'UNKNOWN';
    expired?: boolean;
    locked?: boolean;
    attemptsLeft?: number;
    retryAfter?: number;
}

export interface ApiSuccessResponse<T = unknown> {
    success: true;
    data: T;
}