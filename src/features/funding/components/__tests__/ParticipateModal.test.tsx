import { render, screen } from '@/test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ParticipateModal } from '../ParticipateModal';
import type { Funding } from '@/types/funding';

vi.mock('@/components/ui/dialog', () => ({
    Dialog: ({ open, children }: any) => (open ? <div>{children}</div> : null),
    DialogContent: ({ children }: any) => <div>{children}</div>,
    DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
    DialogTitle: ({ children }: any) => <h2>{children}</h2>,
    DialogDescription: ({ children }: any) => <p>{children}</p>,
    DialogFooter: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

vi.mock('@/components/ui/separator', () => ({
    Separator: () => <hr />,
}));

vi.mock('next/image', () => ({
    default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const mockMutate = vi.fn();
vi.mock('@/features/funding/hooks/useFundingMutations', () => ({
    useParticipateFunding: () => ({
        mutate: mockMutate,
        isPending: false,
    }),
}));

vi.mock('@/features/wallet/hooks/useWallet', () => ({
    useWallet: () => ({
        data: { walletId: 1, balance: 120000 },
    }),
}));

describe('ParticipateModal Component', () => {
    const mockFunding: Funding = {
        id: 'f1',
        wishItemId: 'wi-1',
        organizerId: 'user-2',
        organizer: { id: 'user-2', nickname: 'Jane', avatarUrl: '' },
        recipientId: 'user-1',
        recipient: { id: 'user-1', nickname: 'John', avatarUrl: '' },
        product: { id: 'p1', name: 'Test Funding Item', price: 100000, imageUrl: '/test-img.jpg', status: 'ON_SALE' as const },
        targetAmount: 100000,
        currentAmount: 50000,
        status: 'IN_PROGRESS',
        participantCount: 3,
        expiresAt: '2026-02-28T00:00:00Z',
        createdAt: '2026-01-01T00:00:00Z',
    };

    const mockOnOpenChange = vi.fn();
    const mockOnSuccess = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('GIVEN user opens the modal, THEN it should display product image, name, and recipient', () => {
        render(
            <ParticipateModal
                open={true}
                onOpenChange={mockOnOpenChange}
                funding={mockFunding}
                onSuccess={mockOnSuccess}
            />
        );

        expect(screen.getByText('펀딩 참여하기')).toBeInTheDocument();
        expect(screen.getAllByText('Test Funding Item')).toHaveLength(2);
        expect(screen.getByAltText('Test Funding Item')).toBeInTheDocument();
        expect(screen.getByText('for @John')).toBeInTheDocument();
        expect(screen.getByText('₩100,000')).toBeInTheDocument();
    });

    it('GIVEN wallet has balance, THEN it should display wallet balance', () => {
        render(
            <ParticipateModal
                open={true}
                onOpenChange={mockOnOpenChange}
                funding={mockFunding}
                onSuccess={mockOnSuccess}
            />
        );

        expect(screen.getByText('내 지갑 잔액')).toBeInTheDocument();
        expect(screen.getByText('₩120,000')).toBeInTheDocument();
    });

    it('GIVEN funding progress, THEN it should display remaining amount', () => {
        render(
            <ParticipateModal
                open={true}
                onOpenChange={mockOnOpenChange}
                funding={mockFunding}
                onSuccess={mockOnSuccess}
            />
        );

        expect(screen.getByText('남은 목표 금액')).toBeInTheDocument();
        expect(screen.getByText('₩50,000')).toBeInTheDocument();
    });

    it('GIVEN modal is open, THEN it should show two CTA buttons', () => {
        render(
            <ParticipateModal
                open={true}
                onOpenChange={mockOnOpenChange}
                funding={mockFunding}
                onSuccess={mockOnSuccess}
            />
        );

        const cartBtn = screen.getByRole('button', { name: /장바구니에 담기/i });
        const checkoutBtn = screen.getByRole('button', { name: /바로 결제하기/i });
        expect(cartBtn).toBeInTheDocument();
        expect(checkoutBtn).toBeInTheDocument();
    });

    it('GIVEN user enters 0 amount, THEN both CTA buttons should be disabled', () => {
        render(
            <ParticipateModal
                open={true}
                onOpenChange={mockOnOpenChange}
                funding={mockFunding}
                onSuccess={mockOnSuccess}
            />
        );

        const cartBtn = screen.getByRole('button', { name: /장바구니에 담기/i });
        const checkoutBtn = screen.getByRole('button', { name: /바로 결제하기/i });
        expect(cartBtn).toBeDisabled();
        expect(checkoutBtn).toBeDisabled();
    });
});
