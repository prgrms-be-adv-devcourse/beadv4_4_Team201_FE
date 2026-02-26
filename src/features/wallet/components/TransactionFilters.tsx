import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TransactionType } from '@/types/wallet';

interface TransactionFiltersProps {
    selectedType?: TransactionType;
    onTypeChange: (type: TransactionType | undefined) => void;
}

const FILTER_OPTIONS = [
    { value: undefined, label: '전체' },
    { value: 'ORDER_DEDUCT' as TransactionType, label: '주문 차감' },
    { value: 'SETTLEMENT_PAYOUT' as TransactionType, label: '정산 입금' },
    { value: 'SETTLEMENT_CLAWBACK' as TransactionType, label: '정산 환수' },
    { value: 'CANCEL_REFUND' as TransactionType, label: '취소 환불' },
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
