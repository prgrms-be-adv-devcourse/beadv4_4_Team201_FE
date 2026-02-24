'use client';

import Image from 'next/image';
import { handleImageError } from '@/lib/image';
import { differenceInDays, parseISO } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FundingProgress } from './FundingProgress';
import { cn } from '@/lib/utils';
import type { FundingStatus } from '@/types/funding';

export type { FundingStatus };

export interface FundingCardProps {
    variant?: 'carousel' | 'list';
    funding: {
        id: string;
        product: {
            name: string;
            imageUrl: string;
            price: number;
        };
        targetAmount: number;
        currentAmount: number;
        status: FundingStatus;
        expiresAt: string;
        participantCount: number;
        recipient: {
            nickname: string | null;
            avatarUrl?: string | null;
        };
    };
    onClick?: () => void;
    className?: string;
}

export function FundingCard({
    variant = 'carousel',
    funding,
    onClick,
    className,
}: FundingCardProps) {
    const isCarousel = variant === 'carousel';
    const percentage = Math.round((funding.currentAmount / funding.targetAmount) * 100);
    const daysLeft = differenceInDays(parseISO(funding.expiresAt), new Date());
    const recipientNickname = funding.recipient.nickname || '알 수 없음';

    const getStatusLabel = () => {
        if (funding.status === 'ACHIEVED') {
            return <span className="text-xs font-medium text-foreground">달성</span>;
        }
        if (funding.status === 'ACCEPTED') {
            return <span className="text-xs font-medium text-foreground">수락</span>;
        }
        if (funding.status === 'REFUSED') {
            return <span className="text-xs text-muted-foreground">거절</span>;
        }
        if (funding.status === 'CLOSED') {
            return <span className="text-xs text-muted-foreground">종료</span>;
        }
        if (funding.status === 'EXPIRED' || Number.isNaN(daysLeft) || daysLeft < 0) {
            return <span className="text-xs text-muted-foreground">만료</span>;
        }
        if (daysLeft === 0) {
            return <span className="text-xs font-medium text-foreground">D-Day</span>;
        }
        return <span className="text-xs text-muted-foreground">D-{daysLeft}</span>;
    };

    if (isCarousel) {
        return (
            <div
                className={cn(
                    'w-[220px] md:w-[240px] shrink-0 cursor-pointer group',
                    className
                )}
                onClick={onClick}
            >
                {/* Image */}
                <div className="relative aspect-[4/5] w-full bg-secondary overflow-hidden">
                    <Image
                        src={funding.product.imageUrl}
                        alt={funding.product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={handleImageError}
                    />
                    <div className="absolute top-3 left-3">
                        {getStatusLabel()}
                    </div>
                </div>

                {/* Content */}
                <div className="py-4">
                    <h3 className="text-sm font-medium line-clamp-1 group-hover:opacity-60 transition-opacity">
                        {funding.product?.name}
                    </h3>

                    <div className="mt-3 space-y-2">
                        <FundingProgress
                            current={funding.currentAmount}
                            target={funding.targetAmount}
                            size="sm"
                        />
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                                {funding.currentAmount.toLocaleString()}원
                            </span>
                            <span className="font-medium">{percentage}%</span>
                        </div>
                    </div>

                    {funding.recipient.nickname && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={funding.recipient.avatarUrl || undefined} alt={recipientNickname} />
                                <AvatarFallback className="text-[10px]">{recipientNickname[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                                @{recipientNickname} · {funding.participantCount}명
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // List Variant
    return (
        <div
            className={cn(
                'flex py-4 cursor-pointer hover:opacity-70 transition-opacity',
                className
            )}
            onClick={onClick}
        >
            <div className="relative h-20 w-20 shrink-0 bg-secondary overflow-hidden">
                <Image
                    src={funding.product.imageUrl}
                    alt={funding.product.name}
                    fill
                    className="object-cover"
                    onError={handleImageError}
                />
            </div>

            <div className="flex flex-1 flex-col justify-between pl-4">
                <div>
                    {funding.recipient.nickname && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {funding.recipient.nickname}님을 위한 펀딩
                        </p>
                    )}
                    <h3 className="text-sm font-medium line-clamp-1">{funding.product?.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {funding.targetAmount.toLocaleString()}원 목표
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <FundingProgress
                        current={funding.currentAmount}
                        target={funding.targetAmount}
                        size="sm"
                        className="w-full max-w-[100px]"
                    />
                    <div className="ml-3 flex items-center gap-2 text-xs">
                        <span className="font-medium">{percentage}%</span>
                        {getStatusLabel()}
                    </div>
                </div>
            </div>
        </div>
    );
}
