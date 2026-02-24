'use client';

import { useState } from 'react';
import { AppShell } from './AppShell';
import { Footer } from './Footer';
import { ProfileSidebar, ProfileMobileMenu } from '@/features/profile/components/ProfileSidebar';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { ProfileEditModal } from '@/features/profile/components/ProfileEditModal';
import { InlineError } from '@/components/common/InlineError';

interface ProfileLayoutProps {
    children: React.ReactNode;
}

export function ProfileLayout({ children }: ProfileLayoutProps) {
    const { isAuthenticated, isLoading: isAuthLoading, isSeller: isSellerFromAuth } = useAuth();
    const { data: member, isLoading: isProfileLoading, error, refetch } = useProfile();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Auth0 claims 또는 백엔드 member.role 중 하나라도 SELLER이면 판매자
    const isSeller = isSellerFromAuth || member?.role === 'SELLER';

    // Redirect to login if not authenticated
    if (!isAuthLoading && !isAuthenticated) {
        if (typeof window !== 'undefined') window.location.href = '/auth/login';
        return null;
    }

    const isLoading = isAuthLoading || isProfileLoading;

    if (isLoading) {
        return (
            <AppShell headerVariant="main">
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" strokeWidth={1.5} />
                </div>
            </AppShell>
        );
    }

    if (error || !member) {
        return (
            <AppShell headerVariant="main">
                <div className="p-8">
                    <InlineError
                        message="프로필 정보를 불러오는데 실패했습니다."
                        error={error}
                        onRetry={() => refetch()}
                    />
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell headerVariant="main">
            <div className="flex min-h-screen">
                <ProfileSidebar
                    member={member}
                    isSeller={isSeller}
                    onEditClick={() => setIsEditModalOpen(true)}
                />

                <main className="flex-1 min-w-0 flex flex-col">
                    <div className="flex-1 p-6 lg:p-10">
                        {/* Mobile Menu (Visible on mobile only) */}
                        {/* Note: In ProfilePage, the mobile menu is usually part of the content. 
                            But for seller pages, we might want to show either the content OR the mobile menu launcher.
                            However, the user asked for the sidebar/menu bar to not disappear. 
                            On mobile, this means they want the mobile menu structure available.
                        */}

                        {/* If we are NOT on the main profile page, we might want a way to show the mobile menu.
                            But usually, the Header or a specific button handles it.
                            In ProfilePage, the mobile menu is just listed.
                        */}
                        {children}
                    </div>
                    <Footer />
                </main>
            </div>

            <ProfileEditModal
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                member={member}
            />
        </AppShell>
    );
}
