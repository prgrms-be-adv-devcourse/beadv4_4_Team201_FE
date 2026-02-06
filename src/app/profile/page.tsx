'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { ProfileEditModal } from '@/features/profile/components/ProfileEditModal';
import { ChargeModal } from '@/features/wallet/components/ChargeModal';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWallet } from '@/features/wallet/hooks/useWallet';
import { Loader2, ChevronRight, Wallet, LogOut, MessageCircle } from 'lucide-react';
import { formatPrice } from '@/lib/format';

// 나의 쇼핑정보
const MY_SHOPPING_MENU = [
    { label: '주문/배송 조회', href: '/orders' },
    { label: '취소/반품/교환 내역', href: '/orders/cancel' },
    { label: '결제수단 관리', href: '/payment-methods' },
    { label: '쿠폰/포인트 내역', href: '/coupons' },
];

// 나의 계정정보
const MY_ACCOUNT_MENU = [
    { label: '프로필 수정', href: '/profile/edit' },
    { label: '1:1 문의내역 조회', href: '/support/inquiries' },
    { label: '주소록', href: '/addresses' },
    { label: '계정설정', href: '/settings' },
];

// 고객센터
const CUSTOMER_CENTER_MENU = [
    { label: '1:1 문의', href: '/support' },
    { label: 'FAQ', href: '/faq' },
    { label: '교환 및 반품', href: '/returns' },
    { label: '공지사항', href: '/notice' },
];

// 참여 / 혜택
const BENEFITS_MENU = [
    { label: 'Giftify 마일리지', href: '/mileage' },
    { label: '친구 초대하기', href: '/invite' },
    { label: 'Giftify 이벤트', href: '/events' },
];

const MY_ACTIVITY_MENU = [
    { label: '나의 활동 (공개 프로필)', href: '/u/me' }, // Will require dynamic replacement in component or use /u/[id]
];

// About Giftify
const ABOUT_MENU = [
    { label: 'Giftify 소개', href: '/about' },
    { label: '파트너 등록', href: '/partner' },
    { label: '이용약관', href: '/terms' },
];

export default function ProfilePage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
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

                        {/* 나의 계정정보 */}
                        <div className="mb-6">
                            <h3 className="text-xs font-medium mb-3">나의 계정정보</h3>
                            <nav className="space-y-2">
                                {MY_ACCOUNT_MENU.map((item) => (
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

                        {/* 고객센터 */}
                        <div className="mb-6">
                            <h3 className="text-xs font-medium mb-3">고객센터</h3>
                            <nav className="space-y-2">
                                {CUSTOMER_CENTER_MENU.map((item) => (
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

                        {/* 참여 / 혜택 */}
                        <div className="mb-6">
                            <h3 className="text-xs font-medium mb-3">참여 / 혜택</h3>
                            <nav className="space-y-2">
                                {BENEFITS_MENU.map((item) => (
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

                        {/* 나의 활동 */}
                        <div className="mb-6">
                            <h3 className="text-xs font-medium mb-3">나의 활동</h3>
                            <nav className="space-y-2">
                                <Link
                                    href={`/u/${member.id}`}
                                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-0.5"
                                >
                                    내 공개 프로필 보기
                                </Link>
                            </nav>
                        </div>

                        {/* About Giftify */}
                        <div className="mb-6">
                            <h3 className="text-xs font-medium mb-3">ABOUT GIFTIFY</h3>
                            <nav className="space-y-2">
                                {ABOUT_MENU.map((item) => (
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

                        {/* 1:1 문의 Button */}
                        <Link
                            href="/support"
                            className="flex items-center justify-center gap-2 w-full py-2.5 border border-border text-xs hover:bg-secondary transition-colors mb-6"
                        >
                            <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                            1:1 문의하러가기
                        </Link>

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
                            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
                                {/* Level */}
                                <div className="p-5 text-center">
                                    <p className="text-[11px] text-muted-foreground mb-2">멤버십 등급 ›</p>
                                    <p className="text-lg font-semibold">Newbie</p>
                                </div>
                                {/* Coupons */}
                                <div className="p-5 text-center">
                                    <p className="text-[11px] text-muted-foreground mb-2">쿠폰 ›</p>
                                    <p className="text-lg font-semibold">0</p>
                                </div>
                                {/* Points */}
                                <div className="p-5 text-center">
                                    <p className="text-[11px] text-muted-foreground mb-2">상품 포인트 ›</p>
                                    <p className="text-lg font-semibold">0</p>
                                </div>
                                {/* Credits */}
                                <div className="p-5 text-center">
                                    <p className="text-[11px] text-muted-foreground mb-2">적립금 ›</p>
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

                        {/* Quick Links - Banner Style */}
                        <div className="grid md:grid-cols-2 gap-4 mb-12">
                            <div className="border border-border p-5 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                                <div>
                                    <p className="font-medium mb-1 text-sm">위시 공유하고 적립금 받으세요</p>
                                    <p className="text-xs text-muted-foreground">친구 초대 시 3,000원 적립</p>
                                </div>
                                <Link href="/invite" className="text-xs text-muted-foreground hover:text-foreground">
                                    이벤트 참여하기 ›
                                </Link>
                            </div>
                            <div className="border border-border p-5 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                                <div>
                                    <p className="font-medium mb-1 text-sm">지금 Giftify 회원만의 혜택을 받으세요</p>
                                    <p className="text-xs text-muted-foreground">신규회원 무료 펀딩 랜덤쿠폰 🎁</p>
                                </div>
                                <Link href="/events" className="text-xs text-muted-foreground hover:text-foreground">
                                    이벤트 보기 ›
                                </Link>
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

                            {/* 나의 계정정보 */}
                            <div>
                                <h3 className="text-xs font-medium mb-3">나의 계정정보</h3>
                                <div className="border-t border-border">
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

                            {/* 고객센터 */}
                            <div>
                                <h3 className="text-xs font-medium mb-3">고객센터</h3>
                                <div className="border-t border-border">
                                    {CUSTOMER_CENTER_MENU.map((item) => (
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

                            {/* 참여 / 혜택 */}
                            <div>
                                <h3 className="text-xs font-medium mb-3">참여 / 혜택</h3>
                                <div className="border-t border-border">
                                    {BENEFITS_MENU.map((item) => (
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

                            {/* 나의 활동 */}
                            <div>
                                <h3 className="text-xs font-medium mb-3">나의 활동</h3>
                                <div className="border-t border-border">
                                    <Link
                                        href={`/u/${member.id}`}
                                        className="flex items-center justify-between py-3 border-b border-border"
                                    >
                                        <span className="text-sm">내 공개 프로필 보기</span>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                                    </Link>
                                </div>
                            </div>

                            {/* About Giftify */}
                            <div>
                                <h3 className="text-xs font-medium mb-3">ABOUT GIFTIFY</h3>
                                <div className="border-t border-border">
                                    {ABOUT_MENU.map((item) => (
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

                            {/* 1:1 문의 Button */}
                            <Link
                                href="/support"
                                className="flex items-center justify-center gap-2 w-full py-3 border border-border text-sm hover:bg-secondary transition-colors"
                            >
                                <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
                                1:1 문의하러가기
                            </Link>

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
