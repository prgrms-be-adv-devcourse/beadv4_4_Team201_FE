'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { FundingCard } from '@/components/common/FundingCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InlineError } from '@/components/common/InlineError';
import { useMyParticipatedFundings } from '@/features/funding/hooks/useFunding';
import type { FundingStatus } from '@/types/funding';

export default function ParticipatedFundingsPage() {
    const [status, setStatus] = useState<FundingStatus | undefined>(undefined);

    const { data, isLoading, isError, refetch } = useMyParticipatedFundings({ status });

    return (
        <AppShell
            headerTitle="참여한 펀딩"
            headerVariant="detail"
            hasBack={true}
            showBottomNav={false}
        >
            <div className="p-4 space-y-4">
                <Tabs defaultValue="all" onValueChange={(value) => {
                    setStatus(value === 'all' ? undefined : value as FundingStatus);
                }}>
                    <TabsList className="w-full grid grid-cols-4">
                        <TabsTrigger value="all">전체</TabsTrigger>
                        <TabsTrigger value="IN_PROGRESS">진행중</TabsTrigger>
                        <TabsTrigger value="ACHIEVED">달성</TabsTrigger>
                        <TabsTrigger value="ACCEPTED">완료</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-4 space-y-4">
                        <FundingList data={data} isLoading={isLoading} isError={isError} onRetry={() => refetch()} />
                    </TabsContent>
                    <TabsContent value="IN_PROGRESS" className="mt-4 space-y-4">
                        <FundingList data={data} isLoading={isLoading} isError={isError} onRetry={() => refetch()} />
                    </TabsContent>
                    <TabsContent value="ACHIEVED" className="mt-4 space-y-4">
                        <FundingList data={data} isLoading={isLoading} isError={isError} onRetry={() => refetch()} />
                    </TabsContent>
                    <TabsContent value="ACCEPTED" className="mt-4 space-y-4">
                        <FundingList data={data} isLoading={isLoading} isError={isError} onRetry={() => refetch()} />
                    </TabsContent>
                </Tabs>

                <Footer />
            </div>
        </AppShell>
    );
}

function FundingList({ data, isLoading, isError, onRetry }: {
    data: any;
    isLoading: boolean;
    isError: boolean;
    onRetry: () => void;
}) {
    if (isLoading) {
        return (
            <>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="aspect-square w-full rounded-lg" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                ))}
            </>
        );
    }

    if (isError || !data) {
        return (
            <div className="py-12 flex flex-col items-center">
                <InlineError
                    message="펀딩 목록을 불러올 수 없습니다."
                    onRetry={onRetry}
                />
            </div>
        );
    }

    if (data.items.length === 0) {
        return (
            <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">
                    참여한 펀딩이 없습니다.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {data.items.map((funding: any) => (
                <Link key={funding.id} href={`/fundings/participated/${funding.id}`} className="block">
                    <FundingCard funding={funding} variant="list" />
                </Link>
            ))}
        </div>
    );
}
