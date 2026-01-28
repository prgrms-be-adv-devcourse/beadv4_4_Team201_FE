'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, ArrowRight, Plus } from 'lucide-react';
import { useWallet } from '@/features/wallet/hooks/useWallet';
import { formatCurrency } from '@/lib/utils/format';

interface WalletQuickAccessProps {
    onChargeClick?: () => void;
}

export function WalletQuickAccess({ onChargeClick }: WalletQuickAccessProps) {
    const { data: wallet, isLoading } = useWallet();

    return (
        <Card>
            <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-primary" />
                        <CardTitle>내 지갑</CardTitle>
                    </div>
                    <Link href="/wallet">
                        <Button variant="ghost" size="icon-sm">
                            <ArrowRight />
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">현재 잔액</p>
                        {isLoading ? (
                            <div className="h-8 w-32 bg-secondary rounded animate-pulse" />
                        ) : (
                            <p className="text-2xl font-bold">
                                {formatCurrency(wallet?.balance ?? 0)}
                            </p>
                        )}
                    </div>

                    <Button
                        onClick={onChargeClick}
                        className="w-full"
                        disabled={isLoading}
                    >
                        <Plus />
                        충전하기
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
