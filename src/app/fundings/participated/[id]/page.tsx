'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { InlineError } from '@/components/common/InlineError';
import { useParticipatedFunding } from '@/features/funding/hooks/useFunding';
import { ParticipateModal } from '@/features/funding/components/ParticipateModal';
import { formatPrice, formatFundingStatus } from '@/lib/format';
import { resolveImageUrl } from '@/lib/image';
import { Calendar, Gift, TrendingUp, Coins } from 'lucide-react';
import { toast } from 'sonner';

export default function ParticipatedFundingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [participateModalOpen, setParticipateModalOpen] = useState(false);

    const { data: funding, isLoading, isError, refetch } = useParticipatedFunding(id);

    if (isLoading) {
        return (
            <AppShell headerTitle="참여한 펀딩" headerVariant="detail" hasBack showBottomNav={false}>
                <div className="p-4 space-y-4">
                    <Skeleton className="w-full aspect-square rounded-xl" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-2 w-full mt-4" />
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <Skeleton className="h-20 rounded-xl" />
                        <Skeleton className="h-20 rounded-xl" />
                    </div>
                </div>
            </AppShell>
        );
    }

    if (isError || !funding) {
        return (
            <AppShell headerTitle="참여한 펀딩" headerVariant="detail" hasBack showBottomNav={false}>
                <div className="p-4 py-16">
                    <InlineError
                        message="펀딩 정보를 불러올 수 없습니다."
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


    return (
        <AppShell headerTitle="참여한 펀딩" headerVariant="detail" hasBack showBottomNav={false}>
            <main className="max-w-screen-2xl mx-auto px-8 py-6 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                    {/* Left Column: Product Image */}
                    <div className="relative aspect-square bg-gray-50 overflow-hidden max-w-[90%] rounded-xl shadow-sm">
                        <Image
                            src={resolveImageUrl(funding.imageKey)}
                            alt={funding.product?.name || '상품 이미지'}
                            fill
                            className="object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/placeholder-product.svg';
                            }}
                        />
                        {/* 상태 배지 */}
                        <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-background/90 backdrop-blur-sm shadow-sm">
                            {formatFundingStatus(funding.status)}
                        </span>
                    </div>

                    {/* Right Column: Info & Actions */}
                    <div className="mt-8 lg:mt-0 space-y-8">
                        {/* 상품명 & 수령인 */}
                        <div className="space-y-2">
                            {funding.receiverNickname && (
                                <p className="text-sm font-medium text-primary flex items-center gap-1.5">
                                    <Gift className="h-4 w-4" />
                                    {funding.receiverNickname}님을 위한 펀딩
                                </p>
                            )}
                            <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight">
                                {funding.product?.name}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                목표 금액: {formatPrice(funding.targetAmount)}
                            </p>
                        </div>

                        {/* 통계 & 진행률 */}
                        <div className="space-y-6">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-primary">
                                    {formatPrice(funding.currentAmount)}
                                </span>
                                <span className="text-lg font-semibold text-muted-foreground">
                                    모였습니다
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-2xl font-bold text-primary">
                                            {displayProgress}%
                                        </span>
                                        <span className="text-sm font-medium text-muted-foreground">달성</span>
                                    </div>
                                    {funding.daysRemaining !== undefined && (
                                        <span className="flex items-center gap-1.5 text-sm font-semibold bg-secondary/50 px-2.5 py-1 rounded-md">
                                            <Calendar className="h-4 w-4" />
                                            {funding.daysRemaining === 0 ? '오늘 종료' : `${funding.daysRemaining}일 남음`}
                                        </span>
                                    )}
                                </div>
                                <Progress value={progressPercent} className="h-3 rounded-full" />
                            </div>
                        </div>

                        {/* 상세 정보 카드 */}
                        <div className="bg-secondary/30 rounded-2xl p-6 grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    모인 금액
                                </div>
                                <p className="text-lg font-bold">
                                    {formatPrice(funding.currentAmount)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary/70 uppercase tracking-wider">
                                    <Coins className="h-3.5 w-3.5" />
                                    내 참여 금액
                                </div>
                                <p className="text-lg font-bold text-primary">
                                    {formatPrice(funding.myContribution ?? 0)}
                                </p>
                            </div>
                        </div>

                        {/* 하단 버튼 */}
                        <div className="space-y-3 pt-4">
                            {funding.status === 'IN_PROGRESS' && (
                                <Button
                                    className="w-full h-12 text-base font-bold"
                                    onClick={() => setParticipateModalOpen(true)}
                                >
                                    장바구니 담기
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                className="w-full h-12 text-base font-bold"
                                onClick={() => router.back()}
                            >
                                목록으로 돌아가기
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 참여 모달 */}
                <ParticipateModal
                    open={participateModalOpen}
                    onOpenChange={setParticipateModalOpen}
                    wishItemId={funding.wishItemId}
                    product={{
                        name: funding.product?.name || '상품 정보 없음',
                        imageUrl: resolveImageUrl(funding.imageKey),
                        price: funding.targetAmount
                    }}
                    recipient={{
                        nickname: funding.receiverNickname || '알 수 없음'
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
            </main>
        </AppShell>
    );
}
