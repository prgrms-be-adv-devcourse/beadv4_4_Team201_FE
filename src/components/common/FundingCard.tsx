'use client';

import Image from 'next/image';
import { differenceInDays, parseISO } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FundingProgress } from './FundingProgress';
import { cn } from '@/lib/utils';

export type FundingStatus = 'PENDING' | 'IN_PROGRESS' | 'ACHIEVED' | 'ACCEPTED' | 'REFUSED' | 'EXPIRED' | 'CLOSED';

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
        expiresAt: string; // ISO string
        participantCount: number;
        recipient: {
            nickname: string;
            avatarUrl?: string;
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

    const getDdayBadge = () => {
        if (funding.status === 'ACHIEVED' || funding.status === 'ACCEPTED') {
            return <Badge className="bg-green-500 hover:bg-green-600">달성!</Badge>;
        }
        if (daysLeft < 0) {
            return <Badge variant="secondary">종료</Badge>;
        }
        if (daysLeft === 0) {
            return <Badge variant="destructive">D-Day</Badge>;
        }
        return <Badge variant="default" className="bg-indigo-500 hover:bg-indigo-600">D-{daysLeft}</Badge>;
    };

    if (isCarousel) {
        return (
            <Card
                className={cn('w-[280px] shrink-0 overflow-hidden cursor-pointer transition-shadow hover:shadow-md', className)}
                onClick={onClick}
            >
                {/* Image Section */}
                <div className="relative aspect-video w-full bg-secondary">
                    <Image
                        src={funding.product.imageUrl}
                        alt={funding.product.name}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute left-2 top-2">
                        {getDdayBadge()}
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col gap-3 p-4">
                    <h3 className="line-clamp-1 text-base font-semibold">{funding.product.name}</h3>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-medium">
                            <span className="text-muted-foreground">
                                {funding.currentAmount.toLocaleString()}원 / {funding.product.price.toLocaleString()}원
                            </span>
                            <span className="text-primary">{percentage}%</span>
                        </div>
                        <FundingProgress
                            current={funding.currentAmount}
                            target={funding.targetAmount}
                            size="sm"
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={funding.recipient.avatarUrl} />
                            <AvatarFallback>{funding.recipient.nickname[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">@{funding.recipient.nickname}</span>에게 · {funding.participantCount}명 참여
                        </span>
                    </div>
                </div>
            </Card>
        );
    }

    // List Variant
    return (
        <Card
            className={cn('flex overflow-hidden p-3 cursor-pointer hover:bg-accent/5 transition-colors', className)}
            onClick={onClick}
        >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-secondary">
                <Image
                    src={funding.product.imageUrl}
                    alt={funding.product.name}
                    fill
                    className="object-cover"
                />
            </div>

            <div className="flex flex-1 flex-col justify-between pl-3">
                <div>
                    <h3 className="line-clamp-1 text-sm font-semibold">{funding.product.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {funding.targetAmount.toLocaleString()}원 목표
                    </p>
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <FundingProgress
                            current={funding.currentAmount}
                            target={funding.targetAmount}
                            size="sm"
                            className="w-full max-w-[120px]"
                        />
                        <div className="ml-2 flex items-center gap-2 text-xs">
                            <span className="font-bold text-primary">{percentage}%</span>
                            {getDdayBadge()}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
