'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useMyFunding } from '@/features/funding/hooks/useFunding';
import { InlineError } from '@/components/common/InlineError';
import { Users, Clock, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { RecipientActionButtons } from '@/features/funding/components/RecipientActionButtons';

export default function MyFundingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: funding, isLoading, isError, error, refetch } = useMyFunding(id);

    if (isLoading) {
        return (
            <AppShell
                headerTitle="나의 펀딩 상세"
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
                headerTitle="나의 펀딩 상세"
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

    // Calculate progress percentage
    const progress = Math.min(100, Math.max(0, (funding.currentAmount / funding.targetAmount) * 100));
    const isExpired = new Date(funding.expiresAt) < new Date();

    return (
        <AppShell
            headerTitle="나의 펀딩 상세"
            headerVariant="detail"
            hasBack={true}
            showBottomNav={false}
        >
            <div className="flex flex-col min-h-[calc(100vh-3.5rem)] pb-10">
                {/* Product Image Placeholder or Default */}
                <div className="relative aspect-square w-full bg-secondary md:aspect-video">
                    <Image
                        src={funding.product.imageUrl || "/images/placeholder-product.svg"}
                        alt="Product Image"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="inline-flex items-center rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-semibold text-white mb-2">
                            {funding.status}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 space-y-6">
                    {/* Funding Status Card */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-5 space-y-4">
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm font-medium text-muted-foreground">모인 금액</span>
                            <span className="text-2xl font-bold text-primary">
                                {funding.currentAmount.toLocaleString()}원
                            </span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>목표 {funding.targetAmount.toLocaleString()}원</span>
                                <span className="font-semibold text-primary">{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="flex flex-col items-center justify-center p-3 bg-secondary/20 rounded-lg">
                                <Clock className="h-5 w-5 mb-1 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">남은 기간</span>
                                <span className="font-bold">
                                    {isExpired ? '종료됨' : `${Math.ceil((new Date(funding.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}일`}
                                </span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-3 bg-secondary/20 rounded-lg">
                                <Users className="h-5 w-5 mb-1 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">참여자</span>
                                <span className="font-bold">
                                    {['ACHIEVED', 'ACCEPTED', 'REFUSED'].includes(funding.status)
                                        ? `${funding.participantCount}명`
                                        : '달성 후 조회 가능'}
                                </span>
                            </div>

                        </div>
                    </div>

                    <Separator />

                    {/* Participants Preview */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                참여자 목록 {['ACHIEVED', 'ACCEPTED', 'REFUSED'].includes(funding.status) && `(${funding.participantCount})`}
                            </h3>
                        </div>

                        {['ACHIEVED', 'ACCEPTED', 'REFUSED'].includes(funding.status) ? (
                            funding.participantCount > 0 ? (
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                    {funding.participants.map((participant, index) => (
                                        <div key={`${participant.id}-${index}`} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={participant.member.avatarUrl || undefined} />
                                                    <AvatarFallback>{(participant.member.nickname || '알')[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{participant.member.nickname}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground bg-secondary/20 rounded-lg">
                                    <p className="text-sm">아직 참여자가 없습니다.</p>
                                </div>
                            )
                        ) : (
                            <div className="text-center py-8 text-muted-foreground bg-secondary/20 rounded-lg">
                                <p className="text-sm">참여자는 달성 후 조회 가능합니다.</p>
                                <p className="text-xs mt-1">친구들에게 펀딩을 공유해보세요!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sticky Action Box */}
            <div className="fixed bottom-0 left-0 right-0 bg-background z-20 md:static">
                {funding.status === 'ACHIEVED' && (
                    <RecipientActionButtons fundingId={funding.id} />
                )}
            </div>
        </AppShell>
    );
}
