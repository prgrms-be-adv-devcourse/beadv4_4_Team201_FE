'use client';

import Image from 'next/image';
import { handleImageError } from '@/lib/image';
import { differenceInDays, parseISO } from 'date-fns';
import { FundingProgress } from './FundingProgress';
import { cn } from '@/lib/utils';
import type { FundingStatus } from '@/types/funding';
import { ShoppingCart } from 'lucide-react';

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
    };
    onClick?: () => void;
    onAddToCart?: () => void;
    className?: string;
}

export function FundingCard({
    variant = 'carousel',
    funding,
    onClick,
    onAddToCart,
    className,
}: FundingCardProps) {
    const isCarousel = variant === 'carousel';
    const percentage = Math.round((funding.currentAmount / funding.targetAmount) * 100);
    const daysLeft = differenceInDays(parseISO(funding.expiresAt), new Date());

    const handleCartClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click event from firing
        onAddToCart?.();
    };

    const getStatusLabel = () => {
        const baseClasses = "inline-flex items-center justify-center px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap";

        if (funding.status === 'ACHIEVED') {
            return <span className={cn(baseClasses, "bg-green-500 text-white")}>달성</span>;
        }
        if (funding.status === 'ACCEPTED') {
            return <span className={cn(baseClasses, "bg-blue-500 text-white")}>수락</span>;
        }
        if (funding.status === 'REFUSED') {
            return <span className={cn(baseClasses, "bg-red-500 text-white")}>거절</span>;
        }
        if (funding.status === 'CLOSED') {
            return <span className={cn(baseClasses, "bg-gray-400 text-white")}>종료</span>;
        }
        if (funding.status === 'EXPIRED' || Number.isNaN(daysLeft) || daysLeft < 0) {
            return <span className={cn(baseClasses, "bg-gray-400 text-white")}>만료</span>;
        }
        if (daysLeft === 0) {
            return <span className={cn(baseClasses, "bg-primary text-primary-foreground")}>D-Day</span>;
        }
        return <span className={cn(baseClasses, "bg-primary text-primary-foreground")}>D-{daysLeft}</span>;
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
                            <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-foreground">
                                    {funding.currentAmount.toLocaleString()}원
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                    목표 {funding.targetAmount.toLocaleString()}원
                                </span>
                            </div>
                            <span className="font-bold text-primary">{percentage}%</span>
                        </div>
                    </div>

                    {onAddToCart && (
                        <div className="mt-3"> {/* Removed pt-3 border-t border-border */}
                             <button
                                onClick={handleCartClick}
                                className="w-full py-1.5 bg-black text-white rounded text-[10px] font-bold hover:bg-black/80 transition-colors flex items-center justify-center gap-1"
                            >
                                <ShoppingCart className="h-3 w-3" strokeWidth={2} />
                                장바구니 담기
                            </button>
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
                    {/* Recipient nickname was here, now removed */}
                    <h3 className="text-sm font-medium line-clamp-1">{funding.product?.name}</h3>
                    <div className="flex flex-col mt-0.5">
                        <span className="text-sm font-bold text-foreground">
                            {funding.currentAmount.toLocaleString()}원
                        </span>
                        <span className="text-xs text-muted-foreground">
                            목표 {funding.targetAmount.toLocaleString()}원
                        </span>
                    </div>
                </div>

                {onAddToCart && (
                    <div className="mt-2">
                        <button
                            onClick={handleCartClick}
                            className="w-full py-1.5 bg-black text-white rounded text-[10px] font-bold hover:bg-black/80 transition-colors flex items-center justify-center gap-1"
                        >
                            <ShoppingCart className="h-3 w-3" strokeWidth={2} />
                            장바구니 담기
                        </button>
                    </div>
                )}

                <div className="flex items-center justify-between mt-2">
                    <FundingProgress
                        current={funding.currentAmount}
                        target={funding.targetAmount}
                        size="sm"
                        className="w-full max-w-[100px]"
                    />
                    <div className="ml-3 flex items-center gap-2 text-xs">
                        <span className="font-bold text-primary">{percentage}%</span>
                        {getStatusLabel()}
                    </div>
                </div>
            </div>
        </div>
    );
}
