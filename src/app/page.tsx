'use client';

import { AppShell } from '@/components/layout/AppShell';
import { WelcomeSection } from '@/features/home/components/WelcomeSection';
import { MyFundingsSection } from '@/features/home/components/MyFundingsSection';
import { FriendsWishlistSection } from '@/features/home/components/FriendsWishlistSection';
import { PopularProductsSection } from '@/features/home/components/PopularProductsSection';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  return (
    <AppShell
      headerVariant="main"
      showHeader={true}
      showBottomNav={true}
    >
      <div className="flex flex-col min-h-full">
        {/* Welcome Greeting */}
        <WelcomeSection />

        <Separator className="h-2 bg-secondary/30" />

        {/* My Active Fundings */}
        <MyFundingsSection />

        <Separator className="h-2 bg-secondary/30" />

        {/* Friends' Wishlists */}
        <FriendsWishlistSection />

        <Separator className="h-2 bg-secondary/30" />

        {/* Popular Products */}
        <PopularProductsSection />
      </div>
    </AppShell>
  );
}
