'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAcceptFunding, useRefuseFunding, useRetryAcceptFunding } from '@/features/funding/hooks/useFundingMutations';
import type { FundingStatus } from '@/types/funding';

interface RecipientActionButtonsProps {
    fundingId: string;
    status: FundingStatus;
}

export function RecipientActionButtons({ fundingId, status }: RecipientActionButtonsProps) {
    const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
    const [refuseDialogOpen, setRefuseDialogOpen] = useState(false);

    const acceptFunding = useAcceptFunding();
    const refuseFunding = useRefuseFunding();
    const retryAcceptFunding = useRetryAcceptFunding();

    const handleAccept = () => {
        acceptFunding.mutate(fundingId, {
            onSuccess: (data) => {
                toast.success(`'${data.productName}' 펀딩을 수락했습니다.`);
                setAcceptDialogOpen(false);
            },
            onError: (error) => {
                toast.error(error instanceof Error ? error.message : '펀딩 수락에 실패했습니다.');
            },
        });
    };

    const handleRefuse = () => {
        refuseFunding.mutate(
            {
                fundingId,
                data: { reason: '다른 상품을 원합니다.' },
            },
            {
                onSuccess: (data) => {
                    toast.success(`'${data.productName}' 펀딩을 거절했습니다. 참여자들에게 환불됩니다.`);
                    setRefuseDialogOpen(false);
                },
                onError: (error) => {
                    toast.error(error instanceof Error ? error.message : '펀딩 거절에 실패했습니다.');
                },
            }
        );
    };

    const handleRetryAccept = () => {
        retryAcceptFunding.mutate(fundingId, {
            onSuccess: (data) => {
                toast.success(`'${data.productName}' 수락 재시도를 성공했습니다.`);
            },
            onError: (error: Error) => {
                toast.error(error.message || '수락 재시도에 실패했습니다.');
            },
        });
    };

    if (status === 'ACCEPT_FAILED') {
        return (
            <Card className="p-4 shadow-sm border-t md:border">
                <div className="space-y-3">
                    <p className="text-sm font-medium text-center text-destructive">
                        수락 처리에 실패했습니다. 다시 시도해주세요.
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1 h-12"
                            onClick={() => setRefuseDialogOpen(true)}
                            disabled={refuseFunding.isPending}
                        >
                            {refuseFunding.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <X className="mr-2 h-4 w-4" />
                            )}
                            거절하기
                        </Button>
                        <Button
                            className="flex-1 h-12"
                            onClick={handleRetryAccept}
                            disabled={retryAcceptFunding.isPending}
                        >
                            {retryAcceptFunding.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Check className="mr-2 h-4 w-4" />
                            )}
                            수락 재시도하기
                        </Button>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <>
            <Card className="p-4 shadow-sm border-t md:border">
                <div className="space-y-3">
                    <p className="text-sm font-medium text-center text-muted-foreground">
                        목표 금액을 달성했습니다!
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1 h-12"
                            onClick={() => setRefuseDialogOpen(true)}
                            disabled={refuseFunding.isPending}
                        >
                            {refuseFunding.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <X className="mr-2 h-4 w-4" />
                            )}
                            거절하기
                        </Button>
                        <Button
                            className="flex-1 h-12"
                            onClick={() => setAcceptDialogOpen(true)}
                            disabled={acceptFunding.isPending}
                        >
                            {acceptFunding.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Check className="mr-2 h-4 w-4" />
                            )}
                            수락하기
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Accept Confirmation Dialog */}
            <AlertDialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>펀딩을 수락하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                            펀딩을 수락하면 선물을 받을 수 있습니다. 수락 후에는 취소할 수 없습니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={acceptFunding.isPending}>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={handleAccept} disabled={acceptFunding.isPending}>
                            {acceptFunding.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            수락하기
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Refuse Confirmation Dialog */}
            <AlertDialog open={refuseDialogOpen} onOpenChange={setRefuseDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>펀딩을 거절하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                            펀딩을 거절하면 모든 참여자에게 환불됩니다. 거절 후에는 취소할 수 없습니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={refuseFunding.isPending}>취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRefuse}
                            disabled={refuseFunding.isPending}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {refuseFunding.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            거절하기
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
