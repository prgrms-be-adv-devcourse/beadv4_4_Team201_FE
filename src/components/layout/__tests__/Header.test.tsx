import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Header } from '../Header';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCart } from '@/features/cart/hooks/useCart';
import { useWallet } from '@/features/wallet/hooks/useWallet';

// Mock dependencies
vi.mock('next/navigation', () => ({
    useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
    usePathname: () => '/',
}));

vi.mock('@/features/auth/hooks/useAuth');
vi.mock('@/features/cart/hooks/useCart');
vi.mock('@/features/wallet/hooks/useWallet');
vi.mock('@/features/auth/components/LoginButton', () => ({ LoginButton: () => <button>Login</button> }));
vi.mock('@/features/auth/components/SignupButton', () => ({ SignupButton: () => <button>Signup</button> }));
vi.mock('@/components/common/SearchOverlay', () => ({ SearchOverlay: () => <div data-testid="search-overlay" /> }));

function renderWithProviders(ui: React.ReactElement) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return render(
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
}

describe('Header Component', () => {
    beforeEach(() => {
        (useAuth as any).mockReturnValue({ user: null, logout: vi.fn() });
        (useCart as any).mockReturnValue({ data: { items: [] } });
        (useWallet as any).mockReturnValue({ data: undefined });
    });

    it('renders main navigation links', () => {
        renderWithProviders(<Header variant="main" />);

        expect(screen.getByRole('link', { name: /PRODUCT/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /DISCOVER/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /STORY/i })).toBeInTheDocument();
    });

    it('shows categories on PRODUCT hover', async () => {
        renderWithProviders(<Header variant="main" />);

        const productLink = screen.getByRole('link', { name: /PRODUCT/i });
        fireEvent.mouseEnter(productLink.parentElement!);

        await waitFor(() => {
            expect(screen.getByText('전자기기')).toBeInTheDocument();
        });

        expect(screen.getByText('뷰티')).toBeInTheDocument();
    });

    it('shows Event and Trend on STORY hover', async () => {
        renderWithProviders(<Header variant="main" />);

        const storyLink = screen.getByRole('link', { name: /STORY/i });
        fireEvent.mouseEnter(storyLink.parentElement!);

        await waitFor(() => {
            expect(screen.getByText('Event')).toBeInTheDocument();
        });

        expect(screen.getByText('Trend')).toBeInTheDocument();
    });
});
