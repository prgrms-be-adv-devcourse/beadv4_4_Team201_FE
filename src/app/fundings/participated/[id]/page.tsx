'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { InlineError } from '@/components/common/InlineError';
import { useParticipatedFunding } from '@/features/funding/hooks/useFunding';
import { formatPrice } from '@/lib/format';
import { resolveImageUrl } from '@/lib/image';
import { Calendar, Gift, TrendingUp, Coins } from 'lucide-react';

export default function ParticipatedFundingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

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
        <AppShell headerTitle="참여한 펀딩" headerVariant="detail" hasBack showBottomNav={false}>
            <div className="p-4 space-y-6 pb-24">
                {/* 상품 이미지 */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-secondary">
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
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium bg-background/80 backdrop-blur-sm">
                        {statusLabel[funding.status] ?? funding.status}
                    </span>
                </div>

                {/* 상품명 & 수령인 */}
                <div className="space-y-1">
                    {funding.receiverNickname && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Gift className="h-3.5 w-3.5" />
                            {funding.receiverNickname}님을 위한 펀딩
                        </p>
                    )}
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
                            {Math.round(progressPercent)}% 달성
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

                {/* 통계 카드 */}
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
                            내 참여 금액
                        </div>
                        <p className="text-base font-semibold text-primary">
                            {formatPrice(funding.myContribution ?? 0)}
                        </p>
                    </div>
                </div>

                {/* 하단 버튼 */}
                <div className="pt-4">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.back()}
                    >
                        목록으로 돌아가기
                    </Button>
                </div>
            </div>
        </AppShell>
    );
}
