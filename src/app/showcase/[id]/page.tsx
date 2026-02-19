'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { ShowcaseHero } from '@/features/showcase/components/ShowcaseHero';
import { ShowcaseStory } from '@/features/showcase/components/ShowcaseStory';
import { ShowcaseProduct } from '@/features/showcase/components/ShowcaseProduct';
import { useFunding } from '@/features/funding/hooks/useFunding';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Mock content for showcase (In a real app, this would come from an API)
const showcaseContents: Record<string, any> = {
    'default': {
        hero: {
            title: "소중한 마음을 전하는\n가장 특별한 방법",
            subtitle: "SPECIAL FUNDING PRODUCT",
            image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=2894&auto=format&fit=crop"
        },
        stories: [
            {
                title: "일상에 스며드는 편안함",
                description: "우리의 일상은 작은 순간들이 모여 만들어집니다.\n편안한 휴식을 위한 완벽한 선물을 준비했습니다. 친구의 지친 하루를 위로해줄 따뜻한 마음을 전해보세요.",
                image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2940&auto=format&fit=crop",
                position: "left"
            },
            {
                title: "브랜드의 철학을 담다",
                description: "타협하지 않는 품질과 시간이 지나도 변하지 않는 가치.\n우리가 엄선한 이 제품은 단순한 물건이 아닙니다. 당신의 안목과 정성을 대변하는 매개체입니다.",
                image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2940&auto=format&fit=crop",
                position: "right"
            },
            {
                title: "함께 만드는 기적",
                description: "혼자서는 부담스러울 수 있지만, 함께라면 가능합니다.\n우리의 작은 마음들이 모여 친구에게 잊지 못할 감동을 선물할 수 있습니다.",
                image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2940&auto=format&fit=crop",
                isFullWidth: true
            }
        ]
    }
};

import { Funding } from '@/types/funding';

export function ShowcaseContent({ id }: { id: string }) {
    const router = useRouter();
    const { data: realFunding, isLoading } = useFunding(id);

    // Creates a fallback mock funding object if real data fails or loading finishes with no data
    // This ensures showcase pages work for mocked IDs from the Special page
    const funding: Funding | undefined = realFunding || {
        id: id,
        wishItemId: `wi-${id}`,
        organizerId: 'mock-organizer',
        organizer: { id: 'mock-organizer', nickname: 'Giftify MD', avatarUrl: '' },
        recipientId: 'mock-recipient',
        recipient: { id: 'mock-recipient', nickname: '소중한 친구', avatarUrl: '' },
        product: {
            id: `p-${id}`,
            name: `Special Funding Item ${id}`,
            price: 250000,
            imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
            status: 'ON_SALE'
        },
        targetAmount: 250000,
        currentAmount: 128000,
        status: 'IN_PROGRESS',
        participantCount: 15,
        expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
        createdAt: new Date().toISOString()
    };

    if (isLoading && !realFunding) {
        return (
            <div className="h-screen bg-white flex flex-col items-center justify-center animate-pulse">
                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium tracking-widest uppercase">Loading Product</p>
            </div>
        );
    }

    // Use default content for now as we don't have showcase-specific data in API
    const content = showcaseContents['default'];

    return (
        <AppShell
            showBottomNav={false}
            showHeader={false}
        >
            <div className="relative animate-in fade-in duration-700">
                {/* Custom Floating Back Button */}
                <div className="fixed top-6 left-6 z-50 mix-blend-difference text-white">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-white/20 text-white transition-colors"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
                    </Button>
                </div>

                <ShowcaseHero
                    title={content.hero.title}
                    subtitle={content.hero.subtitle}
                    imageUrl={content.hero.image}
                />

                <div className="bg-white">
                    {content.stories.map((story: any, index: number) => (
                        <ShowcaseStory
                            key={index}
                            title={story.title}
                            description={story.description}
                            imageUrl={story.image}
                            imagePosition={story.position}
                            isFullWidth={story.isFullWidth}
                        />
                    ))}
                </div>

                <ShowcaseProduct
                    funding={funding}
                    onParticipate={() => router.push(`/fundings/${id}`)}
                />

                <Footer />
            </div>
        </AppShell>
    );
}

export default function ShowcasePage({ params }: { params: Promise<{ id: string }> }) {
    const container = use(params);
    const { id } = container;
    return <ShowcaseContent id={id} />;
}
