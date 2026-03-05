import { render, screen } from '@/test/test-utils';
import { describe, it, expect, vi } from 'vitest';
import CartPage from '@/app/cart/page';
import { fundings } from '@/mocks/data/fundings';
import { products } from '@/mocks/data/products';
import type { Cart, CartItem } from '@/types/cart';

// Create a proper mock cart with all required V2 API fields
const mockCart: Cart = {
    id: '1',
    memberId: '1',
    items: [
        {
            id: '1::FUNDING::1',
            cartId: '1',
            targetType: 'FUNDING',
            targetId: '1',
            receiverId: fundings[0].recipientId,
            receiverNickname: fundings[0].recipient.nickname,
            imageKey: 'mock-image-key',
            productName: products[0].name,
            productPrice: products[0].price,
            contributionAmount: 100000,
            currentAmount: fundings[0].currentAmount,
            amount: 100000,
            fundingId: fundings[0].id,
            productId: products[0].id,
            funding: fundings[0],
            selected: true,
            isNewFunding: false,
            createdAt: new Date().toISOString(),
            status: 'AVAILABLE',
            statusMessage: null,
        } as CartItem,
        {
            id: '1::FUNDING::2',
            cartId: '1',
            targetType: 'FUNDING',
            targetId: '2',
            receiverId: fundings[1].recipientId,
            receiverNickname: fundings[1].recipient.nickname,
            imageKey: 'mock-image-key',
            productName: products[1].name,
            productPrice: products[1].price,
            contributionAmount: 50000,
            currentAmount: fundings[1].currentAmount,
            amount: 50000,
            fundingId: fundings[1].id,
            productId: products[1].id,
            funding: fundings[1],
            selected: true,
            isNewFunding: false,
            createdAt: new Date().toISOString(),
            status: 'AVAILABLE',
            statusMessage: null,
        } as CartItem,
    ],
    selectedCount: 2,
    totalAmount: 150000,
};

// Mock useAuth hook
vi.mock('@/features/auth/hooks/useAuth', () => ({
    useAuth: () => ({
        isAuthenticated: true,
        isLoading: false,
    }),
}));

// Mock useCart hook
vi.mock('@/features/cart/hooks/useCart', () => ({
    useCart: () => ({
        data: mockCart,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
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

        // Should display funding product names from mock fundings
        expect(screen.getAllByText(products[0].name).length).toBeGreaterThan(0);
        expect(screen.getAllByText(products[1].name).length).toBeGreaterThan(0);
    });

    it('GIVEN cart items, THEN it should show recipient info', () => {
        render(<CartPage />);

        // Should display recipient names - check with regex that includes "에게" suffix
        expect(screen.getAllByText(new RegExp(fundings[0].recipient.nickname!)).length).toBeGreaterThan(0);
        expect(screen.getAllByText(new RegExp(fundings[1].recipient.nickname!)).length).toBeGreaterThan(0);
    });

    it('GIVEN cart items, THEN it should display participation amounts', () => {
        render(<CartPage />);

        // Should display amounts (may be formatted with commas or without)
        const amountElements = screen.queryAllByText(/100[,]?000/);
        const smallAmountElements = screen.queryAllByText(/50[,]?000/);

        // At least one item should show the amounts
        expect(amountElements.length + smallAmountElements.length).toBeGreaterThan(0);
    });
});
