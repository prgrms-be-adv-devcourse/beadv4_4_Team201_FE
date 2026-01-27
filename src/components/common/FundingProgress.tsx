'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface FundingProgressProps {
    current: number;
    target: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    className?: string;
}

export function FundingProgress({
    current,
    target,
    size = 'md',
    showLabel = false,
    className,
}: FundingProgressProps) {
    const percentage = Math.min(100, Math.max(0, (current / target) * 100)); // Cap at 100 for visual bar, but logic might allow >100
    const realPercentage = (current / target) * 100;

    // Color logic based on wireframe
    const getColorClass = (percent: number) => {
        if (percent >= 100) return 'bg-green-500';
        if (percent >= 70) return 'bg-blue-500';
        if (percent >= 30) return 'bg-yellow-500';
        return 'bg-gray-300';
    };

    const heightClass = {
        sm: 'h-1.5',
        md: 'h-2',
        lg: 'h-3',
    }[size];

    return (
        <div className={cn('w-full space-y-1', className)}>
            <div className="relative">
                <Progress
                    value={percentage}
                    className={cn(heightClass, 'bg-secondary')}
                    indicatorClassName={getColorClass(realPercentage)}
                />
            </div>
            {showLabel && (
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{current.toLocaleString()}원</span>
                    <span>{Math.round(realPercentage)}%</span>
                </div>
            )}
        </div>
    );
}
