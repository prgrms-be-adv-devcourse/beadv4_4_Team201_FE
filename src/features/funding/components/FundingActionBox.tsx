'use client';

import { Button } from '@/components/ui/button';
import { FundingProgress } from '@/components/common/FundingProgress';

interface FundingActionBoxProps {
    onParticipate: () => void;
}

/**
 * Funding Action Box - 29cm Style
 * Clean progress display with CTA
 */
export function FundingActionBox({ onParticipate }: FundingActionBoxProps) {
    return (
        <div className="space-y-3 mt-4">
            <Button variant="default" className="w-full h-12" onClick={onParticipate}>
                장바구니 담기
            </Button>
            <Button variant="outline" className="w-full h-12" onClick={onParticipate}>
                펀딩 참여하기
            </Button>
        </div>
    );
}
