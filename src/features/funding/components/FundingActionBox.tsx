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
        <div className="mt-4">
            <Button variant="default" className="w-full h-12" onClick={onParticipate}>
                장바구니 담기
            </Button>
        </div>
    );
}
