import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Header } from '../Header';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCart } from '@/features/cart/hooks/useCart';

// Mock dependencies
vi.mock('next/navigation', () => ({
    useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
    usePathname: () => '/',
}));

vi.mock('@/features/auth/hooks/useAuth');
vi.mock('@/features/cart/hooks/useCart');
vi.mock('@/features/auth/components/LoginButton', () => ({ LoginButton: () => <button>Login</button> }));
vi.mock('@/features/auth/components/SignupButton', () => ({ SignupButton: () => <button>Signup</button> }));
vi.mock('@/components/common/SearchOverlay', () => ({ SearchOverlay: () => <div data-testid="search-overlay" /> }));

describe('Header Component', () => {
    beforeEach(() => {
        (useAuth as any).mockReturnValue({ user: null, logout: vi.fn() });
        (useCart as any).mockReturnValue({ data: { items: [] } });
    });

    it('renders main navigation links', () => {
        render(<Header variant="main" />);

        expect(screen.getByRole('link', { name: /FUNDING/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /PRODUCT/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /CURATION/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /STORY/i })).toBeInTheDocument();
    });

    it('renders category navigation', () => {
        render(<Header variant="main" />);

        expect(screen.getByText('BIRTHDAY')).toBeInTheDocument();
        expect(screen.getByText('LUXURY')).toBeInTheDocument();
    });

    it('shows mega menu on hover', async () => {
        render(<Header variant="main" />);

        const birthdayLink = screen.getByText('BIRTHDAY');

        // Use fireEvent to simulate hover
        fireEvent.mouseEnter(birthdayLink);

        // Wait for sub-category to appear (state update)
        await waitFor(() => {
            expect(screen.getByText('For Him')).toBeInTheDocument();
        });

        expect(screen.getByText('For Her')).toBeInTheDocument();
    });
});
