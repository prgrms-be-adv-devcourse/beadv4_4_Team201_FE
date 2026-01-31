'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useProfile } from '@/features/profile/hooks/useProfile';

export function WelcomeSection() {
    const { user, isLoading: isAuthLoading } = useUser();
    const { data: member, isLoading: isProfileLoading } = useProfile();

    const isLoading = isAuthLoading || isProfileLoading;

    if (isLoading) {
        return (
            <section className="px-4 py-8 md:px-8">
                <div className="h-16 animate-pulse bg-secondary" />
            </section>
        );
    }

    if (!user) {
        return (
            <section className="px-4 py-8 md:px-8">
                <div className="border-b border-border pb-8">
                    <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                        Better choice
                        <br />
                        Better gift
                    </h1>
                    <p className="mt-3 text-sm text-muted-foreground">
                        친구들과 함께하는 특별한 선물 경험
                    </p>
                    <div className="mt-6 flex gap-3">
                        <Button asChild size="lg">
                            <a href="/auth/login">로그인</a>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link href="/products">둘러보기</Link>
                        </Button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="px-4 py-8 md:px-8">
            <div className="border-b border-border pb-8">
                <p className="text-sm text-muted-foreground">Welcome back</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                    {member?.nickname || user.name || user.nickname || '친구'}님,
                    <br />
                    오늘의 선물을 찾아보세요
                </h1>
            </div>
        </section>
    );
}
