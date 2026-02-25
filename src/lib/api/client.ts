const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const BASE_URL = typeof window === 'undefined' ? API_URL : '/api/proxy';

export class ApiError extends Error {
    code: string;
    status: number;
    details?: unknown;

    constructor(message: string, code: string, status: number, details?: unknown) {
        super(message);
        this.code = code;
        this.status = status;
        this.details = details;
        this.name = 'ApiError';
    }
}

interface RequestConfig extends RequestInit {
    token?: string;
    idempotencyKey?: string;
}

async function request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { token, idempotencyKey, headers, ...customConfig } = config;

    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    if (idempotencyKey) {
        defaultHeaders['Idempotency-Key'] = idempotencyKey;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...customConfig,
        headers: {
            ...defaultHeaders,
            ...headers,
        },
    });

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
        // Handle specific error codes if needed
        const errorMessage = json.message || 'Something went wrong';
        // Support RsData errorCode first, fallback to code
        const errorCode = json.errorCode || json.code || 'UNKNOWN_ERROR';

        throw new ApiError(errorMessage, errorCode, response.status, json.details || json.data);
    }

    // Extract data from CommonResponse wrapper if present
    // Backend uses 'result' field instead of 'success' for RsData
    if (json && typeof json === 'object' && ('success' in json || 'result' in json)) {
        // If result is FAIL (conceptually should be caught by !response.ok if status is used correctly, 
        // but just in case of 200 OK with FAIL result)
        if ('result' in json && json.result === 'FAIL') {
            const errorMessage = json.message || 'Operation failed';
            const errorCode = json.errorCode || 'UNKNOWN_ERROR';
            throw new ApiError(errorMessage, errorCode, response.status, json.data);
        }

        return ('data' in json ? json.data : json) as T;
    }

    return json as T;
}

export const apiClient = {
    get: <T>(endpoint: string, config?: RequestConfig) => request<T>(endpoint, { ...config, method: 'GET' }),
    post: <T>(endpoint: string, body: unknown, config?: RequestConfig) =>
        request<T>(endpoint, { ...config, method: 'POST', body: JSON.stringify(body) }),
    put: <T>(endpoint: string, body: unknown, config?: RequestConfig) =>
        request<T>(endpoint, { ...config, method: 'PUT', body: JSON.stringify(body) }),
    patch: <T>(endpoint: string, body: unknown, config?: RequestConfig) =>
        request<T>(endpoint, { ...config, method: 'PATCH', body: JSON.stringify(body) }),
    delete: <T>(endpoint: string, config?: RequestConfig) =>
        request<T>(endpoint, { ...config, method: 'DELETE' }),
};