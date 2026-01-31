import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface WalletBalanceProps {
    balance: number;
    onCharge: () => void;
}

/**
 * Wallet Balance - 29cm Style
 * Clean typography-focused balance display
 */
export function WalletBalance({ balance, onCharge }: WalletBalanceProps) {
    return (
        <div className="border-b border-border pb-8">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Balance
            </p>
            <div className="flex items-end justify-between">
                <div className="text-3xl font-semibold tracking-tight">
                    {balance.toLocaleString()}
                    <span className="text-lg font-medium ml-1">P</span>
                </div>
                <Button onClick={onCharge} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" strokeWidth={1.5} />
                    충전
                </Button>
            </div>
        </div>
    );
}
