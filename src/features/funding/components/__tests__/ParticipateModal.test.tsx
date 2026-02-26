import { render, screen } from '@/test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ParticipateModal } from '../ParticipateModal';

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
        loading: vi.fn(),
        dismiss: vi.fn(),
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
    const mockProps = {
        wishItemId: 'wi-1',
        product: {
            name: 'Test Funding Item',
            price: 100000,
            imageUrl: '/test-img.jpg',
        },
        recipient: {
            nickname: 'John',
        },
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
                {...mockProps}
                onSuccess={mockOnSuccess}
            />
        );

        expect(screen.getByText('장바구니 담기')).toBeInTheDocument();
        expect(screen.getByText('Test Funding Item')).toBeInTheDocument();
        expect(screen.getByAltText('Test Funding Item')).toBeInTheDocument();
        expect(screen.getByText('for @John')).toBeInTheDocument();
        expect(screen.getByText('₩100,000')).toBeInTheDocument();
    });

    it('GIVEN wallet has balance, THEN it should display wallet balance', () => {
        render(
            <ParticipateModal
                open={true}
                onOpenChange={mockOnOpenChange}
                {...mockProps}
                onSuccess={mockOnSuccess}
            />
        );

        expect(screen.getByText('내 지갑 잔액')).toBeInTheDocument();
        expect(screen.getByText('₩120,000')).toBeInTheDocument();
    });

    it('GIVEN modal is open, THEN it should show message textarea (disabled)', () => {
        render(
            <ParticipateModal
                open={true}
                onOpenChange={mockOnOpenChange}
                {...mockProps}
                onSuccess={mockOnSuccess}
            />
        );

        expect(screen.getByText('메시지 (선택)')).toBeInTheDocument();
        const textarea = screen.getByPlaceholderText(/친구들에게 전할 말을 적어주세요/);
        expect(textarea).toBeInTheDocument();
        expect(textarea).toBeDisabled();
    });

    it('GIVEN modal is open, THEN it should show "장바구니 담기" button', () => {
        render(
            <ParticipateModal
                open={true}
                onOpenChange={mockOnOpenChange}
                {...mockProps}
                onSuccess={mockOnSuccess}
            />
        );

        const cartBtn = screen.getByRole('button', { name: /장바구니 담기/i });
        expect(cartBtn).toBeInTheDocument();
    });
});
