import { render, screen, waitFor } from '@/test/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { ShowcaseContent } from '@/app/showcase/[id]/page';
import { useFunding } from '@/features/funding/hooks/useFunding';

// Mock dependencies
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        back: vi.fn(),
    }),
    usePathname: () => '/showcase/123',
}));

vi.mock('@/components/layout/AppShell', () => ({
    AppShell: ({ children }: { children: React.ReactNode }) => <div data-testid="app-shell">{children}</div>,
}));

vi.mock('@/components/layout/Footer', () => ({
    Footer: () => <div data-testid="footer">Footer</div>,
}));

// Mock `useFunding`
vi.mock('@/features/funding/hooks/useFunding', () => ({
    useFunding: vi.fn(),
}));

describe('ShowcasePage', () => {
    it('renders loading state initially', () => {
        (useFunding as any).mockReturnValue({
            data: undefined,
            isLoading: true,
        });

        render(<ShowcaseContent id="123" />);
        expect(screen.getByText('Loading Product')).toBeInTheDocument();
    });

    it('renders funding showcase content when data is loaded', async () => {
        (useFunding as any).mockReturnValue({
            data: {
                id: '123',
                product: {
                    name: 'Test Product',
                    price: 10000,
                    imageUrl: 'https://example.com/test.jpg',
                    status: 'ON_SALE',
                },
                currentAmount: 5000,
                targetAmount: 10000,
                organizer: { nickname: 'TestUser' },
                recipient: { nickname: 'Friend' },
                // ...other funding fields
            },
            isLoading: false,
        });

        // We need to await finding the element because `use(params)` might be async in effect
        // However, in client components `use` might suspend. 
        // Testing-library handles suspense with `waitFor` usually.

        render(<ShowcaseContent id="123" />);

        await waitFor(() => {
            expect(screen.getByText('Test Product')).toBeInTheDocument();
        });

        expect(screen.getByText('SPECIAL FUNDING PRODUCT')).toBeInTheDocument();
    });
});
