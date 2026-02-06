'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { WishlistHeader } from '@/features/wishlist/components/WishlistHeader';
import { AccessDeniedView } from '@/features/wishlist/components/AccessDeniedView';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { useWishlist } from '@/features/wishlist/hooks/useWishlist';
import { WishItem } from '@/types/wishlist';
import { Gift, Users, ChevronRight, Sparkles, PartyPopper } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface FriendWishlistPageProps {
    params: Promise<{
        userId: string;
    }>;
}

export default function FriendWishlistPage({ params }: FriendWishlistPageProps) {
    const { userId } = use(params);
    const router = useRouter();
    const { data: wishlist, isLoading, error } = useWishlist(userId);
    const [selectedItem, setSelectedItem] = useState<WishItem | null>(null);
    const [isStartFundingOpen, setIsStartFundingOpen] = useState(false);

    const handleViewFunding = (fundingId: string) => {
        router.push(`/fundings/${fundingId}`);
    };

    const handleStartFundingClick = (item: WishItem) => {
        if (item.fundingId) {
            // 이미 진행 중인 펀딩이 있으면 해당 펀딩으로 이동
            router.push(`/fundings/${item.fundingId}`);
        } else {
            // 새로운 펀딩 개설을 위한 다이얼로그 열기
            setSelectedItem(item);
            setIsStartFundingOpen(true);
        }
    };

    const handleConfirmStartFunding = async () => {
        if (!selectedItem) return;
        
        try {
            // TODO: API 호출로 펀딩 생성
            // const funding = await createFunding({ wishItemId: selectedItem.id });
            // router.push(`/fundings/${funding.id}`);
            
            toast.success('펀딩이 개설되었습니다!');
            setIsStartFundingOpen(false);
            
            // 임시로 펀딩 목록 페이지로 이동
            router.push('/fundings/organized');
        } catch (error) {
            toast.error('펀딩 개설에 실패했습니다');
        }
    };

    // Group items by status
    const groupedItems = {
        AVAILABLE: wishlist?.items.filter(item => item.status === 'AVAILABLE') || [],
        IN_FUNDING: wishlist?.items.filter(item => item.status === 'IN_FUNDING') || [],
        FUNDED: wishlist?.items.filter(item => item.status === 'FUNDED') || [],
    };

    // Loading state
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

    // Error handling
    if (error) {
        const is403 = error instanceof Error && error.message.includes('403');
        if (is403) {
            return (
                <AppShell headerTitle="위시리스트" headerVariant="detail" showBottomNav={false}>
                    <AccessDeniedView />
                </AppShell>
            );
        }
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

    // No data
    if (!wishlist || wishlist.items.length === 0) {
        return (
            <AppShell headerTitle="위시리스트" headerVariant="detail" showBottomNav={false}>
                <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8">
                    <WishlistHeader
                        isOwner={false}
                        itemCount={0}
                        visibility={wishlist?.visibility || 'PUBLIC'}
                        ownerName={wishlist?.member.nickname || '사용자'}
                    />
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
                {/* Friend Profile Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                        {wishlist.member.nickname?.charAt(0) || '?'}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{wishlist.member.nickname}님의 위시리스트</h1>
                        <p className="text-muted-foreground">
                            {wishlist.itemCount}개의 아이템 · {groupedItems.IN_FUNDING.length}개 펀딩 진행중
                        </p>
                    </div>
                </div>

                {/* 펀딩 진행중 섹션 */}
                {groupedItems.IN_FUNDING.length > 0 && (
                    <section className="mb-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-orange-500" />
                            <h2 className="text-lg font-bold">펀딩 진행중</h2>
                            <Badge variant="secondary" className="ml-2">{groupedItems.IN_FUNDING.length}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {groupedItems.IN_FUNDING.map((item) => (
                                <FundingCard
                                    key={item.id}
                                    item={item}
                                    onParticipate={() => item.fundingId && handleViewFunding(item.fundingId)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* 펀딩 가능 섹션 */}
                {groupedItems.AVAILABLE.length > 0 && (
                    <section className="mb-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Gift className="w-5 h-5 text-blue-500" />
                            <h2 className="text-lg font-bold">펀딩 시작하기</h2>
                            <Badge variant="outline" className="ml-2">{groupedItems.AVAILABLE.length}</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-4">
                            친구가 갖고 싶어하는 선물이에요. 펀딩을 개설해서 함께 선물해보세요!
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {groupedItems.AVAILABLE.map((item) => (
                                <AvailableItemCard
                                    key={item.id}
                                    item={item}
                                    onStartFunding={() => handleStartFundingClick(item)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* 펀딩 완료 섹션 */}
                {groupedItems.FUNDED.length > 0 && (
                    <section className="mb-10">
                        <div className="flex items-center gap-2 mb-4">
                            <PartyPopper className="w-5 h-5 text-green-500" />
                            <h2 className="text-lg font-bold">펀딩 완료</h2>
                            <Badge variant="outline" className="ml-2">{groupedItems.FUNDED.length}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                            {groupedItems.FUNDED.map((item) => (
                                <FundedItemCard key={item.id} item={item} />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* 펀딩 개설 확인 다이얼로그 */}
            <Dialog open={isStartFundingOpen} onOpenChange={setIsStartFundingOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>펀딩 개설하기</DialogTitle>
                        <DialogDescription>
                            {wishlist.member.nickname}님을 위한 펀딩을 개설하시겠습니까?
                        </DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="relative w-20 h-20 rounded-md overflow-hidden bg-gray-100">
                                <Image
                                    src={selectedItem.product.imageUrl || '/images/placeholder-product.svg'}
                                    alt={selectedItem.product.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <h4 className="font-medium">{selectedItem.product.name}</h4>
                                <p className="text-lg font-bold">{formatCurrency(selectedItem.product.price)}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsStartFundingOpen(false)}>
                            취소
                        </Button>
                        <Button onClick={handleConfirmStartFunding}>
                            <Gift className="w-4 h-4 mr-2" />
                            펀딩 개설하기
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Footer />
        </AppShell>
    );
}

// 펀딩 진행중 카드 - WishItem에 funding 정보가 없으므로 간략하게 표시
function FundingCard({ item, onParticipate }: { item: WishItem; onParticipate: () => void }) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={onParticipate}>
            <div className="relative aspect-square bg-gray-100">
                <Image
                    src={item.product.imageUrl || '/images/placeholder-product.svg'}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                />
                <div className="absolute top-2 right-2">
                    <Badge className="bg-orange-500">펀딩중</Badge>
                </div>
            </div>
            <div className="p-4 space-y-3">
                <h3 className="font-medium line-clamp-1">{item.product.name}</h3>
                <div className="text-lg font-bold">{formatCurrency(item.product.price)}</div>
                
                <p className="text-sm text-muted-foreground">
                    <Users className="w-4 h-4 inline mr-1" />
                    펀딩이 진행중입니다
                </p>
                
                <Button className="w-full" onClick={(e) => { e.stopPropagation(); onParticipate(); }}>
                    펀딩 참여하기
                </Button>
            </div>
        </Card>
    );
}

// 펀딩 가능 카드
function AvailableItemCard({ item, onStartFunding }: { item: WishItem; onStartFunding: () => void }) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative aspect-square bg-gray-100">
                <Image
                    src={item.product.imageUrl || '/images/placeholder-product.svg'}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="p-4 space-y-3">
                <h3 className="font-medium line-clamp-1">{item.product.name}</h3>
                <div className="text-lg font-bold">{formatCurrency(item.product.price)}</div>
                <p className="text-sm text-muted-foreground">
                    추가된 날: {new Date(item.createdAt).toLocaleDateString('ko-KR')}
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

// 펀딩 완료 카드
function FundedItemCard({ item }: { item: WishItem }) {
    return (
        <Card className="overflow-hidden">
            <div className="relative aspect-square bg-gray-100 grayscale">
                <Image
                    src={item.product.imageUrl || '/images/placeholder-product.svg'}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Badge className="bg-green-600 text-lg py-1 px-3">
                        <PartyPopper className="w-4 h-4 mr-2" />
                        펀딩 완료!
                    </Badge>
                </div>
            </div>
            <div className="p-4">
                <h3 className="font-medium line-clamp-1 text-muted-foreground">{item.product.name}</h3>
                <div className="text-lg font-bold text-muted-foreground">{formatCurrency(item.product.price)}</div>
            </div>
        </Card>
    );
}
