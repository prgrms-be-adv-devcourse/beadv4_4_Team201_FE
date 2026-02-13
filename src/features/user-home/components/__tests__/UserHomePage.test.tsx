import { render, screen, waitFor } from '@/test/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { UserHomeContent } from '@/app/u/[userId]/page';

// Mock dependencies
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
    usePathname: () => '/u/user-1',
}));

vi.mock('@/components/layout/AppShell', () => ({
    AppShell: ({ children }: { children: React.ReactNode }) => <div data-testid="app-shell">{children}</div>,
}));

vi.mock('@/components/layout/Footer', () => ({
    Footer: () => <div data-testid="footer">Footer</div>,
}));

vi.mock('next/image', () => ({
    default: (props: any) => <img {...props} alt={props.alt} />,
}));

// Mock basic components used in UserHomePage
vi.mock('@/components/common/FundingCard', () => ({
    FundingCard: ({ funding }: any) => <div data-testid="funding-card">{funding.product.name}</div>,
}));

// Mock useProfile hook
vi.mock('@/features/profile/hooks/useProfile', () => ({
    useProfile: () => ({
        data: {
            id: 1,
            nickname: 'Giftify Curator',
            avatarUrl: 'https://example.com/avatar.jpg',
        },
        isLoading: false,
        error: null,
    }),
}));



describe('UserHomePage', () => {
    it('renders user profile and content tabs', async () => {
        render(<UserHomeContent userId="user-1" />);

        await waitFor(() => {
            // User nickname from mock data
            expect(screen.getByText('Giftify Curator')).toBeInTheDocument();
        });

        // Check tabs
        expect(screen.getByText(/진행중인 펀딩/)).toBeInTheDocument();
        expect(screen.getByText(/종료된 펀딩/)).toBeInTheDocument();
        expect(screen.getByText(/받은 후기/)).toBeInTheDocument();

        // Check if funding cards are rendered (Ongoing tab is default)
        expect(screen.getAllByTestId('funding-card').length).toBeGreaterThan(0);
    });
});
