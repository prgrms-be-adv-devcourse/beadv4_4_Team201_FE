'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ProfileCard } from '@/features/profile/components/ProfileCard';
import { ProfileEditSheet } from '@/features/profile/components/ProfileEditSheet';
import { WalletQuickAccess } from '@/features/profile/components/WalletQuickAccess';
import { FundingActivityMenu } from '@/features/profile/components/FundingActivityMenu';
import { SettingsMenu } from '@/features/profile/components/SettingsMenu';
import { ChargeModal } from '@/features/wallet/components/ChargeModal';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const { data: member, isLoading: isProfileLoading, error } = useProfile();
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
    const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);

    // Redirect to login if not authenticated
    if (!isAuthLoading && !isAuthenticated) {
        router.push('/api/auth/login');
        return null;
    }

    const isLoading = isAuthLoading || isProfileLoading;

    if (isLoading) {
        return (
            <AppShell
                headerTitle="마이페이지"
                headerVariant="main"
                showBottomNav={true}
            >
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </AppShell>
        );
    }

    if (error || !member) {
        return (
            <AppShell
                headerTitle="마이페이지"
                headerVariant="main"
                showBottomNav={true}
            >
                <div className="p-4">
                    <div className="text-center text-muted-foreground">
                        프로필 정보를 불러오는데 실패했습니다.
                    </div>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell
            headerTitle="마이페이지"
            headerVariant="main"
            showBottomNav={true}
        >
            <div className="p-4 space-y-4 pb-24">
                <ProfileCard
                    member={member}
                    onEditClick={() => setIsEditSheetOpen(true)}
                />

                <WalletQuickAccess
                    onChargeClick={() => setIsChargeModalOpen(true)}
                />

                <FundingActivityMenu />

                <SettingsMenu />
            </div>

            <ProfileEditSheet
                open={isEditSheetOpen}
                onOpenChange={setIsEditSheetOpen}
                member={member}
            />

            <ChargeModal
                open={isChargeModalOpen}
                onOpenChange={setIsChargeModalOpen}
            />
        </AppShell>
    );
}
