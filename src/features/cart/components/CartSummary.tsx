'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface CartSummaryProps {
    totalItems: number;
    totalAmount: number;
    onCheckout: () => void;
    disabled?: boolean;
}

export function CartSummary({ totalItems, totalAmount, onCheckout, disabled = false }: CartSummaryProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-20 md:static md:border-t-0">
            <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">총 펀딩 참여</span>
                    <span>{totalItems}건</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                    <span>결제 금액</span>
                    <span className="text-primary">{totalAmount.toLocaleString()}원</span>
                </div>
            </div>
            <Button
                className="w-full h-12 text-lg"
                onClick={onCheckout}
                disabled={disabled || totalItems === 0}
            >
                {totalItems > 0 ? `${totalItems}건 결제하기` : '상품을 선택해주세요'}
            </Button>
        </div>
    );
}
