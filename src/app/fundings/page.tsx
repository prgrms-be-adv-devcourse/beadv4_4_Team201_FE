'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { FundingCard } from '@/components/common/FundingCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getFundings } from '@/lib/api/fundings';
import { FundingStatus } from '@/types/funding';
import { Sparkles, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { EmptyState } from '@/components/common/EmptyState';

const STATUS_FILTERS: { label: string; value: FundingStatus | 'ALL' }[] = [
    { label: '전체', value: 'ALL' },
    { label: '진행중', value: 'IN_PROGRESS' },
    { label: '달성완료', value: 'ACHIEVED' },
    { label: '종료', value: 'EXPIRED' },
];

export default function FundingsPage() {
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState<FundingStatus | 'ALL'>('ALL');

    const { data, isLoading } = useQuery({
        queryKey: ['fundings', statusFilter],
        queryFn: () => getFundings({
            status: statusFilter === 'ALL' ? undefined : statusFilter as FundingStatus,
            size: 20
        }),
    });

    const fundings = data?.items || [];

    const handleFundingClick = (id: string) => {
        router.push(`/fundings/${id}`);
    };

    return (
        <AppShell headerTitle="펀딩 탐색" headerVariant="main">
            <main className="min-h-screen bg-white">
                {/* Hero Section */}
                <section className="bg-gray-50 py-16 md:py-24 border-b border-border">
                    <div className="max-w-screen-xl mx-auto px-6 md:px-12">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-4">
                                <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                    Browse Fundings
                                </p>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-none">
                                    함께하는 <br />
                                    선물의 즐거움
                                </h1>
                                <p className="text-sm md:text-base text-muted-foreground max-w-md">
                                    친구나 지인을 위해 진행되는 따뜻한 펀딩들을 확인해보세요.
                                    작은 정성이 모여 큰 감동이 됩니다.
                                </p>
                            </div>

                            {/* Stats Preview */}
                            <div className="flex gap-8 md:gap-12 pb-2">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Live Fundings</p>
                                    <p className="text-2xl font-black tabular-nums">128</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Success Rate</p>
                                    <p className="text-2xl font-black tabular-nums">94%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Filter & List Section */}
                <section className="max-w-screen-xl mx-auto px-6 md:px-12 py-12">
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 min-h-[44px]">
                        {/* Status Tabs (29cm Style) */}
                        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-1 -mb-1">
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
                    </div>

                    {/* Content Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12">
                            {[...Array(8)].map((_, i) => (
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
                                    funding={{
                                        ...funding,
                                        recipient: {
                                            nickname: funding.recipient?.nickname || null,
                                            avatarUrl: funding.recipient?.avatarUrl || null
                                        }
                                    }}
                                    onClick={() => handleFundingClick(funding.id)}
                                    variant="carousel" // Use carousel variant for grid as it shows full details
                                    className="w-full"
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={<Sparkles className="h-8 w-8 text-muted-foreground" strokeWidth={1} />}
                            title="펀딩이 없습니다"
                            description="현재 선택한 카테고리에 해당하는 펀딩이 없습니다. 다른 필터를 선택해보세요."
                            action={
                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/explore')}
                                    className="border-black rounded-none font-bold text-xs"
                                >
                                    위시리스트 보러가기
                                </Button>
                            }
                        />
                    )}

                    {/* Pagination Placeholder */}
                    {!isLoading && fundings.length > 0 && (
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
