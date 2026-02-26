import { cn } from '@/lib/utils';
import { ArrowUpCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';
import type { WalletTransaction, TransactionType } from '@/types/wallet';

interface TransactionHistoryProps {
    transactions: WalletTransaction[];
    filterType?: TransactionType;
    onFilterChange?: (type: TransactionType | undefined) => void;
}

const TRANSACTION_ICONS = {
    CHARGE: ArrowUpCircle,
    WITHDRAW: ArrowDownCircle,
    ORDER_DEDUCT: ArrowDownCircle,
    SETTLEMENT_PAYOUT: ArrowUpCircle,
    SETTLEMENT_CLAWBACK: ArrowDownCircle,
    CANCEL_REFUND: ArrowUpCircle,
};

const TRANSACTION_LABELS = {
    CHARGE: '캐시 충전',
    WITHDRAW: '출금',
    ORDER_DEDUCT: '주문 차감',
    SETTLEMENT_PAYOUT: '정산 입금',
    SETTLEMENT_CLAWBACK: '정산 환수',
    CANCEL_REFUND: '취소 환불',
};

/**
 * Transaction History - 29cm Style
 * Clean list with dividers, minimal filter buttons
 */
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
        <div className="py-6">
            {/* Header with Filter */}
            <div className="flex items-center justify-between mb-4 gap-2">
                <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground shrink-0">
                    History
                </h3>
                {onFilterChange && (
                    <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => onFilterChange(undefined)}
                            className={cn(
                                "px-3 py-1 text-xs transition-opacity",
                                !filterType
                                    ? "font-medium text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            전체
                        </button>
                        {(['CHARGE', 'WITHDRAW', 'ORDER_DEDUCT', 'SETTLEMENT_PAYOUT', 'SETTLEMENT_CLAWBACK', 'CANCEL_REFUND'] as TransactionType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => onFilterChange(type)}
                                className={cn(
                                    "px-3 py-1 text-xs transition-opacity whitespace-nowrap",
                                    filterType === type
                                        ? "font-medium text-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {TRANSACTION_LABELS[type]}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Transaction List */}
            {transactions.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground">
                    내역이 없습니다.
                </div>
            ) : (
                <div className="divide-y divide-border">
                    {transactions.map((tx) => {
                        const Icon = TRANSACTION_ICONS[tx.type] || AlertCircle;
                        const isPositive = ['CHARGE', 'SETTLEMENT_PAYOUT', 'CANCEL_REFUND'].includes(tx.type);

                        return (
                            <div key={tx.id} className="flex items-center gap-4 py-4">
                                <Icon
                                    className={cn(
                                        "h-5 w-5 shrink-0",
                                        isPositive ? "text-foreground" : "text-muted-foreground"
                                    )}
                                    strokeWidth={1.5}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{tx.description}</p>
                                    <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                                </div>
                                <div className="shrink-0 text-right">
                                    <div className={cn(
                                        "text-sm font-medium",
                                        isPositive ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                        {isPositive ? '+' : '-'}{Math.abs(tx.amount).toLocaleString()}P
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {tx.balanceAfter.toLocaleString()}P
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
