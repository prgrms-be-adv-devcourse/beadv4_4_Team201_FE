import { render, screen } from '@/test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Wallet, WalletTransaction } from '@/types/wallet';

// Mock UI components
vi.mock('@/components/layout/AppShell', () => ({
    AppShell: ({ children, headerTitle }: any) => (
        <div data-testid="app-shell">
            <h1>{headerTitle}</h1>
            {children}
        </div>
    ),
}));

// Mock useAuth hook
vi.mock('@/features/auth/hooks/useAuth', () => ({
    useAuth: () => ({
        isAuthenticated: true,
        isLoading: false,
    }),
}));

// Mock useWallet hooks
vi.mock('@/features/wallet/hooks/useWallet', () => ({
    useWallet: vi.fn(),
    useWalletHistory: vi.fn(),
}));

// Mock useWalletMutations
vi.mock('@/features/wallet/hooks/useWalletMutations', () => ({

    useWithdrawWallet: vi.fn(() => ({
        mutateAsync: vi.fn(),
        isPending: false,
    })),
}));

// Setup mock for toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

import WalletPage from '@/app/wallet/page';
import { useWallet, useWalletHistory } from '@/features/wallet/hooks/useWallet';

const mockWallet: Wallet = {
    walletId: 1,
    balance: 15000,
};

const mockTransactions: WalletTransaction[] = [
    {
        id: 't1',
        type: 'PAYMENT',
        amount: 4500,
        balanceAfter: 15000,
        description: '스타벅스 아메리카노 구매',
        relatedId: null,
        createdAt: '2026-01-15T10:00:00Z',
    },
    {
        id: 't2',
        type: 'CHARGE',
        amount: 20000,
        balanceAfter: 19500,
        description: '포인트 충전',
        relatedId: null,
        createdAt: '2026-01-10T10:00:00Z',
    },
];

describe('WalletPage Feature', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        (useWallet as any).mockReturnValue({
            data: mockWallet,
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });

        (useWalletHistory as any).mockReturnValue({
            data: {
                content: mockTransactions,
                items: mockTransactions,
                page: { page: 0, size: 20, totalElements: 2, totalPages: 1, hasNext: false, hasPrevious: false }
            },
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });
    });

    it('GIVEN wallet page, THEN it should display balance', () => {
        render(<WalletPage />);

        // Balance is rendered as separate text nodes: "15,000" and "P"
        expect(screen.getByText('15,000')).toBeInTheDocument();
        expect(screen.getByText('P')).toBeInTheDocument();
    });

    it('GIVEN wallet page, THEN it should display transaction history', () => {
        render(<WalletPage />);

        // Transaction History
        expect(screen.getByText('스타벅스 아메리카노 구매')).toBeInTheDocument();
        expect(screen.getByText('포인트 충전')).toBeInTheDocument();
    });

    it('GIVEN wallet page, THEN it should show charge button', () => {
        render(<WalletPage />);

        // Use getAllByRole and check at least one exists
        const chargeButtons = screen.getAllByRole('button', { name: /충전/i });
        expect(chargeButtons.length).toBeGreaterThan(0);
    });
});
