'use client';

import { useState } from 'react';
import Image from 'next/image';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { FundingProgress } from '@/components/common/FundingProgress';
import { ParticipateModal } from '@/features/funding/components/ParticipateModal';
import { InlineError } from '@/components/common/InlineError';
import { useFriendFundingDetail } from '@/features/funding/hooks/useFunding';
import { handleImageError } from '@/lib/image';
import { toast } from 'sonner';
import { CalendarDays, ShoppingCart } from 'lucide-react';

interface PageProps {
    params: Promise<{ friendId: string; id: string }>;
}

export default function FriendFundingDetailPage({ params }: PageProps) {
    const { friendId, id } = use(params);
    const router = useRouter();
    const [participateModalOpen, setParticipateModalOpen] = useState(false);

    const { data: funding, isLoading, isError, error, refetch } = useFriendFundingDetail(friendId, id);

    if (isLoading) {
        return (
            <AppShell headerTitle="펀딩 상세" headerVariant="detail" hasBack showBottomNav={false}>
                <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
                    <Skeleton className="w-full" style={{ height: '319.94px' }} />
                    <div className="p-5 space-y-5">
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-2/3" />
                            <Skeleton className="h-4 w-1/3" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </div>
                </div>
            </AppShell>
        );
    }

    if (isError || !funding) {
        return (
            <AppShell headerTitle="펀딩 상세" headerVariant="detail" hasBack showBottomNav={false}>
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
                    <InlineError
                        message="펀딩 정보를 불러올 수 없습니다."
                        error={error}
                        onRetry={() => refetch()}
                    />
                </div>
            </AppShell>
        );
    }

    const percentage = Math.floor((funding.currentAmount / funding.targetAmount) * 100);
    const isInProgress = funding.status === 'IN_PROGRESS';
    const recipientName = funding.recipient.nickname || funding.receiverNickname || '알 수 없음';

    return (
        <>
            <AppShell headerTitle="펀딩 상세" headerVariant="detail" hasBack showBottomNav={false}>
                <div className="flex flex-col min-h-[calc(100vh-3.5rem)] pb-28">
                    {/* Product Image — 319.94×319.94 square */}
                    <div
                        className="relative w-full bg-secondary overflow-hidden"
                        style={{ height: '319.94px' }}
                    >
                        <Image
                            src={funding.product.imageUrl || '/images/placeholder-product.svg'}
                            alt={funding.product.name}
                            fill
                            className="object-cover"
                            onError={handleImageError}
                            sizes="100vw"
                        />
                    </div>

                    {/* Main Content */}
                    <div className="p-5 space-y-6">
                        {/* Recipient Badge */}
                        <div className="inline-flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1">
                            <span className="text-xs text-muted-foreground">To.</span>
                            <span className="text-xs font-semibold">{recipientName}</span>
                        </div>

                        {/* Product Info */}
                        <div>
                            <h2 className="text-lg font-bold leading-snug">{funding.product.name}</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                목표 금액 ₩{funding.targetAmount.toLocaleString()}
                            </p>
                        </div>

                        {/* Progress Section */}
                        <div className="space-y-3">
                            <div className="flex items-baseline justify-between">
                                <div>
                                    <span className="text-3xl font-black tracking-tight">{percentage}</span>
                                    <span className="text-base font-semibold text-muted-foreground ml-0.5">%</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-semibold text-foreground">
                                        ₩{funding.currentAmount.toLocaleString()}
                                    </span>{' '}
                                    / ₩{funding.targetAmount.toLocaleString()}
                                </p>
                            </div>

                            <FundingProgress
                                current={funding.currentAmount}
                                target={funding.targetAmount}
                                size="lg"
                            />

                            {/* Days Remaining */}
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <CalendarDays className="h-4 w-4" strokeWidth={1.5} />
                                {funding.daysRemaining != null && funding.daysRemaining > 0 ? (
                                    <span>
                                        <span className="font-semibold text-foreground">{funding.daysRemaining}</span>일 남음
                                    </span>
                                ) : funding.daysRemaining === 0 ? (
                                    <span className="font-semibold text-foreground">D-Day</span>
                                ) : (
                                    <span>마감</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Bottom CTA */}
                {isInProgress && (
                    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-20">
                        <Button
                            className="w-full h-12 gap-2"
                            onClick={() => setParticipateModalOpen(true)}
                        >
                            <ShoppingCart className="h-4 w-4" strokeWidth={1.5} />
                            장바구니 담기
                        </Button>
                    </div>
                )}
            </AppShell>

            {isInProgress && (
                <ParticipateModal
                    open={participateModalOpen}
                    onOpenChange={setParticipateModalOpen}
                    wishItemId={funding.wishItemId}
                    product={{
                        name: funding.product.name,
                        imageUrl: funding.product.imageUrl || '',
                        price: funding.product.price
                    }}
                    recipient={{
                        nickname: recipientName
                    }}
                    onSuccess={(mode) => {
                        if (mode === 'cart') {
                            toast.success('장바구니에 담겼습니다.', {
                                description: '결제를 진행하시겠습니까?',
                                action: {
                                    label: '장바구니 확인',
                                    onClick: () => router.push('/cart'),
                                },
                            });
                        } else {
                            router.push('/checkout');
                        }
                    }}
                />
            )}
        </>
    );
}
