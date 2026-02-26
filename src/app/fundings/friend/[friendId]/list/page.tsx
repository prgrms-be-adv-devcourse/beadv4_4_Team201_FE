'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { FundingCard } from '@/components/common/FundingCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useFriendInProgressFundings } from '@/features/funding/hooks/useFunding';
import { usePublicProfile } from '@/features/profile/hooks/useProfile';
import { FundingStatus } from '@/types/funding';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/common/EmptyState';

const STATUS_FILTERS: { label: string; value: FundingStatus | 'ALL' }[] = [
    { label: '전체', value: 'ALL' },
    { label: '진행중', value: 'IN_PROGRESS' },
    { label: '달성완료', value: 'ACHIEVED' },
];

export function FriendFundingsContent({ friendId }: { friendId: string }) {
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState<FundingStatus | 'ALL'>('ALL');

    // Fetch friend's fundings using the API we connected
    const { data, isLoading } = useFriendInProgressFundings(friendId, {
        status: statusFilter === 'ALL' ? undefined : statusFilter as FundingStatus,
        size: 20
    });

    const fundings = data?.items || [];
    const nickname = data?.items[0].receiverNickname || '친구';

    const handleFundingClick = (id: string) => {
        router.push(`/fundings/${id}`);
    };

    return (
        <AppShell headerTitle={`${nickname}님의 펀딩`} headerVariant="detail">
            <main className="min-h-screen bg-white">
                {/* Hero Section */}
                <section className="bg-gray-50 py-12 md:py-16 border-b border-border">
                    <div className="max-w-screen-xl mx-auto px-6 md:px-12">
                        <div className="space-y-4">
                            <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                Friend's Fundings
                            </p>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-none">
                                {nickname}님의 <br />
                                진행 중인 펀딩
                            </h1>
                            <p className="text-sm text-muted-foreground max-w-md">
                                {nickname}님을 위해 진행 중인 따뜻한 펀딩들을 확인하고 마음을 전해보세요.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Filter & List Section */}
                <section className="max-w-screen-xl mx-auto px-6 md:px-12 py-10">
                    {/* Toolbar */}
                    <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-1 mb-8">
                        {STATUS_FILTERS.map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() => setStatusFilter(filter.value)}
                                className={cn(
                                    "text-sm font-bold tracking-tight transition-colors relative whitespace-nowrap h-8",
                                    statusFilter === filter.value
                                        ? "text-black"
                                        : "text-muted-foreground hover:text-gray-400"
                                )}
                            >
                                {filter.label}
                                {statusFilter === filter.value && (
                                    <span className="absolute -bottom-[2px] left-0 right-0 h-0.5 bg-black" />
                                )}
                            </button>
                        ))}
                    </div>

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

                    {/* Pagination Placeholder */}
                    {!isLoading && data?.page.hasNext && (
                        <div className="mt-24 flex justify-center">
                            <Button variant="outline" className="h-12 px-12 border-black rounded-none font-bold">
                                MORE
                            </Button>
                        </div>
                    )}
                </section>
            </main>
            <Footer />
        </AppShell>
    );
}

export default function FriendFundingsPage({ params }: { params: Promise<{ friendId: string }> }) {
    const { friendId } = use(params);
    return <FriendFundingsContent friendId={friendId} />;
}
