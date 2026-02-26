'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { FundingCard } from '@/components/common/FundingCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useFriendInProgressFundings } from '@/features/funding/hooks/useFunding';
import { Sparkles, Users, Gift } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { ParticipateModal } from '@/features/funding/components/ParticipateModal';
import { toast } from 'sonner';
import { getFunding } from '@/lib/api/fundings';
import type { Funding } from '@/types/funding';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function FriendFundingsContent({ friendId }: { friendId: string }) {
    const router = useRouter();
    const { user } = useAuth();
    const [selectedFunding, setSelectedFunding] = useState<Funding | null>(null);
    const [isParticipateOpen, setIsParticipateOpen] = useState(false);

    const { data, isLoading } = useFriendInProgressFundings(friendId, {
        size: 20,
    });

    const fundings = data?.items || [];
    const nickname = data?.items[0]?.receiverNickname || '친구';
    const totalCount = data?.page.totalElements ?? fundings.length;

    const handleFundingClick = (id: string) => {
        router.push(`/fundings/friend/${friendId}/${id}`);
    };

    const handleParticipateFunding = (funding: Funding) => {
        if (!user) {
            router.push('/auth/login');
            return;
        }
        setSelectedFunding(funding);
        setIsParticipateOpen(true);
    };

    return (
        <>
            <AppShell>
                <main className="min-h-screen bg-white">
                    <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-10">
                        {/* Hero Section */}
                        <section className="bg-card border border-border rounded-xl p-8 mb-10">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <Users className="h-5 w-5 text-foreground" aria-hidden="true" />
                                        <h1 className="text-2xl font-semibold tracking-tight">
                                            {nickname}님의 진행 중인 펀딩
                                        </h1>
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <p className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                                            <Gift className="h-3 w-3" aria-hidden="true" />
                                            <span>
                                                총 <strong className="font-semibold">{totalCount}</strong>개의 펀딩
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Content Grid */}
                        {isLoading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="space-y-4">
                                        <Skeleton className="aspect-[4/5] w-full bg-gray-100 rounded-none" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : fundings.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12">
                                {fundings.map((funding) => (
                                    <FundingCard
                                        key={funding.id}
                                        funding={funding}
                                        onClick={() => handleFundingClick(funding.id)}
                                        onAddToCart={() => handleParticipateFunding(funding)}
                                        variant="carousel"
                                        className="w-full"
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={<Sparkles className="h-8 w-8 text-muted-foreground" strokeWidth={1} />}
                                title="펀딩이 없습니다"
                                description={`${nickname}님이 진행 중인 펀딩이 없습니다.`}
                                action={
                                    <Button
                                        variant="outline"
                                        onClick={() => router.push(`/wishlist/${friendId}`)}
                                        className="border-black rounded-none font-bold text-xs"
                                    >
                                        위시리스트 보러가기
                                    </Button>
                                }
                            />
                        )}

                        {!isLoading && data?.page.hasNext && (
                            <div className="mt-24 flex justify-center">
                                <Button variant="outline" className="h-12 px-12 border-black rounded-none font-bold">
                                    MORE
                                </Button>
                            </div>
                        )}
                    </div>
                </main>
                <Footer />
            </AppShell>

            {selectedFunding && (
                <ParticipateModal
                    open={isParticipateOpen}
                    onOpenChange={setIsParticipateOpen}
                    wishItemId={selectedFunding.wishItemId}
                    product={{
                        name: selectedFunding.product.name,
                        imageUrl: selectedFunding.product.imageUrl || '',
                        price: selectedFunding.product.price
                    }}
                    recipient={{
                        nickname: selectedFunding.recipient.nickname || selectedFunding.receiverNickname || '알 수 없음'
                    }}
                    onSuccess={() => {
                        toast.success('장바구니에 담겼습니다.', {
                            description: '펀딩 참여가 장바구니에 추가되었습니다.',
                            action: {
                                label: '장바구니 확인',
                                onClick: () => router.push('/cart')
                            }
                        });
                    }}
                />
            )}
        </>
    );
}

export default function FriendFundingsPage({ params }: { params: Promise<{ friendId: string }> }) {
    const { friendId } = use(params);
    return <FriendFundingsContent friendId={friendId} />;
}
