import { render, screen } from '@/test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CheckoutPage from '@/app/checkout/page';
import type { Cart } from '@/types/cart';
import type { Wallet } from '@/types/wallet';

const mockCart: Cart = {
    id: 'cart-1',
    memberId: 'user-1',
    items: [
        {
            id: 'c1',
            cartId: 'cart-1',
            fundingId: 'f1',
            funding: {
                id: 'f1',
                wishItemId: 'wi-1',
                organizerId: 'user-3',
                organizer: { id: 'user-3', nickname: 'Jane', avatarUrl: '' },
                recipientId: 'user-2',
                recipient: { id: 'user-2', nickname: 'John', avatarUrl: '' },
                product: { id: 'p1', name: 'Sony WH-1000XM5', price: 450000, imageUrl: '', status: 'ON_SALE' as const },
                targetAmount: 450000,
                currentAmount: 0,
                status: 'IN_PROGRESS',
                participantCount: 0,
                expiresAt: '2026-02-28T00:00:00Z',
                createdAt: '2026-01-01T00:00:00Z',
            },
            amount: 450000,
            selected: true,
            isNewFunding: false,
            createdAt: '2026-01-01T00:00:00Z',
        },
    ],
    selectedCount: 1,
    totalAmount: 450000,
};

const mockWallet: Wallet = {
    id: 'w1',
    memberId: 'user-1',
    balance: 500000,
};

// Mock UI components
vi.mock('@/components/layout/AppShell', () => ({
    AppShell: ({ children, headerTitle }: any) => (
        <div data-testid="app-shell">
            <h1>{headerTitle}</h1>
            {children}
        </div>
    ),
}));

// Mock router
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
    })),
}));

// Mock useCart hook
vi.mock('@/features/cart/hooks/useCart', () => ({
    useCart: () => ({
        data: mockCart,
        isLoading: false,
        error: null,
    }),
}));

// Mock useWallet hook
vi.mock('@/features/wallet/hooks/useWallet', () => ({
    useWallet: () => ({
        data: mockWallet,
        isLoading: false,
        error: null,
    }),
}));

// Mock order/payment mutations
vi.mock('@/features/order/hooks/useOrderMutations', () => ({
    useCreateOrder: () => ({
        mutateAsync: vi.fn().mockResolvedValue({ id: 'order-1' }),
        isPending: false,
    }),
}));

// Setup mock for toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('CheckoutPage Feature', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('GIVEN checkout page, THEN it should display order summary', () => {
        render(<CheckoutPage />);

        // Use getAllByText as the product name appears in multiple places
        const productNames = screen.getAllByText('Sony WH-1000XM5');
        expect(productNames.length).toBeGreaterThan(0);
    });

    it('GIVEN checkout page, THEN it should display wallet balance', () => {
        render(<CheckoutPage />);

        expect(screen.getByText(/500,000/)).toBeInTheDocument();
    });

    it('GIVEN checkout page, THEN it should show pay button', () => {
        render(<CheckoutPage />);

        expect(screen.getByRole('button', { name: /결제/i })).toBeInTheDocument();
    });
});
