'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { WishItemCard } from '@/components/common/WishItemCard';
import { WishlistHeader } from '@/features/wishlist/components/WishlistHeader';
import { AccessDeniedView } from '@/features/wishlist/components/AccessDeniedView';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useWishlist } from '@/features/wishlist/hooks/useWishlist';
import { WishItem } from '@/types/wishlist';

interface FriendWishlistPageProps {
    params: Promise<{
        userId: string;
    }>;
}

export default function FriendWishlistPage({ params }: FriendWishlistPageProps) {
    const { userId } = use(params);
    const router = useRouter();
    const { data: wishlist, isLoading, error } = useWishlist(userId);

    const handleViewFunding = (fundingId: string) => {
        router.push(`/fundings/${fundingId}`);
    };

    const handleStartFunding = (item: WishItem) => {
        // Navigate to funding detail or create funding for friend's wish item
        // For now, if there's a fundingId, view it
        if (item.fundingId) {
            router.push(`/fundings/${item.fundingId}`);
        }
    };

    // Group items by status (filter out FUNDED for cleaner view)
    const groupedItems = {
        AVAILABLE: wishlist?.items.filter(item => item.status === 'AVAILABLE') || [],
        IN_FUNDING: wishlist?.items.filter(item => item.status === 'IN_FUNDING') || [],
        FUNDED: wishlist?.items.filter(item => item.status === 'FUNDED') || [],
    };

    // Loading state
    if (isLoading) {
        return (
            <AppShell
                headerTitle="위시리스트"
                headerVariant="detail"
                showBottomNav={false}
            >
                <div className="p-4 space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Separator />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </AppShell>
        );
    }

    // Error handling - check for 403 (private wishlist)
    if (error) {
        const is403 = error instanceof Error && error.message.includes('403');

        if (is403) {
            return (
                <AppShell
                    headerTitle="위시리스트"
                    headerVariant="detail"
                    showBottomNav={false}
                >
                    <AccessDeniedView />
                </AppShell>
            );
        }

        // Other errors
        return (
            <AppShell
                headerTitle="위시리스트"
                headerVariant="detail"
                showBottomNav={false}
            >
                <div className="flex items-center justify-center min-h-[50vh] p-4">
                    <div className="text-center space-y-2">
                        <p className="text-lg font-medium text-destructive">위시리스트를 불러올 수 없습니다</p>
                        <p className="text-sm text-muted-foreground">잠시 후 다시 시도해주세요</p>
                        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                            새로고침
                        </Button>
                    </div>
                </div>
            </AppShell>
        );
    }

    // No data
    if (!wishlist || wishlist.items.length === 0) {
        return (
            <AppShell
                headerTitle="위시리스트"
                headerVariant="detail"
                showBottomNav={false}
            >
                <WishlistHeader
                    isOwner={false}
                    itemCount={0}
                    visibility={wishlist?.visibility || 'PUBLIC'}
                    ownerName={wishlist?.member.nickname || '사용자'}
                />
                <Separator />
                <div className="flex items-center justify-center min-h-[50vh] p-4">
                    <div className="text-center space-y-2">
                        <p className="text-lg font-medium">위시 아이템이 없습니다</p>
                        <p className="text-sm text-muted-foreground">아직 추가된 위시 아이템이 없어요</p>
                    </div>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell
            headerTitle="위시리스트"
            headerVariant="detail"
            showBottomNav={false}
        >
            <WishlistHeader
                isOwner={false}
                itemCount={wishlist.itemCount}
                visibility={wishlist.visibility}
                ownerName={wishlist.member.nickname || undefined}
            />

            <Separator />

            <div className="flex flex-col gap-6 p-4 pb-24">
                {/* AVAILABLE items */}
                {groupedItems.AVAILABLE.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground">펀딩 가능</h3>
                        {groupedItems.AVAILABLE.map((item) => (
                            <WishItemCard
                                key={item.id}
                                item={{
                                    id: item.id,
                                    product: item.product,
                                    status: item.status,
                                    addedAt: item.createdAt,
                                }}
                                isOwner={false}
                                onAction={() => handleStartFunding(item)}
                            />
                        ))}
                    </div>
                )}

                {/* IN_FUNDING items */}
                {groupedItems.IN_FUNDING.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground">펀딩 진행중</h3>
                        {groupedItems.IN_FUNDING.map((item) => (
                            <WishItemCard
                                key={item.id}
                                item={{
                                    id: item.id,
                                    product: item.product,
                                    status: item.status,
                                    addedAt: item.createdAt,
                                }}
                                isOwner={false}
                                onAction={() => item.fundingId && handleViewFunding(item.fundingId)}
                            />
                        ))}
                    </div>
                )}

                {/* FUNDED items */}
                {groupedItems.FUNDED.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground">펀딩 완료</h3>
                        {groupedItems.FUNDED.map((item) => (
                            <WishItemCard
                                key={item.id}
                                item={{
                                    id: item.id,
                                    product: item.product,
                                    status: item.status,
                                    addedAt: item.createdAt,
                                }}
                                isOwner={false}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
