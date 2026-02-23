'use client';

import Image from 'next/image';
import { handleImageError } from '@/lib/image';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2 } from 'lucide-react';
import type { CartItem as CartItemType } from '@/types/cart';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CartItemProps {
    item: CartItemType;
    onUpdateAmount: (id: string, amount: number) => void;
    onToggleSelect: (id: string, selected: boolean) => void;
    onRemove: (id: string) => void;
}

/**
 * Cart Item - 29cm Style
 * Clean layout with minimal borders
 */
export function CartItem({ item, onUpdateAmount, onToggleSelect, onRemove }: CartItemProps) {
    const { funding, amount, selected, isNewFunding } = item;
    const progressPercent = (funding.currentAmount / funding.targetAmount) * 100;

    // Calculate D-day
    const today = new Date();
    const expiryDate = new Date(funding.expiresAt);
    const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value.replace(/,/g, '')) || 0;
        if (value >= 0) {
            onUpdateAmount(item.id, value);
        }
    };

    return (
        <div className="flex gap-4 py-4 border-b border-border last:border-0">
            <Checkbox
                checked={selected}
                onCheckedChange={(checked) => onToggleSelect(item.id, checked === true)}
                aria-label="펀딩 선택"
                className="mt-1"
            />

            <div className="relative aspect-square h-24 w-24 shrink-0 bg-secondary overflow-hidden">
                <Image
                    src={funding.product.imageUrl}
                    alt={funding.product.name}
                    fill
                    className="object-cover"
                    onError={handleImageError}
                />
            </div>

            <div className="flex flex-1 flex-col gap-2 min-w-0">
                {/* Recipient & Title */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Avatar className="h-4 w-4">
                                <AvatarImage src={funding.recipient.avatarUrl || ''} />
                                <AvatarFallback className="text-[10px]">
                                    {(funding.recipient.nickname || '알')[0]}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                                {funding.recipient.nickname || '알 수 없음'}
                            </span>
                            {isNewFunding && (
                                <span className="text-xs text-muted-foreground">· 새 펀딩</span>
                            )}
                        </div>
                        <h3 className="text-sm font-medium line-clamp-2">
                            {funding.product.name}
                        </h3>
                    </div>
                    <button
                        onClick={() => onRemove(item.id)}
                        className="p-1 text-muted-foreground hover:text-foreground shrink-0"
                        aria-label="삭제"
                    >
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Progress */}
                <div className="space-y-1">
                    <Progress value={progressPercent} className="h-1" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{Math.round(progressPercent)}% 달성</span>
                        <span>D-{daysLeft}</span>
                    </div>
                </div>

                {/* Amount Input */}
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">참여금액</span>
                    <div className="flex-1 flex items-center">
                        <input
                            type="text"
                            value={amount.toLocaleString()}
                            onChange={handleAmountChange}
                            className="flex-1 text-sm font-medium text-right bg-transparent border-b border-border focus:border-foreground focus:outline-none py-1"
                            placeholder="0"
                        />
                        <span className="text-sm ml-1">원</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
