'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Member } from '@/types/member';
import { LogOut, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileSidebarProps {
    member: Member;
    isSeller: boolean;
    onEditClick?: () => void;
    className?: string;
}

export const MY_GIFT_MENU = [
    { label: '위시리스트', href: '/wishlist' },
    { label: '친구 관리', href: '/friends' },
    { label: '참여한 펀딩', href: '/fundings/participated' },
    { label: '받은 선물', href: '/fundings/received' },
];

export const MY_SHOPPING_MENU = [
    { label: '장바구니', href: '/cart' },
    { label: '지갑', href: '/wallet' },
];

export const SELLER_MENU = [
    { label: '상품 조회', href: '/seller/products' },
    { label: '상품 등록', href: '/seller/products/new' },
    { label: '재고 이력', href: '/seller/products/stock' },
];

export const DISCOVER_MENU = [
    { label: '상품 둘러보기', href: '/products' },
    { label: '친구 찾기', href: '/explore' },
];

export function ProfileSidebar({ member, isSeller, onEditClick, className }: ProfileSidebarProps) {
    const pathname = usePathname();

    const handleLogout = () => {
        window.location.href = '/api/auth/logout';
    };

    const NavLink = ({ href, label }: { href: string; label: string }) => {
        const isActive = pathname === href;
        return (
            <Link
                href={href}
                className={cn(
                    "block text-sm transition-colors py-0.5",
                    isActive ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
            >
                {label}
            </Link>
        );
    };

    return (
        <aside className={cn("hidden lg:block w-52 flex-shrink-0 border-r border-border sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto", className)}>
            <div className="p-6">
                {/* User Info */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-1">{member.nickname}</h2>
                    <button
                        onClick={onEditClick}
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
                            <NavLink key={item.href} {...item} />
                        ))}
                    </nav>
                </div>

                {/* 나의 쇼핑정보 */}
                <div className="mb-6">
                    <h3 className="text-xs font-medium mb-3">나의 쇼핑정보</h3>
                    <nav className="space-y-2">
                        {MY_SHOPPING_MENU.map((item) => (
                            <NavLink key={item.href} {...item} />
                        ))}
                    </nav>
                </div>

                {/* 나의 상품 관리 - 판매자 전용 */}
                {isSeller && (
                    <div className="mb-6">
                        <h3 className="text-xs font-medium mb-3">나의 상품 관리</h3>
                        <nav className="space-y-2">
                            {SELLER_MENU.map((item) => (
                                <NavLink key={item.href} {...item} />
                            ))}
                        </nav>
                    </div>
                )}

                {/* 둘러보기 */}
                <div className="mb-6">
                    <h3 className="text-xs font-medium mb-3">둘러보기</h3>
                    <nav className="space-y-2">
                        {DISCOVER_MENU.map((item) => (
                            <NavLink key={item.href} {...item} />
                        ))}
                        <Link
                            href={`/u/${member.id}`}
                            className={cn(
                                "block text-sm transition-colors py-0.5",
                                pathname === `/u/${member.id}` ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
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
    );
}

export function ProfileMobileMenu({ member, isSeller, onEditClick }: { member: Member; isSeller: boolean; onEditClick?: () => void }) {
    return (
        <div className="lg:hidden space-y-8">
            {/* Profile Header - Mobile */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold mb-1">{member.nickname}</h1>
                <button
                    onClick={onEditClick}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    프로필 수정 →
                </button>
            </div>

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

            {/* 나의 상품 관리 - 판매자 전용 */}
            {isSeller && (
                <div>
                    <h3 className="text-xs font-medium mb-3">나의 상품 관리</h3>
                    <div className="border-t border-border">
                        {SELLER_MENU.map((item) => (
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
            )}

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
                onClick={() => window.location.href = '/api/auth/logout'}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground py-4"
            >
                <LogOut className="h-4 w-4" strokeWidth={1.5} />
                로그아웃
            </button>
        </div>
    );
}
