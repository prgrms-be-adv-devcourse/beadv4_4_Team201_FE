'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { AccessDeniedView } from '@/features/wishlist/components/AccessDeniedView';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { usePublicWishlist } from '@/features/wishlist/hooks/useWishlist';
import { CreateFundingModal } from '@/features/funding/components/CreateFundingModal';
import { Gift } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';

import type { PublicWishlistItem } from '@/types/wishlist';

interface FriendWishlistPageProps {
    params: Promise<{
        userId: string;
    }>;
}

export default function FriendWishlistPage({ params }: FriendWishlistPageProps) {
    const { userId } = use(params);
    const router = useRouter();
    const { data: wishlist, isLoading, error } = usePublicWishlist(userId);
    const [selectedItem, setSelectedItem] = useState<PublicWishlistItem | null>(null);
    const [isStartFundingOpen, setIsStartFundingOpen] = useState(false);

    const handleStartFundingClick = (item: PublicWishlistItem) => {
        setSelectedItem(item);
        setIsStartFundingOpen(true);
    };

    if (isLoading) {
        return (
            <AppShell headerTitle="위시리스트" headerVariant="detail" showBottomNav={false}>
                <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8">
                    <div className="space-y-6">
                        <Skeleton className="h-24 w-full" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <Skeleton key={i} className="h-64 w-full" />
                            ))}
                        </div>
                    </div>
                </div>
            </AppShell>
        );
    }

    if (error) {
        return (
            <AppShell headerTitle="위시리스트" headerVariant="detail" showBottomNav={false}>
                <div className="flex items-center justify-center min-h-[50vh] p-4">
                    <div className="text-center space-y-4">
                        <p className="text-lg font-medium text-destructive">위시리스트를 불러올 수 없습니다</p>
                        <Button onClick={() => window.location.reload()} variant="outline">새로고침</Button>
                    </div>
                </div>
            </AppShell>
        );
    }

    if (!wishlist) {
        return (
            <AppShell headerTitle="위시리스트" headerVariant="detail" showBottomNav={false}>
                <AccessDeniedView />
            </AppShell>
        );
    }

    if (wishlist.items.length === 0) {
        return (
            <AppShell headerTitle="위시리스트" headerVariant="detail" showBottomNav={false}>
                <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                            {wishlist.nickname.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{wishlist.nickname}님의 위시리스트</h1>
                            <p className="text-muted-foreground">0개의 아이템</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
                        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <Gift className="w-12 h-12 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-medium mb-2">아직 위시 아이템이 없어요</h2>
                        <p className="text-muted-foreground">친구가 위시리스트에 상품을 추가하면 여기에 표시됩니다</p>
                    </div>
                </div>
                <Footer />
            </AppShell>
        );
    }

    return (
        <AppShell headerTitle="위시리스트" headerVariant="detail" showBottomNav={false}>
            <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                        {wishlist.nickname.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{wishlist.nickname}님의 위시리스트</h1>
                        <p className="text-muted-foreground">
                            {wishlist.items.length}개의 아이템
                        </p>
                    </div>
                </div>

                <section className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Gift className="w-5 h-5 text-blue-500" />
                        <h2 className="text-lg font-bold">위시 아이템</h2>
                        <Badge variant="outline" className="ml-2">{wishlist.items.length}</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">
                        친구가 갖고 싶어하는 선물이에요. 펀딩을 개설해서 함께 선물해보세요!
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {wishlist.items.map((item) => (
                            <PublicItemCard
                                key={item.wishlistItemId}
                                item={item}
                                onStartFunding={() => handleStartFundingClick(item)}
                            />
                        ))}
                    </div>
                </section>
            </div>

            {selectedItem && (
                <CreateFundingModal
                    open={isStartFundingOpen}
                    onOpenChange={setIsStartFundingOpen}
                    wishItem={{
                        id: selectedItem.wishlistItemId,
                        product: {
                            name: selectedItem.productName,
                            price: selectedItem.price,
                            imageUrl: '',
                        },
                    }}
                    onSuccess={() => router.push('/cart')}
                />
            )}

            <Footer />
        </AppShell>
    );
}

function PublicItemCard({ item, onStartFunding }: { item: PublicWishlistItem; onStartFunding: () => void }) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
                <Gift className="w-16 h-16 text-gray-300" />
            </div>
            <div className="p-4 space-y-3">
                <h3 className="font-medium line-clamp-1">{item.productName}</h3>
                <div className="text-lg font-bold">{formatCurrency(item.price)}</div>
                <p className="text-sm text-muted-foreground">
                    추가된 날: {new Date(item.addedAt).toLocaleDateString('ko-KR')}
                </p>
                <Button
                    variant="outline"
                    className="w-full border-dashed hover:bg-primary hover:text-primary-foreground"
                    onClick={onStartFunding}
                >
                    <Gift className="w-4 h-4 mr-2" />
                    펀딩 개설하기
                </Button>
            </div>
        </Card>
    );
}
