'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { WishItemCard, WishItemStatus } from '@/components/common/WishItemCard';
import { WishlistHeader, Visibility } from '@/features/wishlist/components/WishlistHeader';
import { AddItemDrawer } from '@/features/wishlist/components/AddItemDrawer';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Mock Data
const MOCK_ITEMS = [
    {
        id: '1',
        product: {
            name: 'Sony WH-1000XM5',
            imageUrl: '/images/placeholder-product-3.jpg',
            price: 450000,
        },
        status: 'AVAILABLE' as WishItemStatus,
        addedAt: new Date().toISOString(),
    },
    {
        id: '2',
        product: {
            name: 'iPad Air 5세대',
            imageUrl: '/images/placeholder-product-4.jpg',
            price: 920000,
        },
        status: 'IN_FUNDING' as WishItemStatus,
        funding: {
            id: 'f1',
            currentAmount: 460000,
            targetAmount: 920000,
            participantCount: 8,
        },
        addedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: '3',
        product: {
            name: '스타벅스 텀블러',
            imageUrl: '/images/placeholder-product-5.jpg',
            price: 45000,
        },
        status: 'FUNDED' as WishItemStatus,
        fundedAt: new Date(Date.now() - 100000000).toISOString(),
        addedAt: new Date(Date.now() - 200000000).toISOString(),
    }
];

export default function MyWishlistPage() {
    const [visibility, setVisibility] = useState<Visibility>('PUBLIC');

    return (
        <AppShell
            headerTitle="내 위시리스트"
            headerVariant="detail"
            showBottomNav={true}
        // Right action could be settings or share
        >
            <WishlistHeader
                isOwner={true}
                itemCount={MOCK_ITEMS.length}
                visibility={visibility}
                onVisibilityChange={setVisibility}
            />

            <Separator />

            <div className="flex flex-col gap-4 p-4 pb-24">
                {/* pb-24 to avoid FAB overlap */}
                {MOCK_ITEMS.map((item) => (
                    <WishItemCard
                        key={item.id}
                        item={item}
                        isOwner={true}
                        onAction={() => console.log('Action for', item.id)}
                    />
                ))}
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-20 left-0 right-0 flex justify-center px-4 z-40 pointer-events-none">
                <AddItemDrawer onAdd={(item) => console.log('Added', item)}>
                    <Button
                        size="lg"
                        className="w-full max-w-sm shadow-xl rounded-full pointer-events-auto h-12 text-base"
                    >
                        <Plus className="mr-2 h-5 w-5" /> 위시 추가하기
                    </Button>
                </AddItemDrawer>
            </div>
        </AppShell>
    );
}
