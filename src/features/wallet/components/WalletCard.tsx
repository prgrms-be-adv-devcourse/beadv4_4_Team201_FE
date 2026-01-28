import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Wallet as WalletIcon } from 'lucide-react';

interface WalletCardProps {
    balance: number;
    onCharge: () => void;
    isLoading?: boolean;
}

export function WalletCard({ balance, onCharge, isLoading = false }: WalletCardProps) {
    return (
        <Card className="border-border bg-gradient-to-br from-primary/10 via-card to-card">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <WalletIcon className="h-4 w-4" />
                        보유 포인트
                    </CardTitle>
                    <Button
                        onClick={onCharge}
                        size="sm"
                        className="gap-1 rounded-full text-xs font-semibold"
                        disabled={isLoading}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        충전하기
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">
                        {balance.toLocaleString()}
                    </span>
                    <span className="text-xl font-semibold text-muted-foreground">P</span>
                </div>
            </CardContent>
        </Card>
    );
}
