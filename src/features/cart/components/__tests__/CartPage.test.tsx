import { render, screen } from '@/test/test-utils';
import { describe, it, expect, vi } from 'vitest';
import CartPage from '@/app/cart/page';
import type { Cart } from '@/types/cart';

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
        {
            id: 'c2',
            cartId: 'cart-1',
            fundingId: 'f2',
            funding: {
                id: 'f2',
                wishItemId: 'wi-2',
                organizerId: 'user-5',
                organizer: { id: 'user-5', nickname: 'Alice', avatarUrl: '' },
                recipientId: 'user-4',
                recipient: { id: 'user-4', nickname: 'Bob', avatarUrl: '' },
                product: { id: 'p2', name: 'Coffee Beans', price: 4500, imageUrl: '', status: 'ON_SALE' as const },
                targetAmount: 9000,
                currentAmount: 0,
                status: 'IN_PROGRESS',
                participantCount: 0,
                expiresAt: '2026-02-28T00:00:00Z',
                createdAt: '2026-01-01T00:00:00Z',
            },
            amount: 9000,
            selected: true,
            isNewFunding: false,
            createdAt: '2026-01-01T00:00:00Z',
        },
    ],
    selectedCount: 2,
    totalAmount: 459000,
};

// Mock useCart hook
vi.mock('@/features/cart/hooks/useCart', () => ({
    useCart: () => ({
        data: mockCart,
        isLoading: false,
        error: null,
    }),
}));

// Mock useCartMutations hook
vi.mock('@/features/cart/hooks/useCartMutations', () => ({
    useUpdateCartItem: () => ({
        mutate: vi.fn(),
        isPending: false,
    }),
    useRemoveCartItems: () => ({
        mutate: vi.fn(),
        isPending: false,
    }),
    useToggleCartSelection: () => ({
        mutate: vi.fn(),
        isPending: false,
    }),
}));

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

// Setup mock for toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        info: vi.fn(),
    },
}));

describe('CartPage Feature', () => {

    it('GIVEN cart has items, THEN it should display items and summary', () => {
        render(<CartPage />);

        // Should display funding product names (may appear in both desktop and mobile views)
        const sonyElements = screen.getAllByText('Sony WH-1000XM5');
        const coffeeElements = screen.getAllByText('Coffee Beans');
        expect(sonyElements.length).toBeGreaterThan(0);
        expect(coffeeElements.length).toBeGreaterThan(0);
    });

    it('GIVEN cart items, THEN it should show recipient info', () => {
        render(<CartPage />);

        // Should display recipient names (may appear in both desktop and mobile views)
        const johnElements = screen.getAllByText(/John/);
        const bobElements = screen.getAllByText(/Bob/);
        expect(johnElements.length).toBeGreaterThan(0);
        expect(bobElements.length).toBeGreaterThan(0);
    });

    it('GIVEN cart items, THEN it should display participation amounts', () => {
        render(<CartPage />);

        // Should display amounts (use getAllByText since amounts may appear multiple times)
        const largeAmounts = screen.getAllByText(/450,000/);
        const smallAmounts = screen.getAllByText(/9,000/);
        expect(largeAmounts.length).toBeGreaterThan(0);
        expect(smallAmounts.length).toBeGreaterThan(0);
    });
});
