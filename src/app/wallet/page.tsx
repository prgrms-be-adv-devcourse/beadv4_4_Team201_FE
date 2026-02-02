'use client';

import { useState, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { WalletBalance } from '@/features/wallet/components/WalletBalance';
import { TransactionHistory } from '@/features/wallet/components/TransactionHistory';
import { ChargeModal } from '@/features/wallet/components/ChargeModal';
import { WithdrawModal } from '@/features/wallet/components/WithdrawModal';
import { useWallet, useWalletHistory } from '@/features/wallet/hooks/useWallet';
import { Loader2 } from 'lucide-react';
import type { TransactionType } from '@/types/wallet';

export default function WalletPage() {
    const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [filterType, setFilterType] = useState<TransactionType | undefined>(undefined);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { data: wallet, isLoading: isLoadingWallet, error: walletError, refetch: refetchWallet } = useWallet();
    const { data: historyData, isLoading: isLoadingHistory, error: historyError, refetch: refetchHistory } = useWalletHistory({
        type: filterType
    });

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([refetchWallet(), refetchHistory()]);
        } finally {
            setIsRefreshing(false);
        }
    }, [refetchWallet, refetchHistory]);

    if (isLoadingWallet || isLoadingHistory) {
        return (
            <AppShell
                headerTitle="내 지갑"
                headerVariant="main"
                showBottomNav={false}
            >
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </AppShell>
        );
    }

    if (walletError || historyError) {
        return (
            <AppShell
                headerTitle="내 지갑"
                headerVariant="main"
                showBottomNav={false}
            >
            <div className="max-w-screen-2xl mx-auto px-8 py-10">
                <div className="text-center text-muted-foreground">
                    지갑 정보를 불러오는데 실패했습니다.
                </div>
            </div>
            </AppShell>
        );
    }

    return (
        <AppShell
            headerTitle="내 지갑"
            headerVariant="main"
            showBottomNav={false}
        >
            <div className="max-w-screen-2xl mx-auto px-8 py-10 space-y-8 pb-24 w-full">
                <section>
                    <WalletBalance
                        balance={wallet?.balance ?? 0}
                        onCharge={() => setIsChargeModalOpen(true)}
                        onWithdraw={() => setIsWithdrawModalOpen(true)}
                        onRefresh={handleRefresh}
                        isRefreshing={isRefreshing}
                    />
                </section>

                <section>
                    <TransactionHistory
                        transactions={historyData?.content ?? []}
                        filterType={filterType}
                        onFilterChange={setFilterType}
                    />
                </section>
            </div>

            <Footer />

            <ChargeModal
                open={isChargeModalOpen}
                onOpenChange={setIsChargeModalOpen}
            />

            <WithdrawModal
                open={isWithdrawModalOpen}
                onOpenChange={setIsWithdrawModalOpen}
                currentBalance={wallet?.balance ?? 0}
            />
        </AppShell>
    );
}
