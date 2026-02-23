'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { WelcomeSection } from '@/features/home/components/WelcomeSection';
import { MyFundingsSection } from '@/features/home/components/MyFundingsSection';
import { PopularProductsSection } from '@/features/home/components/PopularProductsSection';
import { HomePageSkeleton } from '@/features/home/components/HomePageSkeleton';
import { Separator } from '@/components/ui/separator';
import { useHomeData } from '@/features/home/hooks/useHomeData';
import { InlineError } from '@/components/common/InlineError';

export function HomePageClient() {
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
                <InlineError
                    error={error}
                    onRetry={() => refetch()}
                    fullPage
                />
            </AppShell>
        );
    }

    if (!data) {
        return null;
    }

    const isGuest = !data.member;

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
                {/* Content switching based on Auth status */}
                {!isGuest && (
                    <>
                        <MyFundingsSection fundings={data.myFundings} />
                        <Separator className="h-2 bg-secondary/30" />
                    </>
                )}

                <PopularProductsSection
                    products={data.recommendedProducts || []}
                    title="MD's Pick"
                    subtitle="Recommendation"
                />

                <Separator className="h-2 bg-secondary/30" />

                <PopularProductsSection
                    products={data.hotProducts || []}
                    title="인기 급상승"
                    subtitle="Trending"
                />

                <Separator className="h-2 bg-secondary/30" />

                {/* Popular Products */}
                <PopularProductsSection products={data.popularProducts} />

                <Separator className="h-2 bg-secondary/30" />

                {/* Discovery Section */}
                <div className="py-16 px-8 max-w-screen-2xl mx-auto w-full">
                    <h2 className="text-2xl font-bold tracking-tight mb-8">Discover Giftify</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* 1. Curation */}
                        <Link href="/curation/birthday-men" className="group relative aspect-[4/3] md:aspect-auto md:h-80 overflow-hidden bg-black">
                            <Image
                                src="https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1200"
                                alt="Curation"
                                fill
                                className="object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-6 text-center">
                                <span className="text-sm font-bold tracking-widest uppercase mb-2 border-b border-white pb-1">Curation</span>
                                <h3 className="text-xl md:text-2xl font-semibold">MD's Pick for Him</h3>
                            </div>
                        </Link>

                        {/* 2. Review Snap */}
                        <Link href="/products" className="group relative aspect-[4/3] md:aspect-auto md:h-80 overflow-hidden bg-black">
                            <Image
                                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200"
                                alt="Reviews"
                                fill
                                className="object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-6 text-center">
                                <span className="text-sm font-bold tracking-widest uppercase mb-2 border-b border-white pb-1">Review Snap</span>
                                <h3 className="text-xl md:text-2xl font-semibold">Real Styles</h3>
                            </div>
                        </Link>

                        {/* 3. User Home (Example) */}
                        <Link href="/u/user-1" className="group relative aspect-[4/3] md:aspect-auto md:h-80 overflow-hidden bg-black">
                            <Image
                                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200"
                                alt="User Home"
                                fill
                                className="object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-6 text-center">
                                <span className="text-sm font-bold tracking-widest uppercase mb-2 border-b border-white pb-1">Showroom</span>
                                <h3 className="text-xl md:text-2xl font-semibold">Giftify Curator</h3>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <Footer />
            </div>
        </AppShell>
    );
}
