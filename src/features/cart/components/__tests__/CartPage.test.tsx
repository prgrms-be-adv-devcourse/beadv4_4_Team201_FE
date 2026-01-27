import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import CartPage from '@/app/cart/page';

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

        expect(screen.getByText('Sony WH-1000XM5')).toBeInTheDocument();
        // Check initial total: (450000*1) + (4500*2) + 0(shipping) = 459000
        // Should be length 2 (Total + Payment)
        expect(screen.getAllByText('459,000원')).toHaveLength(2);
    });

    it('GIVEN cart item, WHEN increase quantity, THEN total amount should update', async () => {
        const user = userEvent.setup();
        render(<CartPage />);

        // Find increase button for the first item (c1)
        const increaseBtn = screen.getByTestId('increase-btn-c1');
        await user.click(increaseBtn);

        // Check if quantity updated to 2
        await waitFor(() => {
            expect(screen.getByTestId('quantity-display-c1')).toHaveTextContent('2');
        });

        // Also check total amount as secondary verification
        // 909000 total == 909000 payment (shipping 0)
        expect(screen.getAllByText('909,000원')).toHaveLength(2);
    });

    it('GIVEN cart item, WHEN remove item, THEN it should disappear and update total', async () => {
        const user = userEvent.setup();
        render(<CartPage />);

        const removeBtn = screen.getByTestId('remove-btn-c1');
        // Remove first item
        await user.click(removeBtn);

        await waitFor(() => {
            expect(screen.queryByText('Sony WH-1000XM5')).not.toBeInTheDocument();
        });

        // Remaining: 4500 * 2 = 9000 + 3000(shipping) = 12000
        // Total: 9,000, Payment: 12,000. So '12,000원' should appear once.
        expect(screen.getAllByText('12,000원')).toHaveLength(1);
        expect(screen.getByText('9,000원')).toBeInTheDocument(); // Check total product price
    });
});
