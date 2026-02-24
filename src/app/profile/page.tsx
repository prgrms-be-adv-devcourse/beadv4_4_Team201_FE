'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProfileLayout } from '@/components/layout/ProfileLayout';
import { ProfileMobileMenu } from '@/features/profile/components/ProfileSidebar';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useWallet } from '@/features/wallet/hooks/useWallet';
import { Wallet } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { ChargeModal } from '@/features/wallet/components/ChargeModal';

export default function ProfilePage() {
    const { isAuthenticated, isSeller: isSellerFromAuth } = useAuth();
    const { data: member } = useProfile();
    const { data: wallet } = useWallet();
    const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);

    // Auth0 claims 또는 백엔드 member.role 중 하나라도 SELLER이면 판매자
    const isSeller = isSellerFromAuth || member?.role === 'SELLER';

    if (!member) return null;

    return (
        <ProfileLayout>
            <div className="flex-1">
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
                <ProfileMobileMenu member={member} isSeller={isSeller} />
            </div>

            <ChargeModal
                open={isChargeModalOpen}
                onOpenChange={setIsChargeModalOpen}
            />
        </ProfileLayout>
    );
}
