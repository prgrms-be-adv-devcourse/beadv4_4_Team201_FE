'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { FundingActionBox } from '@/features/funding/components/FundingActionBox';
import { ParticipateModal } from '@/features/funding/components/ParticipateModal';
import { RecipientActionButtons } from '@/features/funding/components/RecipientActionButtons';
import { ParticipantsModal } from '@/features/funding/components/ParticipantsModal';
import { Separator } from '@/components/ui/separator';
import { useFunding } from '@/features/funding/hooks/useFunding';
import { InlineError } from '@/components/common/InlineError';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

export default function FundingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [participateModalOpen, setParticipateModalOpen] = useState(false);
    const [participantsModalOpen, setParticipantsModalOpen] = useState(false);

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

    return (
        <AppShell
            headerTitle="펀딩 상세"
            headerVariant="detail"
            hasBack={true}
            showBottomNav={false} // Detail page often hides bottom nav
        >
            <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
                {/* Product Image */}
                <div className="relative aspect-square w-full bg-secondary md:aspect-video">
                    <Image
                        src={funding.product.imageUrl}
                        alt={funding.product.name}
                        fill
                        className="object-cover"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 p-4 space-y-6 pb-24">
                    {/* Recipient Info */}
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={funding.recipient.avatarUrl || undefined} />
                            <AvatarFallback>{(funding.recipient.nickname || '알')[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">To.</p>
                            <p className="font-bold">{funding.recipient.nickname || '알 수 없음'}</p>
                        </div>
                    </div>

                    <div className="rounded-lg bg-secondary/30 p-4">
                        <p className="text-xs text-muted-foreground mb-1">상품 정보</p>
                        <p className="font-medium text-sm">{funding.product.name}</p>
                        <p className="font-bold">₩{funding.product.price.toLocaleString()}</p>
                    </div>

                    <Separator />

                    {/* Participants Preview */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold">참여자 목록 ({funding.participantCount})</h3>
                            {funding.participantCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setParticipantsModalOpen(true)}
                                >
                                    <Users className="h-4 w-4 mr-1" strokeWidth={1.5} />
                                    전체보기
                                </Button>
                            )}
                        </div>
                        {funding.participantCount > 0 ? (
                            <div className="flex -space-x-2 overflow-hidden">
                                {funding.participants.slice(0, 5).map((participant) => (
                                    <Avatar key={participant.id} className="border-2 border-background w-8 h-8">
                                        <AvatarImage src={participant.member.avatarUrl || undefined} />
                                        <AvatarFallback className="text-[10px]">
                                            {(participant.member.nickname || '알')[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                ))}
                                {funding.participantCount > 5 && (
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground">
                                        +{funding.participantCount - 5}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">아직 참여자가 없습니다.</p>
                        )}
                    </div>
                </div>

                {/* Sticky Action Box or Recipient Actions */}
                <div className="fixed bottom-0 left-0 right-0 bg-background z-20 md:static">
                    {funding.status === 'ACHIEVED' ? (
                        <RecipientActionButtons fundingId={funding.id} />
                    ) : (
                        <FundingActionBox
                            funding={funding}
                            onParticipate={() => setParticipateModalOpen(true)}
                        />
                    )}
                </div>

                {/* Participate Modal */}
                <ParticipateModal
                    open={participateModalOpen}
                    onOpenChange={setParticipateModalOpen}
                    funding={funding}
                    onSuccess={(mode) => router.push(mode === 'cart' ? '/cart' : '/checkout')}
                />

                {/* Participants Modal */}
                <ParticipantsModal
                    open={participantsModalOpen}
                    onOpenChange={setParticipantsModalOpen}
                    fundingId={funding.id}
                />
            </div>
        </AppShell>
    );
}
