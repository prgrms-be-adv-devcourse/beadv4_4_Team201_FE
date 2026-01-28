/**
 * Format a number as Korean currency (KRW)
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "10,000원")
 */
export function formatCurrency(amount: number): string {
    return `${amount.toLocaleString()}원`;
}

/**
 * Format a number with thousand separators
 * @param value - The number to format
 * @returns Formatted number string (e.g., "1,000")
 */
export function formatNumber(value: number): string {
    return value.toLocaleString();
}
