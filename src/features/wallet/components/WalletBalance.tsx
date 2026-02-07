import { Button } from '@/components/ui/button';
import { ArrowDownCircle, Plus, RefreshCcw } from 'lucide-react';

interface WalletBalanceProps {
    balance: number;
    onCharge: () => void;
    onWithdraw?: () => void;
    onRefresh?: () => void;
    isRefreshing?: boolean;
}

/**
 * Wallet Balance - 29cm Style
 * Clean typography-focused balance display
 */
export function WalletBalance({ balance, onCharge, onWithdraw, onRefresh, isRefreshing }: WalletBalanceProps) {
    return (
        <div className="border-b border-border pb-8">
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Balance
                </p>
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                        aria-label="새로고침"
                    >
                        <RefreshCcw
                            className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                            strokeWidth={1.5}
                        />
                    </button>
                )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="text-3xl font-semibold tracking-tight">
                    {balance.toLocaleString()}
                    <span className="text-lg font-medium ml-1">P</span>
                </div>
                <div className="flex gap-2">
                    {onWithdraw && (
                        <Button onClick={onWithdraw} variant="outline" className="h-11 px-4 text-sm">
                            <ArrowDownCircle className="h-4 w-4 mr-1" strokeWidth={1.5} />
                            출금
                        </Button>
                    )}
                    <Button onClick={onCharge} variant="default" className="h-11 px-4 text-sm">
                        <Plus className="h-4 w-4 mr-1" strokeWidth={1.5} />
                        충전
                    </Button>
                </div>
            </div>
        </div>
    );
}
