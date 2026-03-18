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
import { formatPrice, formatFundingStatus } from '@/lib/format';
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


    return (
        <AppShell
            headerTitle="펀딩 상세"
            headerVariant="detail"
            hasBack={true}
            showBottomNav={false}
        >
            <main className="max-w-screen-2xl mx-auto px-8 py-6 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                    {/* Left Column: Product Image */}
                    <div className="relative aspect-square bg-gray-50 overflow-hidden max-w-[90%] rounded-xl shadow-sm">
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
                        <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-background/90 backdrop-blur-sm shadow-sm">
                            {formatFundingStatus(funding.status)}
                        </span>
                    </div>

                    {/* Right Column: Info & Actions */}
                    <div className="mt-8 lg:mt-0 space-y-8">
                        {/* 상품명 & 수령인 */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-primary flex items-center gap-1.5">
                                <Gift className="h-4 w-4" />
                                {funding.recipient.nickname || funding.receiverNickname || '알 수 없음'}님을 위한 펀딩
                            </p>
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
                                    남은 금액
                                </div>
                                <p className="text-lg font-bold text-primary">
                                    {formatPrice(Math.max(0, funding.targetAmount - funding.currentAmount))}
                                </p>
                            </div>
                        </div>

                        {/* Action Box */}
                        <div className="pt-2">
                            {funding.status === 'IN_PROGRESS' ? (
                                <FundingActionBox
                                    onParticipate={() => setParticipateModalOpen(true)}
                                />
                            ) : (
                                <div className="bg-secondary/40 rounded-xl p-6 text-center border border-dashed border-muted-foreground/30">
                                    <p className="text-sm font-semibold text-muted-foreground">
                                        {['ACHIEVED', 'ACCEPTING', 'ACCEPTED', 'ACCEPT_FAILED'].includes(funding.status)
                                            ? '이 펀딩은 성공적으로 달성되었습니다!'
                                            : '이 펀딩은 현재 종료되었습니다.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
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
            </main>
        </AppShell>
    );
}
