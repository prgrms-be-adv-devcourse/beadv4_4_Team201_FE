import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw } from 'lucide-react';
import type { WalletTransaction, TransactionType } from '@/types/wallet';

interface TransactionHistoryProps {
    transactions: WalletTransaction[];
    filterType?: TransactionType;
    onFilterChange?: (type: TransactionType | undefined) => void;
}

const TRANSACTION_ICONS = {
    CHARGE: ArrowUpCircle,
    PAYMENT: ArrowDownCircle,
    REFUND: RefreshCcw,
};

const TRANSACTION_LABELS = {
    CHARGE: '충전',
    PAYMENT: '사용',
    REFUND: '환불',
};

export function TransactionHistory({ transactions, filterType, onFilterChange }: TransactionHistoryProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">거래 내역</h3>
                {onFilterChange && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => onFilterChange(undefined)}
                            className={cn(
                                "px-3 py-1 text-xs rounded-full transition-colors",
                                !filterType
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            )}
                        >
                            전체
                        </button>
                        {(['CHARGE', 'PAYMENT', 'REFUND'] as TransactionType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => onFilterChange(type)}
                                className={cn(
                                    "px-3 py-1 text-xs rounded-full transition-colors",
                                    filterType === type
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                )}
                            >
                                {TRANSACTION_LABELS[type]}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <Card className="border-border bg-card">
                <CardContent className="p-0">
                    {transactions.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            내역이 없습니다.
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {transactions.map((tx) => {
                                const Icon = TRANSACTION_ICONS[tx.type];
                                const isPositive = tx.type === 'CHARGE' || tx.type === 'REFUND';

                                return (
                                    <div key={tx.id} className="flex items-center gap-3 p-4">
                                        <div className={cn(
                                            "flex-shrink-0 p-2 rounded-full",
                                            isPositive ? "bg-primary/10" : "bg-muted"
                                        )}>
                                            <Icon className={cn(
                                                "h-4 w-4",
                                                isPositive ? "text-primary" : "text-muted-foreground"
                                            )} />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <p className="font-medium text-sm truncate">{tx.description}</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                                        </div>
                                        <div className="flex-shrink-0 text-right space-y-1">
                                            <div className={cn(
                                                "text-sm font-bold",
                                                isPositive ? "text-primary" : "text-foreground"
                                            )}>
                                                {isPositive ? '+' : '-'}{Math.abs(tx.amount).toLocaleString()}P
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                잔액 {tx.balanceAfter.toLocaleString()}P
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
