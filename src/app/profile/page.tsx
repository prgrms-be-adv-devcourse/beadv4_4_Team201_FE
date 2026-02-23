'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { ProfileEditModal } from '@/features/profile/components/ProfileEditModal';
import { ChargeModal } from '@/features/wallet/components/ChargeModal';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWallet } from '@/features/wallet/hooks/useWallet';
import { InlineError } from '@/components/common/InlineError';
import { Loader2, ChevronRight, Wallet, LogOut } from 'lucide-react';
import { formatPrice } from '@/lib/format';

const MY_GIFT_MENU = [
    { label: '위시리스트', href: '/wishlist' },
    { label: '친구 관리', href: '/friends' },
    { label: '참여한 펀딩', href: '/fundings/participated' },
    { label: '받은 선물', href: '/fundings/received' },
];

const MY_SHOPPING_MENU = [
    { label: '장바구니', href: '/cart' },
    { label: '지갑', href: '/wallet' },
];

const DISCOVER_MENU = [
    { label: '상품 둘러보기', href: '/products' },
    { label: '친구 찾기', href: '/explore' },
];

export default function ProfilePage() {
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const { data: member, isLoading: isProfileLoading, error, refetch } = useProfile();
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
                    <InlineError
                        message="프로필 정보를 불러오는데 실패했습니다."
                        error={error}
                        onRetry={() => refetch()}
                    />
                </div>
            </AppShell>
        );
    }

    const handleLogout = async () => {
        window.location.href = '/api/auth/logout';
    };

    return (
        <AppShell headerVariant="main">
            <div className="flex min-h-screen">
                {/* Sidebar - Desktop (29cm Style) */}
                <aside className="hidden lg:block w-52 flex-shrink-0 border-r border-border sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
                    <div className="p-6">
                        {/* User Info */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold mb-1">{member.nickname}</h2>
                            <button
                                onClick={() => setIsEditSheetOpen(true)}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                프로필 수정 →
                            </button>
                        </div>

                        {/* 선물 / 펀딩 */}
                        <div className="mb-6">
                            <h3 className="text-xs font-medium mb-3">선물 / 펀딩</h3>
                            <nav className="space-y-2">
                                {MY_GIFT_MENU.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-0.5"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* 나의 쇼핑정보 */}
                        <div className="mb-6">
                            <h3 className="text-xs font-medium mb-3">나의 쇼핑정보</h3>
                            <nav className="space-y-2">
                                {MY_SHOPPING_MENU.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-0.5"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* 둘러보기 */}
                        <div className="mb-6">
                            <h3 className="text-xs font-medium mb-3">둘러보기</h3>
                            <nav className="space-y-2">
                                {DISCOVER_MENU.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-0.5"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                                <Link
                                    href={`/u/${member.id}`}
                                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-0.5"
                                >
                                    내 공개 프로필
                                </Link>
                            </nav>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
                            로그아웃
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 flex flex-col">
                    <div className="flex-1 p-6 lg:p-10">
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

                        {/* Membership Info Card - 29cm Style */}
                        <div className="border border-foreground mb-8">
                            <div className="grid grid-cols-2 divide-x divide-border">
                                {/* Level */}
                                <div className="p-5 text-center">
                                    <p className="text-[11px] text-muted-foreground mb-2">멤버십 등급 ›</p>
                                    <p className="text-lg font-semibold">Newbie</p>
                                </div>
                                {/* Points only */}
                                <div className="p-5 text-center">
                                    <p className="text-[11px] text-muted-foreground mb-2">상품 포인트 ›</p>
                                    <p className="text-lg font-semibold">0</p>
                                </div>
                            </div>
                        </div>

                        {/* Money/Wallet - 29cm Style */}
                        <div className="border border-border p-5 mb-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <Wallet className="h-5 w-5" strokeWidth={1.5} />
                                        <span className="font-medium">Money</span>
                                    </div>
                                    <span className="text-lg font-semibold">
                                        {formatPrice(wallet?.balance || 0)}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsChargeModalOpen(true)}
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    충전하기 ›
                                </button>
                            </div>
                        </div>

                        {/* Recent Order Section */}
                        <section className="mb-12">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-medium">최근 주문</h2>
                                <Link href="/orders" className="text-xs text-muted-foreground hover:text-foreground">
                                    더보기 ›
                                </Link>
                            </div>
                            <div className="text-center py-12 border border-border">
                                <p className="text-sm text-muted-foreground">주문 내역이 없습니다.</p>
                            </div>
                        </section>

                        {/* Liked Products Section - 29cm Style */}
                        <section className="mb-12">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-base font-medium">나의 좋아요</h2>
                                    <span className="text-xs text-muted-foreground">0 item(s)</span>
                                </div>
                                <Link href="/wishlist" className="text-xs text-muted-foreground hover:text-foreground">
                                    더보기 ›
                                </Link>
                            </div>

                            {/* Product/Brand Tabs */}
                            <div className="flex gap-6 mb-6 border-b border-border">
                                <button className="pb-3 text-sm font-medium border-b-2 border-foreground -mb-px">
                                    Product
                                </button>
                                <button className="pb-3 text-sm text-muted-foreground hover:text-foreground">
                                    Brand
                                </button>
                            </div>

                            <div className="text-center py-12 border border-border">
                                <p className="text-sm text-muted-foreground">좋아요한 상품이 없습니다.</p>
                            </div>
                        </section>

                        {/* Mobile Menu */}
                        <div className="lg:hidden space-y-8">
                            {/* 선물 / 펀딩 */}
                            <div>
                                <h3 className="text-xs font-medium mb-3">선물 / 펀딩</h3>
                                <div className="border-t border-border">
                                    {MY_GIFT_MENU.map((item) => (
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

                            {/* 나의 쇼핑정보 */}
                            <div>
                                <h3 className="text-xs font-medium mb-3">나의 쇼핑정보</h3>
                                <div className="border-t border-border">
                                    {MY_SHOPPING_MENU.map((item) => (
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

                            {/* 둘러보기 */}
                            <div>
                                <h3 className="text-xs font-medium mb-3">둘러보기</h3>
                                <div className="border-t border-border">
                                    {DISCOVER_MENU.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="flex items-center justify-between py-3 border-b border-border"
                                        >
                                            <span className="text-sm">{item.label}</span>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                                        </Link>
                                    ))}
                                    <Link
                                        href={`/u/${member.id}`}
                                        className="flex items-center justify-between py-3 border-b border-border"
                                    >
                                        <span className="text-sm">내 공개 프로필</span>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                                    </Link>
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
                    </div>

                    {/* Footer */}
                    <Footer />
                </main>
            </div>

            <ProfileEditModal
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
