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
            id: 'member-dev',
            nickname: 'TestUser',
            avatarUrl: 'https://i.pravatar.cc/150?u=dev',
        },
        isLoading: false,
        error: null,
    }),
}));

// Mock useMember hook
vi.mock('@/features/member/hooks/useMember', () => ({
    useMember: () => ({
        data: {
            id: 'user-1',
            nickname: 'TestUser',
            avatarUrl: 'https://i.pravatar.cc/150?u=dev',
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
    }),
}));

// Mock useAuth hook
vi.mock('@/features/auth/hooks/useAuth', () => ({
    useAuth: () => ({
        user: {
            sub: 'auth0|dev-user-123',
            picture: 'https://i.pravatar.cc/150?u=dev',
        },
        isLoading: false,
    }),
}));



describe('UserHomePage', () => {
    it('renders user profile and content tabs', async () => {
        render(<UserHomeContent userId="user-1" />);

        await waitFor(() => {
            // User nickname from mock data
            expect(screen.getByText('TestUser')).toBeInTheDocument();
        });

        // Check tabs (may appear multiple times in DOM)
        expect(screen.getAllByText(/진행중인 펀딩/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/종료된 펀딩/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/받은 후기/).length).toBeGreaterThan(0);
    });
});
