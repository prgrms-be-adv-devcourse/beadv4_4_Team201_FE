'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Calendar } from 'lucide-react';
import type { CartItem as CartItemType } from '@/types/cart';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CartItemProps {
    item: CartItemType;
    onUpdateAmount: (id: string, amount: number) => void;
    onToggleSelect: (id: string, selected: boolean) => void;
    onRemove: (id: string) => void;
}

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
        <Card className="relative overflow-hidden">
            <div className="flex gap-3 p-4">
                <Checkbox
                    checked={selected}
                    onCheckedChange={(checked) => onToggleSelect(item.id, checked === true)}
                    aria-label="펀딩 선택"
                />

                <div className="relative aspect-square h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                    <Image
                        src={funding.product.imageUrl}
                        alt={funding.product.name}
                        fill
                        className="object-cover"
                    />
                </div>

                <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                    <AvatarImage src={funding.recipient.avatarUrl || ''} />
                                    <AvatarFallback>{funding.recipient.nickname[0]}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">
                                    {funding.recipient.nickname}
                                </span>
                            </div>
                            <h3 className="font-medium text-sm line-clamp-2">{funding.product.name}</h3>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                            onClick={() => onRemove(item.id)}
                            aria-label="삭제"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                                {funding.currentAmount.toLocaleString()}원
                            </span>
                            <span className="font-medium">
                                {funding.targetAmount.toLocaleString()}원
                            </span>
                        </div>
                        <Progress value={progressPercent} className="h-1.5" />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>D-{daysLeft}</span>
                            </div>
                            {isNewFunding && (
                                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                    새 펀딩
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">참여금액</span>
                        <Input
                            type="text"
                            value={amount.toLocaleString()}
                            onChange={handleAmountChange}
                            className="h-8 text-sm font-medium text-right"
                            placeholder="0"
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">원</span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
