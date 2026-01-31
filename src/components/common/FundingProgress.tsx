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

/**
 * Funding Progress - 29cm Style
 * Monochrome progress bar with opacity variations
 */
export function FundingProgress({
    current,
    target,
    size = 'md',
    showLabel = false,
    className,
}: FundingProgressProps) {
    const percentage = Math.min(100, Math.max(0, (current / target) * 100));
    const realPercentage = (current / target) * 100;

    // 29cm Style - Monochrome with opacity variations
    const getColorClass = (percent: number) => {
        if (percent >= 100) return 'bg-foreground';
        if (percent >= 70) return 'bg-foreground/80';
        if (percent >= 30) return 'bg-foreground/60';
        return 'bg-foreground/40';
    };

    const heightClass = {
        sm: 'h-1',
        md: 'h-1.5',
        lg: 'h-2',
    }[size];

    return (
        <div className={cn('w-full space-y-1', className)}>
            <div className="relative">
                <Progress
                    value={percentage}
                    className={cn(heightClass, 'bg-border')}
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
