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
import { formatFundingStatus } from '@/lib/format';

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
            <main className="max-w-screen-2xl mx-auto px-8 py-6 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                    {/* Left Column: Product Image */}
                    <div className="relative aspect-square bg-gray-50 overflow-hidden max-w-[90%] rounded-xl shadow-sm">
                        <Image
                            src={funding.product.imageUrl || "/images/placeholder-product.svg"}
                            alt={funding.product.name}
                            fill
                            className="object-cover"
                        />
                        {/* 상태 배지 */}
                        <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-background/90 backdrop-blur-sm shadow-sm">
                            {formatFundingStatus(funding.status)}
                        </span>
                    </div>

                    {/* Right Column: Info & Actions */}
                    <div className="mt-8 lg:mt-0 space-y-8">
                        {/* Product Info */}
                        <div className="space-y-2">
                            <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight">
                                {funding.product.name}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                목표 금액: {funding.targetAmount.toLocaleString()}원
                            </p>
                        </div>

                        {/* Funding Status Card */}
                        <div className="space-y-6">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-primary">
                                    {funding.currentAmount.toLocaleString()}원
                                </span>
                                <span className="text-lg font-semibold text-muted-foreground">
                                    모였습니다
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-2xl font-bold text-primary">
                                            {Math.round(progress)}%
                                        </span>
                                        <span className="text-sm font-medium text-muted-foreground">달성</span>
                                    </div>
                                    <span className="flex items-center gap-1.5 text-sm font-semibold bg-secondary/50 px-2.5 py-1 rounded-md">
                                        <Clock className="h-4 w-4" />
                                        {isExpired ? '종료됨' : `${Math.ceil((new Date(funding.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}일 남음`}
                                    </span>
                                </div>
                                <Progress value={progress} className="h-3 rounded-full" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-secondary/30 rounded-xl p-4 flex flex-col items-center justify-center space-y-1">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">참여자</span>
                                    <span className="text-lg font-bold">
                                        {['ACHIEVED', 'ACCEPTING', 'ACCEPTED', 'ACCEPT_FAILED', 'REFUSED'].includes(funding.status)
                                            ? `${funding.participantCount}명`
                                            : '-'}
                                    </span>
                                </div>
                                <div className="bg-secondary/30 rounded-xl p-4 flex flex-col items-center justify-center space-y-1">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">상태</span>
                                    <span className="text-lg font-bold truncate max-w-full px-2">
                                        {formatFundingStatus(funding.status)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Participants Preview */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                참여자 목록 {['ACHIEVED', 'ACCEPTING', 'ACCEPTED', 'ACCEPT_FAILED', 'REFUSED'].includes(funding.status) && `(${funding.participantCount})`}
                            </h3>

                            {['ACHIEVED', 'ACCEPTING', 'ACCEPTED', 'ACCEPT_FAILED', 'REFUSED'].includes(funding.status) ? (
                                funding.participantCount > 0 ? (
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {funding.participants.map((participant, index) => (
                                            <div key={`${participant.id}-${index}`} className="flex items-center justify-between p-4 rounded-xl border bg-card/50 transition-colors hover:bg-card">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                                        <AvatarImage src={participant.member.avatarUrl || undefined} />
                                                        <AvatarFallback className="bg-primary/5 text-primary">{(participant.member.nickname || '알')[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-base font-medium">{participant.member.nickname}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground bg-secondary/20 rounded-2xl border border-dashed border-muted-foreground/20">
                                        <p className="text-sm font-medium">아직 참여자가 없습니다.</p>
                                    </div>
                                )
                            ) : (
                                <div className="text-center py-12 text-muted-foreground bg-secondary/20 rounded-2xl border border-dashed border-muted-foreground/20 space-y-2">
                                    <p className="text-sm font-medium">참여자는 달성 후 조회 가능합니다.</p>
                                    <p className="text-xs opacity-70">친구들에게 펀딩을 공유해보세요!</p>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4">
                            {['ACHIEVED', 'ACCEPT_FAILED'].includes(funding.status) && (
                                <RecipientActionButtons fundingId={funding.id} status={funding.status} />
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </AppShell>
    );
}
