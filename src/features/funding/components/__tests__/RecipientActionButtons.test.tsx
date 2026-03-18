import { render, screen, fireEvent } from '@/test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecipientActionButtons } from '../RecipientActionButtons';

// Mock mutations
const mockAcceptMutate = vi.fn();
const mockRefuseMutate = vi.fn();
const mockRetryAcceptMutate = vi.fn();

vi.mock('@/features/funding/hooks/useFundingMutations', () => ({
    useAcceptFunding: () => ({
        mutate: mockAcceptMutate,
        isPending: false,
    }),
    useRefuseFunding: () => ({
        mutate: mockRefuseMutate,
        isPending: false,
    }),
    useRetryAcceptFunding: () => ({
        mutate: mockRetryAcceptMutate,
        isPending: false,
    }),
}));

// Mock AlertDialog to render its content directly for testing
vi.mock('@/components/ui/alert-dialog', () => ({
    AlertDialog: ({ open, children }: any) => (open ? <div>{children}</div> : null),
    AlertDialogContent: ({ children }: any) => <div>{children}</div>,
    AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
    AlertDialogTitle: ({ children }: any) => <h2>{children}</h2>,
    AlertDialogDescription: ({ children }: any) => <p>{children}</p>,
    AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
    AlertDialogAction: ({ onClick, children }: any) => <button onClick={onClick}>{children}</button>,
    AlertDialogCancel: ({ onClick, children }: any) => <button onClick={onClick}>{children}</button>,
}));

describe('RecipientActionButtons Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('GIVEN status is ACCEPT_FAILED, THEN it should show both "거절하기" and "수락 재시도하기" buttons', () => {
        render(<RecipientActionButtons fundingId="f-1" status="ACCEPT_FAILED" />);

        expect(screen.getByText('거절하기')).toBeInTheDocument();
        expect(screen.getByText('수락 재시도하기')).toBeInTheDocument();
    });

    it('GIVEN status is ACHIEVED, THEN it should show "거절하기" and "수락하기" buttons', () => {
        render(<RecipientActionButtons fundingId="f-1" status="ACHIEVED" />);

        expect(screen.getByText('거절하기')).toBeInTheDocument();
        expect(screen.getByText('수락하기')).toBeInTheDocument();
    });

    it('GIVEN user clicks "거절하기" in ACCEPT_FAILED status, THEN it should open refusal confirmation', () => {
        render(<RecipientActionButtons fundingId="f-1" status="ACCEPT_FAILED" />);

        fireEvent.click(screen.getByText('거절하기'));
        expect(screen.getByText('펀딩을 거절하시겠습니까?')).toBeInTheDocument();
    });

    it('GIVEN user clicks "수락 재시도하기" in ACCEPT_FAILED status, THEN it should call retry mutation', () => {
        render(<RecipientActionButtons fundingId="f-1" status="ACCEPT_FAILED" />);

        fireEvent.click(screen.getByText('수락 재시도하기'));
        expect(mockRetryAcceptMutate).toHaveBeenCalledWith('f-1', expect.any(Object));
    });
});
