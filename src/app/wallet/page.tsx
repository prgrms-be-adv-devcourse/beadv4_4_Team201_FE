'use client';

import { useState, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { WalletBalance } from '@/features/wallet/components/WalletBalance';
import { TransactionHistory } from '@/features/wallet/components/TransactionHistory';
import { ChargeModal } from '@/features/wallet/components/ChargeModal';
import { WithdrawModal } from '@/features/wallet/components/WithdrawModal';
import { useWallet, useWalletHistory } from '@/features/wallet/hooks/useWallet';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { InlineError } from '@/components/common/InlineError';
import type { TransactionType } from '@/types/wallet';

export default function WalletPage() {
    const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [filterType, setFilterType] = useState<TransactionType | undefined>(undefined);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const { data: wallet, isLoading: isLoadingWallet, error: walletError, refetch: refetchWallet } = useWallet();
    const { data: historyData, isLoading: isLoadingHistory, error: historyError, refetch: refetchHistory } = useWalletHistory({
        type: filterType
    });

    // Redirect to login if not authenticated
    if (!isAuthLoading && !isAuthenticated) {
        window.location.href = '/auth/login';
        return null;
    }

    const isLoading = isAuthLoading || isLoadingWallet || isLoadingHistory;

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([refetchWallet(), refetchHistory()]);
        } finally {
            setIsRefreshing(false);
        }
    }, [refetchWallet, refetchHistory]);

    if (isLoading) {
        return (
            <AppShell
                headerTitle="내 지갑"
                headerVariant="main"
                showBottomNav={false}
            >
                <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6 md:space-y-8 w-full">
                    {/* Balance skeleton */}
                    <div className="border-b border-border pb-8">
                        <Skeleton className="h-3 w-16 mb-4" />
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <Skeleton className="h-9 w-40" />
                            <div className="flex gap-2">
                                <Skeleton className="h-11 w-20" />
                                <Skeleton className="h-11 w-20" />
                            </div>
                        </div>
                    </div>
                    {/* History skeleton */}
                    <div className="py-6">
                        <div className="flex items-center justify-between mb-4">
                            <Skeleton className="h-4 w-16" />
                            <div className="flex gap-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <Skeleton key={i} className="h-6 w-12" />
                                ))}
                            </div>
                        </div>
                        <div className="divide-y divide-border">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4 py-4">
                                    <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                                    <div className="flex-1 space-y-1">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <Skeleton className="h-4 w-16 ml-auto" />
                                        <Skeleton className="h-3 w-12 ml-auto" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
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
                <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-6 md:py-10">
                    <InlineError
                        message="지갑 정보를 불러오는데 실패했습니다."
                        error={walletError || historyError}
                        onRetry={handleRefresh}
                    />
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
            <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6 md:space-y-8 pb-24 w-full">
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
