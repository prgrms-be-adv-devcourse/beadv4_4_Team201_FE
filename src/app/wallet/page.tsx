'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { WalletBalance } from '@/features/wallet/components/WalletBalance';
import { TransactionHistory } from '@/features/wallet/components/TransactionHistory';
import { ChargeModal } from '@/features/wallet/components/ChargeModal';
import { useWallet, useWalletHistory } from '@/features/wallet/hooks/useWallet';
import { Loader2 } from 'lucide-react';
import type { TransactionType } from '@/types/wallet';

export default function WalletPage() {
    const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
    const [filterType, setFilterType] = useState<TransactionType | undefined>(undefined);

    const { data: wallet, isLoading: isLoadingWallet, error: walletError } = useWallet();
    const { data: historyData, isLoading: isLoadingHistory, error: historyError } = useWalletHistory({
        type: filterType
    });

    if (isLoadingWallet || isLoadingHistory) {
        return (
            <AppShell
                headerTitle="내 지갑"
                headerVariant="main"
                showBottomNav={true}
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
                showBottomNav={true}
            >
                <div className="p-4">
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
            showBottomNav={true}
        >
            <div className="p-4 space-y-8 pb-24">
                <section>
                    <WalletBalance
                        balance={wallet?.balance ?? 0}
                        onCharge={() => setIsChargeModalOpen(true)}
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

            <ChargeModal
                open={isChargeModalOpen}
                onOpenChange={setIsChargeModalOpen}
            />
        </AppShell>
    );
}
