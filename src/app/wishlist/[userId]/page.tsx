'use client';

import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { WishItemCard, WishItemStatus } from '@/components/common/WishItemCard';
import { WishlistHeader } from '@/features/wishlist/components/WishlistHeader';
import { Separator } from '@/components/ui/separator';

const MOCK_FRIEND_ITEMS = [
    {
        id: 'f1',
        product: {
            name: '로지텍 MX Master 3S',
            imageUrl: '/images/placeholder-product-6.jpg',
            price: 129000,
        },
        status: 'AVAILABLE' as WishItemStatus,
        addedAt: new Date().toISOString(),
    },
    {
        id: 'f2',
        product: {
            name: 'Herman Miller Aeron',
            imageUrl: '/images/placeholder-product-7.jpg',
            price: 2100000,
        },
        status: 'IN_FUNDING' as WishItemStatus,
        funding: {
            id: 'fd2',
            currentAmount: 1500000,
            targetAmount: 2100000,
            participantCount: 12,
        },
        addedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    }
];

export default function FriendWishlistPage() {
    const params = useParams();
    const userId = params.userId as string;
    const friendName = '김철수'; // Mock: derived from userId

    return (
        <AppShell
            headerTitle={`${friendName}님의 위시리스트`}
            headerVariant="detail"
            hasBack={true}
            showBottomNav={true}
        >
            <WishlistHeader
                isOwner={false}
                ownerName={friendName}
                itemCount={MOCK_FRIEND_ITEMS.length}
                visibility="PUBLIC" // Friend's list is presumably visible if we are here
            />

            <Separator />

            <div className="flex flex-col gap-4 p-4">
                {MOCK_FRIEND_ITEMS.map((item) => (
                    <WishItemCard
                        key={item.id}
                        item={item}
                        isOwner={false} // Important: Friend view
                        onAction={() => {
                            if (item.status === 'AVAILABLE') {
                                console.log('Open Funding Create Modal');
                            } else if (item.status === 'IN_FUNDING') {
                                console.log('Go to Funding Detail');
                            }
                        }}
                    />
                ))}
            </div>
        </AppShell>
    );
}
