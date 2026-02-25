'use client';

import { Button } from '@/components/ui/button';
import { FundingProgress } from '@/components/common/FundingProgress';

interface FundingActionBoxProps {
    funding: {
        currentAmount: number;
        targetAmount: number;
        participantCount: number;
        status: string;
    };
    onParticipate: () => void;
}

/**
 * Funding Action Box - 29cm Style
 * Clean progress display with CTA
 */
export function FundingActionBox({ funding, onParticipate }: FundingActionBoxProps) {
    const percentage = Math.floor((funding.currentAmount / funding.targetAmount) * 100);

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-20 md:static md:border md:mt-4">
            <div className="space-y-4">
                {/* Progress Info */}
                <div className="flex justify-between items-baseline">
                    <div>
                        <span className="text-2xl font-semibold tracking-tight">{percentage}%</span>
                        <span className="text-sm text-muted-foreground ml-1">달성</span>
                    </div>
                    <div className="text-sm">
                        <span className="font-medium">{funding.currentAmount.toLocaleString()}</span>
                        <span className="text-muted-foreground"> / {funding.targetAmount.toLocaleString()}원</span>
                    </div>
                </div>

                <FundingProgress
                    current={funding.currentAmount}
                    target={funding.targetAmount}
                    size="lg"
                />

                <p className="text-xs text-muted-foreground">
                    {funding.participantCount}명 참여 중
                </p>

                <Button variant="default" className="w-full h-12 mb-2" onClick={onParticipate}>
                    장바구니 담기
                </Button>
                <Button variant="outline" className="w-full h-12" onClick={onParticipate}>
                    펀딩 참여하기
                </Button>
            </div>
        </div>
    );
}
