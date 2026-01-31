'use client';

import { Button } from '@/components/ui/button';

interface CartSummaryProps {
    totalItems: number;
    totalAmount: number;
    onCheckout: () => void;
    disabled?: boolean;
}

/**
 * Cart Summary - 29cm Style
 * Fixed bottom bar with clean typography
 */
export function CartSummary({ totalItems, totalAmount, onCheckout, disabled = false }: CartSummaryProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-20 md:static md:border-t-0">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-xs text-muted-foreground">총 {totalItems}건</p>
                    <p className="text-xl font-semibold tracking-tight">
                        {totalAmount.toLocaleString()}원
                    </p>
                </div>
                <Button
                    size="lg"
                    onClick={onCheckout}
                    disabled={disabled || totalItems === 0}
                >
                    {totalItems > 0 ? '결제하기' : '선택해주세요'}
                </Button>
            </div>
        </div>
    );
}
