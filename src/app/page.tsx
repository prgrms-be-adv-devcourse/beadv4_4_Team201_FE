'use client';

import { AppShell } from '@/components/layout/AppShell';
import { WelcomeSection } from '@/features/home/components/WelcomeSection';
import { MyFundingsSection } from '@/features/home/components/MyFundingsSection';
import { FriendsWishlistSection } from '@/features/home/components/FriendsWishlistSection';
import { PopularProductsSection } from '@/features/home/components/PopularProductsSection';
import { HomePageSkeleton } from '@/features/home/components/HomePageSkeleton';
import { Separator } from '@/components/ui/separator';
import { useHomeData } from '@/features/home/hooks/useHomeData';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function HomePage() {
  const { data, isLoading, isError, error, refetch } = useHomeData();

  if (isLoading) {
    return (
      <AppShell
        headerVariant="main"
        showHeader={true}
        showBottomNav={false}
      >
        <HomePageSkeleton />
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell
        headerVariant="main"
        showHeader={true}
        showBottomNav={false}
      >
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>데이터를 불러올 수 없습니다</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p className="text-sm">
                {error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-2"
              >
                다시 시도
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </AppShell>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <AppShell
      headerVariant="main"
      showHeader={true}
      showBottomNav={false}
    >
      <div className="flex flex-col min-h-full">
        {/* Welcome Greeting */}
        <WelcomeSection />

        <Separator className="h-2 bg-secondary/30" />

        {/* My Active Fundings */}
        <MyFundingsSection fundings={data.myFundings} />

        <Separator className="h-2 bg-secondary/30" />

        {/* Friends' Wishlists */}
        <FriendsWishlistSection friendsWishlists={data.friendsWishlists} />

        <Separator className="h-2 bg-secondary/30" />

        {/* Popular Products */}
        <PopularProductsSection products={data.popularProducts} />
      </div>
    </AppShell>
  );
}
