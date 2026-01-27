'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface AmountInputProps {
    value: number;
    onChange: (value: number) => void;
    maxAmount?: number;          // Target amount cap
    walletBalance?: number;      // For checking insufficient funds
    quickAmounts?: number[];     // e.g. [10000, 30000, 50000]
    className?: string;
}

export function AmountInput({
    value,
    onChange,
    maxAmount,
    walletBalance,
    quickAmounts = [10000, 30000, 50000],
    className,
}: AmountInputProps) {
    const [inputValue, setInputValue] = React.useState(value.toString());

    // Sync internal input state with prop value
    React.useEffect(() => {
        setInputValue(value.toString());
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Basic number only filter
        const val = e.target.value.replace(/[^0-9]/g, '');
        setInputValue(val);
        onChange(Number(val));
    };

    const handleError = () => {
        if (maxAmount && value > maxAmount) {
            return `남은 금액(${maxAmount.toLocaleString()}원)을 초과할 수 없습니다.`;
        }
        if (walletBalance !== undefined && value > walletBalance) {
            return `지갑 잔액이 부족합니다 (현재: ${walletBalance.toLocaleString()}원)`;
        }
        return null;
    };

    const error = handleError();

    const handleQuickAdd = (amount: number) => {
        // If we want to ADD to current value: onChange(value + amount);
        // If we want to SET value: onChange(amount);
        // Wireframe implies quick selection, usually set or add. Let's assume SET for explicit buttons like "Full Amount" but ADD for "+10k".
        // Wireframe text: "+1만", "+3만", "전액". So it's likely adding logic for + buttons.

        // Logic: if amount is special flag (e.g. -1 for max), set to max.
        // Otherwise add.

        let newValue = value + amount;
        if (maxAmount && newValue > maxAmount) {
            newValue = maxAmount;
        }
        onChange(newValue);
    };

    const handleFullAmount = () => {
        if (maxAmount) onChange(maxAmount);
    };

    return (
        <div className={cn('space-y-4', className)}>
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    참여 금액
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">₩</span>
                    <Input
                        type="text"
                        inputMode="numeric"
                        value={inputValue} // Should format with commas? For input dealing with raw value is easier, but display formatted is nicer.
                        // Let's keep simple raw for now or use a formatter library. User sees raw numbers.
                        onChange={handleInputChange}
                        className={cn('pl-8 text-lg font-bold', error && 'border-destructive focus-visible:ring-destructive')}
                    />
                </div>
                {error && (
                    <div className="flex items-center gap-1 text-xs text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        <span>{error}</span>
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                {quickAmounts.map((amt) => (
                    <Button
                        key={amt}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAdd(amt)}
                        className="flex-1"
                    >
                        +{amt / 10000}만
                    </Button>
                ))}
                {maxAmount && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleFullAmount}
                        className="flex-1 bg-secondary/50"
                    >
                        전액
                    </Button>
                )}
            </div>

            {maxAmount && (
                <p className="text-xs text-muted-foreground text-right">
                    남은 목표 금액: {maxAmount.toLocaleString()}원
                </p>
            )}
        </div>
    );
}
