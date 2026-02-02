'use client';

import { use, useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { UserHomeHero } from '@/features/user-home/components/UserHomeHero';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FundingCard } from '@/components/common/FundingCard';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useMyOrganizedFundings } from '@/features/funding/hooks/useFunding';
import { Loader2 } from 'lucide-react';

export function UserHomeContent({ userId }: { userId: string }) {
    const { data: profile, isLoading: isProfileLoading } = useProfile();
    const { data: fundingsResponse, isLoading: isFundingsLoading } = useMyOrganizedFundings();

    const user = useMemo(() => {
        if (!profile) return null;
        return {
            id: profile.id.toString(),
            nickname: profile.nickname || 'Unknown',
            description: "안녕하세요. 취향을 공유하는 펀딩을 만듭니다.",
            avatarUrl: profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
            coverImageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80',
            followerCount: 0,
            isFollowing: false,
        };
    }, [profile]);

    const fundings = fundingsResponse?.items || [];
    
    const ongoingFundings = fundings.filter(f => f.status === 'IN_PROGRESS');
    const endedFundings = fundings.filter(f => f.status !== 'IN_PROGRESS');

    if (isProfileLoading || isFundingsLoading) {
        return (
            <AppShell headerVariant="main">
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" strokeWidth={1.5} />
                </div>
            </AppShell>
        );
    }

    if (!user) {
        return (
            <AppShell headerVariant="main">
                <div className="flex items-center justify-center h-96">
                    <p className="text-muted-foreground">사용자 정보를 찾을 수 없습니다.</p>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell
            headerVariant="main"
            showBottomNav={false}
        >
            <UserHomeHero user={user} />

            <div className="max-w-screen-2xl mx-auto px-8 pb-24">
                <Tabs defaultValue="ongoing" className="w-full">
                    <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-8 mb-8">
                        <TabsTrigger
                            value="ongoing"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-0 py-3 font-medium hover:text-black transition-colors"
                        >
                            진행중인 펀딩 <span className="ml-1 text-xs text-muted-foreground font-normal">{ongoingFundings.length}</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="ended"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-0 py-3 font-medium hover:text-black transition-colors"
                        >
                            종료된 펀딩 <span className="ml-1 text-xs text-muted-foreground font-normal">{endedFundings.length}</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="reviews"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-0 py-3 font-medium hover:text-black transition-colors"
                        >
                            받은 후기 <span className="ml-1 text-xs text-muted-foreground font-normal">0</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="ongoing" className="mt-0">
                        {ongoingFundings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {ongoingFundings.map(funding => (
                                    <FundingCard key={funding.id} funding={funding as any} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center text-muted-foreground">
                                진행중인 펀딩이 없습니다.
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="ended" className="mt-0">
                        {endedFundings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {endedFundings.map(funding => (
                                    <FundingCard key={funding.id} funding={funding as any} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center text-muted-foreground">
                                종료된 펀딩이 없습니다.
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="reviews" className="mt-0">
                        <div className="py-24 text-center text-muted-foreground">
                            받은 후기가 없습니다.
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <Footer />
        </AppShell>
    );
}

export default function UserHomePage({ params }: { params: Promise<{ userId: string }> }) {
    const container = use(params);
    const { userId } = container;
    return <UserHomeContent userId={userId} />;
}

