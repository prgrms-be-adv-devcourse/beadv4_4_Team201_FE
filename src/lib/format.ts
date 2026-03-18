/**
 * Format utilities for currency, dates, etc.
 */

/**
 * Format a number as Korean Won currency
 * @param amount - The amount to format
 * @returns Formatted price string (e.g., "₩1,234,567" or "1,234,567원")
 */
export function formatPrice(amount: number | undefined | null): string {
    if (amount === undefined || amount === null) {
        return '₩0';
    }
    return `${amount.toLocaleString('ko-KR')}원`;
}

/**
 * Format a number as Korean Won with symbol
 * @param amount - The amount to format
 * @returns Formatted price string with ₩ symbol
 */
export function formatPriceWithSymbol(amount: number | undefined | null): string {
    if (amount === undefined || amount === null) {
        return '₩0';
    }
    return `₩${amount.toLocaleString('ko-KR')}`;
}

/**
 * Format a number with thousands separator
 * @param num - The number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number | undefined | null): string {
    if (num === undefined || num === null) {
        return '0';
    }
    return num.toLocaleString('ko-KR');
}

/**
 * Format a date as Korean locale string
 * @param date - The date to format
 * @returns Formatted date string (e.g., "2024년 1월 31일")
 */
export function formatDate(date: Date | string | undefined | null): string {
    if (!date) {
        return '';
    }
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Format a date as short format
 * @param date - The date to format
 * @returns Formatted date string (e.g., "2024.01.31")
 */
export function formatDateShort(date: Date | string | undefined | null): string {
    if (!date) {
        return '';
    }
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).replace(/\. /g, '.').replace('.', '');
}

/**
 * Format a percentage
 * @param value - The value to format as percentage
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercent(value: number | undefined | null, decimals: number = 0): string {
    if (value === undefined || value === null) {
        return '0%';
    }
    return `${value.toFixed(decimals)}%`;
}

/**
 * Funding status labels in Korean
 */
const FUNDING_STATUS_LABELS: Record<string, string> = {
    IN_PROGRESS: '진행 중',
    ACHIEVED: '펀딩 성공',
    ACCEPTING: '선물 수락 대기 중',
    ACCEPTED: '수락 완료',
    ACCEPT_FAILED: '수락 실패',
    REFUSED: '거절',
    EXPIRED: '기한 만료',
    CLOSED: '종료',
    PENDING: '대기 중',
};

/**
 * Format funding status to Korean label
 * @param status - The funding status
 * @returns Korean label for the status
 */
export function formatFundingStatus(status: string | undefined | null): string {
    if (!status) return '알 수 없음';
    return FUNDING_STATUS_LABELS[status] || status;
}
