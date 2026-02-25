/**
 * Standardized error messages for the Giftify application
 * Provides Korean translations for common API error codes
 */

export const ERROR_MESSAGES: Record<string, string> = {
    // Authentication errors
    AUTH_REQUIRED: '로그인이 필요합니다',
    AUTH_EXPIRED: '로그인 세션이 만료되었습니다. 다시 로그인해 주세요',
    AUTH_INVALID: '인증에 실패했습니다',
    UNAUTHORIZED: '접근 권한이 없습니다',
    FORBIDDEN: '접근이 거부되었습니다',

    // Validation errors
    VALIDATION_ERROR: '입력값이 올바르지 않습니다',
    INVALID_INPUT: '잘못된 입력입니다',
    REQUIRED_FIELD: '필수 입력 항목입니다',

    // Resource errors
    NOT_FOUND: '요청한 리소스를 찾을 수 없습니다',
    RESOURCE_NOT_FOUND: '데이터를 찾을 수 없습니다',
    ALREADY_EXISTS: '이미 존재하는 데이터입니다',
    CONFLICT: '데이터 충돌이 발생했습니다',

    // Funding errors
    FUNDING_NOT_FOUND: '펀딩을 찾을 수 없습니다',
    FUNDING_EXPIRED: '마감된 펀딩입니다',
    FUNDING_COMPLETED: '이미 완료된 펀딩입니다',
    FUNDING_CANCELLED: '취소된 펀딩입니다',
    INSUFFICIENT_AMOUNT: '금액이 부족합니다',
    EXCEED_TARGET: '목표 금액을 초과할 수 없습니다',

    // Wallet errors
    WALLET_NOT_FOUND: '지갑을 찾을 수 없습니다',
    INSUFFICIENT_BALANCE: '잔액이 부족합니다',
    CHARGE_FAILED: '충전에 실패했습니다',
    PAYMENT_FAILED: '결제에 실패했습니다',

    // Cart errors
    CART_EMPTY: '장바구니가 비어있습니다',
    CART_ITEM_NOT_FOUND: '장바구니 항목을 찾을 수 없습니다',
    EXCEED_REMAINING_AMOUNT: '참여 금액은 펀딩 잔액{%d}원을 초과할 수 없습니다.',
    C014: '참여 금액은 펀딩 잔액{%d}원을 초과할 수 없습니다.',

    // Order errors
    ORDER_NOT_FOUND: '주문을 찾을 수 없습니다',
    ORDER_CANCELLED: '취소된 주문입니다',

    // Wishlist errors
    WISHLIST_NOT_FOUND: '위시리스트를 찾을 수 없습니다',
    WISHLIST_PRIVATE: '비공개 위시리스트입니다',
    ITEM_ALREADY_IN_WISHLIST: '이미 위시리스트에 있는 상품입니다',

    // Network errors
    NETWORK_ERROR: '네트워크 오류가 발생했습니다',
    TIMEOUT: '요청 시간이 초과되었습니다',
    SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요',

    // Default
    UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다',
};

/**
 * Get user-friendly error message from error code
 */
export function getErrorMessage(code: string): string {
    return ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Get error message from Error object
 */
export function getMessageFromError(error: unknown): string {
    if (error && typeof error === 'object') {
        const err = error as any;
        const code = err.code || err.errorCode;
        const messageFromBackend = err.message;
        const details = err.details || err.data;

        if (code && typeof code === 'string') {
            // Handle C014 or EXCEED_REMAINING_AMOUNT specifically with data
            if (code === 'C014' || code === 'EXCEED_REMAINING_AMOUNT') {
                // If backend message already has the number (formatted by backend)
                if (messageFromBackend && !messageFromBackend.includes('{%d}')) {
                    return messageFromBackend;
                }

                // Otherwise use our template or backend template
                const template = ERROR_MESSAGES[code] || messageFromBackend || '참여 금액은 펀딩 잔액{%d}원을 초과할 수 없습니다.';
                if (details !== undefined && details !== null) {
                    return template.replace('{%d}', Number(details).toLocaleString());
                }
                return template.replace('{%d}', '알 수 없음');
            }

            // For other codes, if we have a mapping in ERROR_MESSAGES, use it
            if (ERROR_MESSAGES[code]) {
                return ERROR_MESSAGES[code];
            }
        }

        // Fallback to backend message if present and not a generic "Something went wrong" message
        if (messageFromBackend &&
            messageFromBackend !== 'Operation failed' &&
            messageFromBackend !== 'Something went wrong' &&
            messageFromBackend !== 'Internal Server Error') {
            return messageFromBackend;
        }
    }

    if (error instanceof Error) {
        return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
    }

    if (typeof error === 'string') {
        return error;
    }

    return ERROR_MESSAGES.UNKNOWN_ERROR;
}
