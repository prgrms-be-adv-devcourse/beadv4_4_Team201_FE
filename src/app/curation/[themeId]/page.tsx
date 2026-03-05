'use client';

import { use } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { CurationIntro } from '@/features/curation/components/CurationIntro';
import { AsymmetricGrid } from '@/features/curation/components/AsymmetricGrid';

// Mock data for themes
const THEMES: Record<string, any> = {
    'birthday-men': {
        title: "For Him: 센스 있는 생일 선물",
        subtitle: "CURATION Vol.1",
        description: "실용적이면서도 취향을 드러내는 아이템들.\n20대 후반, 30대 초반 남성들이 받고 싶어하는 선물만 모았습니다. 실패 없는 선택을 위해 MD가 직접 엄선한 리스트를 확인해보세요.",
        image: "https://images.unsplash.com/photo-1488161628813-99bbb519db92?q=80&w=2940&auto=format&fit=crop",
        products: [
            { id: '1', name: 'Leica Q2 Monochrom', brandName: 'LEICA', price: 8900000, imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', editorial: '사진을 좋아하는 그에게 최고의 선택' },
            { id: '2', name: 'Classic Leather Wallet', brandName: 'BOTTEGA VENETA', price: 650000, imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80', editorial: '오래 쓸수록 멋이 나는 가죽' },
            { id: '3', name: 'Aesop Resurrection Hand Balm', brandName: 'AESOP', price: 39000, imageUrl: 'https://images.unsplash.com/photo-1571781926291-28b050d5f8af?w=800&q=80' },
            { id: '4', name: 'Marshall Stanmore II', brandName: 'MARSHALL', price: 560000, imageUrl: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=800&q=80' },
            { id: '5', name: 'Mechanical Keyboard k2', brandName: 'KEYCHRON', price: 139000, imageUrl: 'https://images.unsplash.com/photo-1587829741301-3512462f808c?w=800&q=80' },
            { id: '6', name: 'Nike Killshot 2', brandName: 'NIKE', price: 109000, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', editorial: '어떤 룩에도 잘 어울리는 데일리 슈즈' },
            { id: '7', name: 'Coffee Drip Set', brandName: 'BLUE BOTTLE', price: 85000, imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80' },
            { id: '8', name: 'Perfume Tam Dao', brandName: 'DIPTYQUE', price: 210000, imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80' },
        ]
    },
    'housewarming': {
        title: "New Beginning: 집들이 선물",
        subtitle: "CURATION Vol.2",
        description: "새로운 시작을 응원하는 마음을 담았습니다.\n공간을 채우는 오브제부터 실용적인 가전까지, 집주인의 센스를 높여줄 아이템들을 만나보세요.",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=2940&q=80",
        products: [
            { id: '9', name: 'Balmuda The Toaster', brandName: 'BALMUDA', price: 319000, imageUrl: 'https://images.unsplash.com/photo-1584269600519-112d071b35e6?w=800&q=80', editorial: '죽은 빵도 살려내는 마법의 토스터' },
            { id: '10', name: 'Room Spray', brandName: 'AESOP', price: 63000, imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80' },
            { id: '11', name: 'Table Lamp', brandName: 'ARTEMIDE', price: 450000, imageUrl: 'https://images.unsplash.com/photo-1507473888900-52e1ad2d69b4?w=800&q=80', editorial: '공간의 분위기를 결정하는 조명' },
            { id: '12', name: 'Wine Glasses Set', brandName: 'RIEDEL', price: 89000, imageUrl: 'https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?w=800&q=80' },
            { id: '13', name: 'Diffuser', brandName: 'JO MALONE', price: 125000, imageUrl: 'https://images.unsplash.com/photo-1620917670397-a361ef909995?w=800&q=80' },
            { id: '14', name: 'Cutlery Set', brandName: 'SABRE', price: 156000, imageUrl: 'https://images.unsplash.com/photo-1584346133934-a3afd2a2d28e?w=800&q=80' },
        ]
    }
};

export function CurationContent({ themeId }: { themeId: string }) {
    const theme = THEMES[themeId] || THEMES['birthday-men'];

    return (
        <AppShell
            headerVariant="main"
            showBottomNav={false}
        >
            <CurationIntro
                title={theme.title}
                subtitle={theme.subtitle}
                description={theme.description}
                imageUrl={theme.image}
            />

            <AsymmetricGrid products={theme.products} />

            {/* Editor's Note Section */}
            <div className="bg-[#f4f4f4] py-24 my-12">
                <div className="max-w-screen-md mx-auto px-6 text-center">
                    <h3 className="text-2xl font-bold mb-6">Editor&apos;s Note</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        &ldquo;선물은 물건을 주는 것이 아니라, 마음을 전하는 것입니다.<br />
                        받는 분의 취향을 가장 잘 아는 당신의 선택이<br />
                        가장 완벽한 선물이 될 것입니다.&rdquo;
                    </p>
                    <div className="mt-8">
                        <span className="text-sm font-medium tracking-widest uppercase text-muted-foreground">Giftify Curator</span>
                    </div>
                </div>
            </div>

            <Footer />
        </AppShell>
    );
}

export default function CurationPage({ params }: { params: Promise<{ themeId: string }> }) {
    const container = use(params);
    const { themeId } = container;
    return <CurationContent themeId={themeId} />;
}
