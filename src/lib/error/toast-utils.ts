import { toast } from 'sonner';
import { getMessageFromError } from './error-messages';

/**
 * Standardized toast notification utilities
 * Provides consistent error, success, and info notifications
 */

interface ToastOptions {
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

/**
 * Show error toast with standardized formatting
 */
export function showErrorToast(error: unknown, options?: ToastOptions): void {
    const message = getMessageFromError(error);

    toast.error(message, {
        duration: options?.duration ?? 4000,
        action: options?.action,
    });
}

/**
 * Show success toast with standardized formatting
 */
export function showSuccessToast(message: string, options?: ToastOptions): void {
    toast.success(message, {
        duration: options?.duration ?? 3000,
        action: options?.action,
    });
}

/**
 * Show info toast with standardized formatting
 */
export function showInfoToast(message: string, options?: ToastOptions): void {
    toast.info(message, {
        duration: options?.duration ?? 3000,
        action: options?.action,
    });
}

/**
 * Show warning toast with standardized formatting
 */
export function showWarningToast(message: string, options?: ToastOptions): void {
    toast.warning(message, {
        duration: options?.duration ?? 4000,
        action: options?.action,
    });
}

/**
 * Show loading toast that can be updated
 * Returns a dismiss function
 */
export function showLoadingToast(message: string): string | number {
    return toast.loading(message);
}

/**
 * Dismiss a specific toast by ID
 */
export function dismissToast(toastId: string | number): void {
    toast.dismiss(toastId);
}

/**
 * Common toast messages
 */
export const TOAST_MESSAGES = {
    // Success messages
    SAVE_SUCCESS: '저장되었습니다',
    DELETE_SUCCESS: '삭제되었습니다',
    UPDATE_SUCCESS: '수정되었습니다',
    CART_ADD_SUCCESS: '장바구니에 추가되었습니다',
    WISHLIST_ADD_SUCCESS: '위시리스트에 추가되었습니다',
    FUNDING_CREATE_SUCCESS: '펀딩이 생성되었습니다',
    PARTICIPATE_SUCCESS: '펀딩 참여가 완료되었습니다',
    PAYMENT_SUCCESS: '결제가 완료되었습니다',
    CHARGE_SUCCESS: '충전이 완료되었습니다',

    // Info messages
    COPIED: '복사되었습니다',
    LOGIN_REQUIRED: '로그인이 필요한 서비스입니다',

    // Loading messages
    LOADING: '처리 중...',
    SAVING: '저장 중...',
    DELETING: '삭제 중...',
} as const;
