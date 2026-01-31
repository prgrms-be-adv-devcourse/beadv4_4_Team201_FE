'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { ProfileEditSheet } from '@/features/profile/components/ProfileEditSheet';
import { ChargeModal } from '@/features/wallet/components/ChargeModal';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWallet } from '@/features/wallet/hooks/useWallet';
import { Loader2, ChevronRight, Heart, Package, Gift, Wallet, Settings, HelpCircle, LogOut, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/format';

// Sidebar menu structure (29cm style)
const MY_ORDER_MENU = [
    { label: '주문내역', href: '/orders', icon: Package },
    { label: '찜 리스트', href: '/wishlist', icon: Heart },
];

const MY_ACTIVITY_MENU = [
    { label: '내가 만든 펀딩', href: '/fundings/organized', icon: Gift },
    { label: '참여한 펀딩', href: '/fundings/participated', icon: Gift },
    { label: '받은 펀딩', href: '/fundings/received', icon: Gift },
];

const MY_ACCOUNT_MENU = [
    { label: '지갑', href: '/wallet', icon: Wallet },
    { label: '설정', href: '/settings', icon: Settings },
];

const HELP_MENU = [
    { label: 'FAQ', href: '/faq', icon: HelpCircle },
    { label: '공지사항', href: '/notice', icon: FileText },
];

export default function ProfilePage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
    const { data: member, isLoading: isProfileLoading, error } = useProfile();
    const { data: wallet } = useWallet();
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
    const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);

    // Redirect to login if not authenticated
    if (!isAuthLoading && !isAuthenticated) {
        window.location.href = '/auth/login';
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
                    <div className="text-center text-muted-foreground">
                        프로필 정보를 불러오는데 실패했습니다.
                    </div>
                </div>
            </AppShell>
        );
    }

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    return (
        <AppShell headerVariant="main">
            <div className="flex min-h-screen">
                {/* Sidebar - Desktop */}
                <aside className="hidden lg:block w-48 flex-shrink-0 border-r border-border p-6 sticky top-14 h-[calc(100vh-3.5rem)]">
                    {/* User Info */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-1">{member.nickname}</h2>
                        <button
                            onClick={() => setIsEditSheetOpen(true)}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            프로필 수정
                        </button>
                    </div>

                    {/* My Shopping Info */}
                    <div className="mb-8">
                        <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                            나의 쇼핑정보
                        </h3>
                        <nav className="space-y-3">
                            {MY_ORDER_MENU.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* My Activity */}
                    <div className="mb-8">
                        <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                            나의 계정정보
                        </h3>
                        <nav className="space-y-3">
                            {MY_ACTIVITY_MENU.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Customer Center */}
                    <div className="mb-8">
                        <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                            고객센터
                        </h3>
                        <nav className="space-y-3">
                            {HELP_MENU.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        로그아웃
                    </button>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 p-6 lg:p-10">
                    {/* Profile Header - Mobile */}
                    <div className="lg:hidden mb-8">
                        <h1 className="text-2xl font-semibold mb-1">{member.nickname}</h1>
                        <button
                            onClick={() => setIsEditSheetOpen(true)}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            프로필 수정 →
                        </button>
                    </div>

                    {/* Membership Info Card */}
                    <div className="border border-border p-6 mb-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {/* Level */}
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">멤버십 등급</p>
                                <p className="text-xl font-semibold">Newbie</p>
                            </div>
                            {/* Coupons */}
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">쿠폰</p>
                                <p className="text-xl font-semibold">0</p>
                            </div>
                            {/* Points */}
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">상품 포인트</p>
                                <p className="text-xl font-semibold">0</p>
                            </div>
                            {/* Credits */}
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">적립금</p>
                                <p className="text-xl font-semibold">0</p>
                            </div>
                        </div>
                    </div>

                    {/* Money/Wallet */}
                    <div className="border border-border p-6 mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Wallet className="h-5 w-5" strokeWidth={1.5} />
                                <span className="font-medium">Money</span>
                                <span className="text-lg font-semibold ml-2">
                                    {formatPrice(wallet?.balance || 0)}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsChargeModalOpen(true)}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                충전하기 →
                            </button>
                        </div>
                    </div>

                    {/* Quick Links - Banner Style */}
                    <div className="grid md:grid-cols-2 gap-4 mb-12">
                        <div className="border border-border p-6 flex items-center justify-between">
                            <div>
                                <p className="font-medium mb-1">위시 공유하고 적립금 받으세요</p>
                                <p className="text-sm text-muted-foreground">친구 초대 시 3,000원 적립</p>
                            </div>
                            <Link href="/invite" className="text-sm hover:opacity-60">
                                이벤트 참여하기 →
                            </Link>
                        </div>
                        <div className="border border-border p-6 flex items-center justify-between">
                            <div>
                                <p className="font-medium mb-1">지금 29회원만에 알아가세요</p>
                                <p className="text-sm text-muted-foreground">할인쿠폰 무료로 받으세요 👍</p>
                            </div>
                            <Link href="/events" className="text-sm hover:opacity-60">
                                이벤트 보기 →
                            </Link>
                        </div>
                    </div>

                    {/* Recent Order Section */}
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">최근 주문</h2>
                            <Link href="/orders" className="text-sm text-muted-foreground hover:text-foreground">
                                전체 →
                            </Link>
                        </div>
                        <div className="text-center py-12 border border-border">
                            <p className="text-muted-foreground">주문 내역이 없습니다</p>
                        </div>
                    </section>

                    {/* Liked Products Section */}
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">나의 좋아요</h2>
                            <Link href="/wishlist" className="text-sm text-muted-foreground hover:text-foreground">
                                전체 →
                            </Link>
                        </div>
                        <div className="text-center py-12 border border-border">
                            <p className="text-muted-foreground">좋아요한 상품이 없습니다</p>
                        </div>
                    </section>

                    {/* Mobile Menu */}
                    <div className="lg:hidden space-y-6">
                        {/* My Order */}
                        <div>
                            <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                                나의 쇼핑정보
                            </h3>
                            <div className="space-y-1">
                                {MY_ORDER_MENU.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center justify-between py-3 border-b border-border"
                                    >
                                        <span className="text-sm">{item.label}</span>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* My Activity */}
                        <div>
                            <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                                나의 계정정보
                            </h3>
                            <div className="space-y-1">
                                {MY_ACTIVITY_MENU.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center justify-between py-3 border-b border-border"
                                    >
                                        <span className="text-sm">{item.label}</span>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Account */}
                        <div>
                            <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                                계정
                            </h3>
                            <div className="space-y-1">
                                {MY_ACCOUNT_MENU.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center justify-between py-3 border-b border-border"
                                    >
                                        <span className="text-sm">{item.label}</span>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground py-4"
                        >
                            <LogOut className="h-4 w-4" strokeWidth={1.5} />
                            로그아웃
                        </button>
                    </div>
                </main>
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
