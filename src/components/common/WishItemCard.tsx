'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { resolveImageUrl, handleImageError } from '@/lib/image';
import { Badge } from '@/components/ui/badge';
import { FundingProgress } from './FundingProgress';
import { Gift, ChevronRight, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export type WishItemStatus = 'AVAILABLE' | 'IN_FUNDING' | 'FUNDED';

export interface WishItemCardProps {
    item: {
        id: string;
        product: {
            name: string;
            imageUrl: string;
            price: number;
            category?: string;
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
    isOwner?: boolean;
    onAction?: () => void;
    onDelete?: () => void;
    className?: string;
}

export function WishItemCard({
    item,
    isOwner = false,
    onAction,
    onDelete,
    className,
}: WishItemCardProps) {
    const isFunded = item.status === 'FUNDED';

    return (
        <Card className={cn('overflow-hidden p-4', className)}>
            <div className="flex gap-4">
                {/* Image */}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-secondary">
                    <Image
                        src={resolveImageUrl(item.product.imageUrl, item.product.category)}
                        alt={item.product.name}
                        fill
                        className={cn('object-cover', isFunded && 'grayscale')}
                        onError={handleImageError}
                    />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                            <h3 className={cn("text-base font-medium line-clamp-1", isFunded && "text-muted-foreground line-through")}>
                                {item.product.name}
                            </h3>
                            <p className="font-bold text-lg">
                                ₩{item.product.price.toLocaleString()}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            {item.status === 'AVAILABLE' && (
                                <Badge variant="outline" className="text-muted-foreground">
                                    대기중
                                </Badge>
                            )}
                            {item.status === 'IN_FUNDING' && (
                                <Badge variant="secondary">
                                    펀딩 진행중
                                </Badge>
                            )}
                            {item.status === 'FUNDED' && (
                                <Badge variant="default">
                                    펀딩완료
                                </Badge>
                            )}
                            {isOwner && onDelete && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>위시 아이템 삭제</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                정말 이 아이템을 위시리스트에서 삭제하시겠습니까?
                                                {item.status === 'IN_FUNDING' && (
                                                    <span className="block mt-2 text-destructive font-medium">
                                                        진행 중인 펀딩이 있는 아이템입니다. 삭제하면 펀딩에 영향을 줄 수 있습니다.
                                                    </span>
                                                )}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>취소</AlertDialogCancel>
                                            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                삭제
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </div>

                    <div className="mt-2">
                        {item.status === 'AVAILABLE' && (
                            <div className="flex justify-between items-end">
                                <span className="text-xs text-muted-foreground">
                                    추가: {new Date(item.addedAt).toLocaleDateString()}
                                </span>
                                {onAction && (
                                    <Button size="sm" onClick={onAction} className="h-8 gap-1.5">
                                        <Gift className="h-4 w-4" />
                                        {isOwner ? '펀딩 시작' : '펀딩 참여'}
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
                                    {onAction && (
                                        <Button variant="ghost" size="sm" onClick={onAction} className="h-6 p-0 text-muted-foreground hover:text-primary">
                                            보기 <ChevronRight className="ml-1 h-3 w-3" />
                                        </Button>
                                    )}
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
                                <Badge variant="outline">
                                    완료
                                </Badge>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
