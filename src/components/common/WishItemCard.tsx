'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FundingProgress } from './FundingProgress';
import { Gift, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type WishItemStatus = 'AVAILABLE' | 'IN_FUNDING' | 'FUNDED';

export interface WishItemCardProps {
    item: {
        id: string;
        product: {
            name: string;
            imageUrl: string;
            price: number;
        };
        status: WishItemStatus;
        // For IN_FUNDING
        funding?: {
            id: string;
            currentAmount: number;
            targetAmount: number;
            participantCount: number;
        };
        // For FUNDED
        fundedAt?: string;
        addedAt: string;
    };
    isOwner?: boolean; // If true, shows 'Start Funding' for AVAILABLE
    onAction?: () => void; // Main action (Start Funding, View Funding, etc.)
    className?: string;
}

export function WishItemCard({
    item,
    isOwner = false,
    onAction,
    className,
}: WishItemCardProps) {
    const isFunded = item.status === 'FUNDED';

    return (
        <Card className={cn('overflow-hidden p-4', className)}>
            <div className="flex gap-4">
                {/* Image */}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-secondary">
                    <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className={cn('object-cover', isFunded && 'grayscale')}
                    />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                        <div>
                            <h3 className={cn("text-base font-medium line-clamp-1", isFunded && "text-muted-foreground line-through")}>
                                {item.product.name}
                            </h3>
                            <p className="font-bold text-lg">
                                ₩{item.product.price.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            {item.status === 'AVAILABLE' && (
                                <Badge variant="outline" className="text-muted-foreground">
                                    D-xx
                                </Badge>
                                // Or just generic badge
                            )}
                            {item.status === 'IN_FUNDING' && (
                                <Badge variant="secondary" className="text-indigo-600 bg-indigo-50">
                                    펀딩 진행중
                                </Badge>
                            )}
                            {item.status === 'FUNDED' && (
                                <Badge className="bg-green-500">
                                    🎉 펀딩완료
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="mt-2">
                        {item.status === 'AVAILABLE' && (
                            <div className="flex justify-between items-end">
                                <span className="text-xs text-muted-foreground">
                                    추가: {new Date(item.addedAt).toLocaleDateString()}
                                </span>
                                {isOwner && (
                                    <Button size="sm" onClick={onAction} className="h-8 gap-1.5">
                                        <Gift className="h-4 w-4" />
                                        펀딩 시작
                                    </Button>
                                )}
                            </div>
                        )}

                        {item.status === 'IN_FUNDING' && item.funding && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-4">
                                    <FundingProgress
                                        current={item.funding.currentAmount}
                                        target={item.funding.targetAmount}
                                        size="sm"
                                        className="flex-1"
                                    />
                                    <Button variant="ghost" size="sm" onClick={onAction} className="h-6 p-0 text-muted-foreground hover:text-primary">
                                        보기 <ChevronRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {Math.round((item.funding.currentAmount / item.funding.targetAmount) * 100)}% 달성 ({item.funding.participantCount}명 참여)
                                </p>
                            </div>
                        )}

                        {item.status === 'FUNDED' && (
                            <div className="flex justify-between items-end">
                                <span className="text-xs text-muted-foreground">
                                    완료: {item.fundedAt ? new Date(item.fundedAt).toLocaleDateString() : '-'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
