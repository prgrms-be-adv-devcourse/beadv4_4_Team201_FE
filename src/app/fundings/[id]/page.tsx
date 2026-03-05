'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { FundingActionBox } from '@/features/funding/components/FundingActionBox';
import { ParticipateModal } from '@/features/funding/components/ParticipateModal';
import { ParticipantsModal } from '@/features/funding/components/ParticipantsModal';
import { Separator } from '@/components/ui/separator';
import { useFunding } from '@/features/funding/hooks/useFunding';
import { InlineError } from '@/components/common/InlineError';
import { Button } from '@/components/ui/button';
import { resolveImageUrl } from '@/lib/image';
import { Progress } from '@/components/ui/progress';
import { formatPrice } from '@/lib/format';
import { Calendar, Gift, TrendingUp, Coins } from 'lucide-react';
import { toast } from 'sonner';

export default function FundingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [participateModalOpen, setParticipateModalOpen] = useState(false);

    const { data: funding, isLoading, isError, error, refetch } = useFunding(id);

    if (isLoading) {
        return (
            <AppShell
                headerTitle="펀딩 상세"
                headerVariant="detail"
                hasBack={true}
                showBottomNav={false}
            >
                <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
                    <Skeleton className="aspect-square w-full md:aspect-video" />
                    <div className="flex-1 p-4 space-y-6">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-5 w-24" />
                            </div>
                        </div>
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-32 w-full rounded-lg" />
                    </div>
                </div>
            </AppShell>
        );
    }

    if (isError || !funding) {
        return (
            <AppShell
                headerTitle="펀딩 상세"
                headerVariant="detail"
                hasBack={true}
                showBottomNav={false}
            >
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

    const progressPercent = funding.achievementRate ?? (
        funding.targetAmount > 0
            ? (funding.currentAmount / funding.targetAmount) * 100
            : 0
    );

    // 달성률이 0보다 크지만 소수점 등으로 인해 0%로 보일 수 있는 경우 최소 1% 표시
    const displayProgress = (funding.currentAmount > 0 && progressPercent < 1) ? 1 : Math.round(progressPercent);

    const statusLabel: Record<string, string> = {
        IN_PROGRESS: '진행 중',
        ACHIEVED: '달성 완료',
        ACCEPTED: '수락됨',
        REFUSED: '거절됨',
        EXPIRED: '기간 만료',
        CLOSED: '종료됨',
        PENDING: '대기 중',
    };

    return (
        <AppShell
            headerTitle="펀딩 상세"
            headerVariant="detail"
            hasBack={true}
            showBottomNav={false}
        >
            <div className="flex flex-col min-h-[calc(100vh-3.5rem)] p-4 space-y-6 pb-12">
                {/* Product Image */}
                <div className="relative w-full aspect-square max-h-[300px] max-w-[300px] mx-auto rounded-xl overflow-hidden bg-secondary">
                    <Image
                        src={resolveImageUrl(funding.product?.imageUrl || funding.imageKey, funding.product?.category)}
                        alt={funding.product?.name || "상품 이미지"}
                        fill
                        className="object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/placeholder-product.svg';
                        }}
                    />
                    {/* 상태 배지 */}
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium bg-background/80 backdrop-blur-sm">
                        {statusLabel[funding.status] ?? funding.status}
                    </span>
                </div>

                {/* 상품명 & 수령인 */}
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Gift className="h-3.5 w-3.5" />
                        {funding.recipient.nickname || funding.receiverNickname || '알 수 없음'}님을 위한 펀딩
                    </p>
                    <h1 className="text-lg font-semibold leading-snug">
                        {funding.product?.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        목표 금액: {formatPrice(funding.targetAmount)}
                    </p>
                </div>

                {/* 진행률 */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium text-primary">
                            {displayProgress}% 달성
                        </span>
                        {funding.daysRemaining !== undefined && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                D-{funding.daysRemaining}
                            </span>
                        )}
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>모인 금액: {formatPrice(funding.currentAmount)}</span>
                        <span>목표: {formatPrice(funding.targetAmount)}</span>
                    </div>
                </div>

                {/* 통계 카드 (참여 유도용) */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-secondary/60 rounded-xl p-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <TrendingUp className="h-3.5 w-3.5" />
                            모인 금액
                        </div>
                        <p className="text-base font-semibold">
                            {formatPrice(funding.currentAmount)}
                        </p>
                    </div>
                    <div className="bg-primary/10 rounded-xl p-4 space-y-1 border border-primary/20">
                        <div className="flex items-center gap-1.5 text-xs text-primary/70">
                            <Coins className="h-3.5 w-3.5" />
                            달성까지 남은 금액
                        </div>
                        <p className="text-base font-semibold text-primary">
                            {formatPrice(Math.max(0, funding.targetAmount - funding.currentAmount))}
                        </p>
                    </div>
                </div>

                {/* Action Box - Only show when IN_PROGRESS */}
                <div className="mt-4">
                    {funding.status === 'IN_PROGRESS' && (
                        <FundingActionBox
                            onParticipate={() => setParticipateModalOpen(true)}
                        />
                    )}
                    {funding.status !== 'IN_PROGRESS' && (
                        <div className="bg-secondary/30 rounded-xl p-6 text-center">
                            <p className="text-sm font-medium text-muted-foreground">
                                {funding.status === 'ACHIEVED' || funding.status === 'ACCEPTED'
                                    ? '펀딩이 성공적으로 달성되었습니다!'
                                    : '펀딩이 종료되었습니다.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Participate Modal */}
                <ParticipateModal
                    open={participateModalOpen}
                    onOpenChange={setParticipateModalOpen}
                    wishItemId={funding.wishItemId}
                    product={{
                        name: funding.product.name,
                        imageUrl: funding.product.imageUrl,
                        price: funding.product.price
                    }}
                    recipient={{
                        nickname: funding.recipient.nickname || '알 수 없음'
                    }}
                    onSuccess={(mode, message) => {
                        if (mode === 'cart') {
                            toast.success(message || '장바구니에 상품을 추가했습니다.', {
                                action: {
                                    label: '장바구니 확인',
                                    onClick: () => router.push('/cart')
                                }
                            });
                        } else {
                            router.push('/checkout');
                        }
                    }}
                />
            </div>
        </AppShell>
    );
}
