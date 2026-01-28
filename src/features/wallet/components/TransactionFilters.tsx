import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TransactionType } from '@/types/wallet';

interface TransactionFiltersProps {
    selectedType?: TransactionType;
    onTypeChange: (type: TransactionType | undefined) => void;
}

const FILTER_OPTIONS = [
    { value: undefined, label: '전체' },
    { value: 'CHARGE' as TransactionType, label: '충전' },
    { value: 'PAYMENT' as TransactionType, label: '사용' },
    { value: 'REFUND' as TransactionType, label: '환불' },
];

export function TransactionFilters({ selectedType, onTypeChange }: TransactionFiltersProps) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2">
            {FILTER_OPTIONS.map((option) => (
                <Button
                    key={option.label}
                    variant={selectedType === option.value ? "default" : "outline"}
                    size="sm"
                    className={cn(
                        "rounded-full whitespace-nowrap",
                        selectedType === option.value && "shadow-sm"
                    )}
                    onClick={() => onTypeChange(option.value)}
                >
                    {option.label}
                </Button>
            ))}
        </div>
    );
}
