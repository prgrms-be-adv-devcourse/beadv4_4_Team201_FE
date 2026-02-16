'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { Megaphone, Users, Gift } from 'lucide-react';

const FUNDING_MENU = [
    {
        href: '/fundings/participated',
        icon: Users,
        title: '참여한 펀딩',
        description: '내가 참여한 펀딩 목록',
    },
    {
        href: '/fundings/received',
        icon: Gift,
        title: '받은 펀딩',
        description: '나에게 도착한 펀딩 목록',
    },
];

export default function MyFundingsPage() {
    return (
        <AppShell
            headerTitle="내 펀딩"
            headerVariant="detail"
            hasBack={true}
            showBottomNav={false}
        >
            <div className="p-4 space-y-3">
                {FUNDING_MENU.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                        <div className="rounded-full bg-primary/10 p-3">
                            <item.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                    </Link>
                ))}
            </div>

            <Footer />
        </AppShell>
    );
}
