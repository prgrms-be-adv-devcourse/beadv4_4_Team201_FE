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
