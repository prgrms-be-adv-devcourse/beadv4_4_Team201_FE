'use client';

import { useState } from 'react';
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

    const participateFunding = useParticipateFunding();
    const remainingAmount = funding.targetAmount - funding.currentAmount;

    const handleSubmit = (mode: 'cart' | 'checkout') => {
        if (amount <= 0) {
            toast.error('참여 금액을 입력해주세요.');
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
                    toast.success('장바구니에 담겼습니다. 결제를 진행해주세요.');
                    onOpenChange(false);
                    onSuccess(mode);
                    setAmount(0);
                },
                onError: (error) => {
                    toast.error(error instanceof Error ? error.message : '펀딩 참여에 실패했습니다.');
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>펀딩 참여하기</DialogTitle>
                    <DialogDescription>
                        <span className="font-bold text-foreground">{funding.product.name}</span>에 마음을 전하세요.
                    </DialogDescription>
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

                    <DialogFooter className="flex gap-2 sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={participateFunding.isPending || amount <= 0}
                            className="flex-1"
                            onClick={() => handleSubmit('cart')}
                        >
                            {participateFunding.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <ShoppingCart className="mr-2 h-4 w-4" />
                            )}
                            장바구니에 담기
                        </Button>
                        <Button
                            type="button"
                            disabled={participateFunding.isPending || amount <= 0}
                            className="flex-1"
                            onClick={() => handleSubmit('checkout')}
                        >
                            {participateFunding.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            바로 결제하기
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
