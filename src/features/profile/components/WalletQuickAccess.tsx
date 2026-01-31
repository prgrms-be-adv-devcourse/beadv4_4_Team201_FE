'use client';

import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/features/wallet/hooks/useWallet';
import { formatCurrency } from '@/lib/utils/format';

interface WalletQuickAccessProps {
    onChargeClick?: () => void;
}

/**
 * Wallet Quick Access - 29cm Style
 * Clean section with balance display
 */
export function WalletQuickAccess({ onChargeClick }: WalletQuickAccessProps) {
    const { data: wallet, isLoading } = useWallet();

    return (
        <div className="py-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    Wallet
                </h3>
                <Link
                    href="/wallet"
                    className="flex items-center gap-1 text-sm hover:opacity-60 transition-opacity"
                >
                    상세보기
                    <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <p className="text-xs text-muted-foreground mb-1">현재 잔액</p>
                    {isLoading ? (
                        <div className="h-8 w-32 bg-secondary animate-pulse" />
                    ) : (
                        <p className="text-2xl font-semibold tracking-tight">
                            {formatCurrency(wallet?.balance ?? 0)}
                        </p>
                    )}
                </div>

                <Button
                    onClick={onChargeClick}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                >
                    <Plus className="h-4 w-4 mr-1" strokeWidth={1.5} />
                    충전
                </Button>
            </div>
        </div>
    );
}
