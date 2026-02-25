'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { AmountInput } from '@/components/common/AmountInput';
import { useWallet } from '@/features/wallet/hooks/useWallet';
import { Loader2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useParticipateFunding } from '@/features/funding/hooks/useFundingMutations';
import { getMessageFromError } from '@/lib/error/error-messages';
import type { Funding } from '@/types/funding';

interface ParticipateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    funding: Pick<Funding, 'id' | 'product' | 'recipient' | 'currentAmount' | 'targetAmount'>;
    onSuccess: (mode: 'cart' | 'checkout') => void;
}

export function ParticipateModal({
    open,
    onOpenChange,
    funding,
    onSuccess
}: ParticipateModalProps) {
    const [amount, setAmount] = useState(0);
    const { data: wallet } = useWallet();

    // Reset state when modal opens for a new funding
    useEffect(() => {
        if (open) {
            setAmount(0);
        }
    }, [open, funding.id]);

    const participateFunding = useParticipateFunding();
    const remainingAmount = funding.targetAmount - funding.currentAmount;

    const handleSubmit = () => {
        if (amount < 1000) {
            toast.error('최소 참여 금액은 1,000원입니다.');
            return;
        }

        if (amount > remainingAmount) {
            toast.error(`남은 금액은 ${remainingAmount.toLocaleString()}원 입니다.`);
            return;
        }

        participateFunding.mutate(
            {
                fundingId: funding.id,
                amount,
            },
            {
                onSuccess: () => {
                    onOpenChange(false);
                    onSuccess('cart');
                    setAmount(0);
                },
                onError: (error: any) => {
                    toast.error(getMessageFromError(error) || '펀딩 참여에 실패했습니다.');
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>장바구니 담기</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Product Summary Card */}
                    <div className="flex items-center gap-3">
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                            <Image
                                src={funding.product.imageUrl}
                                alt={funding.product.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{funding.product.name}</p>
                            <p className="text-xs text-muted-foreground">for @{funding.recipient.nickname}</p>
                            <p className="text-sm font-bold mt-1">₩{funding.product.price.toLocaleString()}</p>
                        </div>
                    </div>

                    <Separator />

                    <AmountInput
                        value={amount}
                        onChange={setAmount}
                        minAmount={1000}
                        maxAmount={remainingAmount}
                        walletBalance={wallet?.balance}
                    />

                    <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                            <span>남은 목표 금액</span>
                            <span className="font-medium">₩{remainingAmount.toLocaleString()}</span>
                        </div>
                        {wallet && (
                            <div className="flex justify-between">
                                <span>내 지갑 잔액</span>
                                <span className="font-medium">₩{wallet.balance.toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            disabled={participateFunding.isPending}
                            className="w-full"
                            onClick={handleSubmit}
                        >
                            {participateFunding.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            장바구니 담기
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
