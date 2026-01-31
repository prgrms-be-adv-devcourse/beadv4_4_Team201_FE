'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Gift } from 'lucide-react';
import { FundingCard } from '@/components/common/FundingCard';
import { Button } from '@/components/ui/button';
import type { Funding } from '@/types/funding';

interface MyFundingsSectionProps {
    fundings: Funding[];
}

export function MyFundingsSection({ fundings }: MyFundingsSectionProps) {
    const router = useRouter();

    if (fundings.length === 0) {
        return (
            <section className="py-8">
                <div className="px-4 md:px-8 mb-6">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">My Fundings</p>
                    <h2 className="text-xl font-semibold tracking-tight mt-1">참여 중인 펀딩</h2>
                </div>

                <div className="mx-4 md:mx-8 border border-dashed border-border py-16 flex flex-col items-center">
                    <Gift className="h-8 w-8 text-muted-foreground mb-4" strokeWidth={1} />
                    <p className="text-sm font-medium">아직 참여 중인 펀딩이 없어요</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-6">
                        친구의 위시리스트를 구경해보세요
                    </p>
                    <Button variant="outline" asChild>
                        <Link href="/wishlist">위시리스트 보기</Link>
                    </Button>
                </div>
            </section>
        );
    }

    return (
        <section className="py-8">
            {/* Section Header */}
            <div className="flex items-end justify-between px-4 md:px-8 mb-6">
                <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">My Fundings</p>
                    <h2 className="text-xl font-semibold tracking-tight mt-1">참여 중인 펀딩</h2>
                </div>
                <Link
                    href="/fundings/participated"
                    className="flex items-center gap-1 text-sm hover:opacity-60 transition-opacity"
                >
                    더보기
                    <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
            </div>

            {/* Horizontal Scroll */}
            <div className="flex gap-4 overflow-x-auto px-4 md:px-8 pb-4 scrollbar-hide snap-x snap-mandatory">
                {fundings.map((funding) => (
                    <FundingCard
                        key={funding.id}
                        funding={{
                            id: funding.id,
                            product: {
                                name: funding.product.name,
                                imageUrl: funding.product.imageUrl,
                                price: funding.product.price,
                            },
                            targetAmount: funding.targetAmount,
                            currentAmount: funding.currentAmount,
                            status: funding.status,
                            expiresAt: funding.expiresAt,
                            participantCount: funding.participantCount,
                            recipient: {
                                nickname: funding.recipient.nickname,
                                avatarUrl: funding.recipient.avatarUrl || undefined,
                            },
                        }}
                        variant="carousel"
                        onClick={() => router.push(`/fundings/${funding.id}`)}
                        className="snap-start"
                    />
                ))}
            </div>
        </section>
    );
}
