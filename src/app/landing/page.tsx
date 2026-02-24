import type { Metadata } from 'next';
import Link from 'next/link';
import { Gift, Heart, Users } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Giftify - 함께하는 선물 펀딩',
    description: '친구들과 함께 특별한 선물을 만들어보세요. 원하는 선물을 위시리스트에 추가하고, 친구들이 함께 펀딩하여 선물을 완성하세요.',
    openGraph: {
        title: 'Giftify - 함께하는 선물 펀딩',
        description: '친구들과 함께 특별한 선물을 만들어보세요.',
    },
};

const FEATURES = [
    {
        icon: Heart,
        title: '위시리스트',
        description: '갖고 싶은 선물을 위시리스트에 담아두세요. 친구들이 확인하고 펀딩할 수 있어요.',
    },
    {
        icon: Users,
        title: '함께 펀딩',
        description: '혼자 부담하기 어려운 선물도 여러 친구가 함께라면 가능해요.',
    },
    {
        icon: Gift,
        title: '특별한 선물',
        description: '정말 원하는 선물을 받을 수 있어요. 더 이상 마음에 안 드는 선물은 없습니다.',
    },
] as const;

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Hero */}
            <section className="flex flex-col items-center justify-center px-6 py-24 md:py-32 text-center">
                <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-4">
                    Gift Funding Platform
                </p>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
                    함께 만드는
                    <br />
                    특별한 선물
                </h1>
                <p className="text-lg text-muted-foreground max-w-md mb-10">
                    친구의 위시리스트를 확인하고, 함께 펀딩하여
                    <br className="hidden md:block" />
                    정말 원하는 선물을 완성하세요.
                </p>
                <Link
                    href="/api/auth/login"
                    className="inline-flex items-center justify-center h-12 px-8 text-sm font-medium bg-foreground text-background rounded-full hover:opacity-90 transition-opacity"
                >
                    시작하기
                </Link>
            </section>

            {/* Features */}
            <section className="px-6 py-16 md:py-24 border-t border-border">
                <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                    {FEATURES.map((feature) => (
                        <div key={feature.title} className="text-center">
                            <div className="flex items-center justify-center h-12 w-12 mx-auto mb-4 rounded-full bg-foreground/5">
                                <feature.icon className="h-5 w-5" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How it works */}
            <section className="px-6 py-16 md:py-24 border-t border-border">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-center mb-12">이렇게 사용해요</h2>
                    <div className="space-y-8">
                        {[
                            { step: '01', text: '위시리스트에 원하는 선물을 추가해요' },
                            { step: '02', text: '친구들에게 위시리스트를 공유해요' },
                            { step: '03', text: '친구들이 함께 펀딩하여 선물을 완성해요' },
                        ].map((item) => (
                            <div key={item.step} className="flex items-start gap-4">
                                <span className="text-sm font-mono text-muted-foreground shrink-0 pt-0.5">
                                    {item.step}
                                </span>
                                <p className="text-base">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="px-6 py-16 md:py-24 border-t border-border text-center">
                <h2 className="text-2xl font-bold mb-4">지금 시작해보세요</h2>
                <p className="text-sm text-muted-foreground mb-8">
                    무료로 시작할 수 있어요.
                </p>
                <Link
                    href="/api/auth/login"
                    className="inline-flex items-center justify-center h-12 px-8 text-sm font-medium bg-foreground text-background rounded-full hover:opacity-90 transition-opacity"
                >
                    무료로 시작하기
                </Link>
            </section>

            {/* Footer */}
            <footer className="px-6 py-8 border-t border-border text-center">
                <p className="text-xs text-muted-foreground">
                    Giftify
                </p>
            </footer>
        </div>
    );
}
