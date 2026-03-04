import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GlobalError from '../global-error';

describe('GlobalError', () => {
    const mockReset = vi.fn();
    const mockError = Object.assign(new Error('Test error message'), { digest: 'abc123' });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('GIVEN an error, THEN it should display the error heading', () => {
        render(<GlobalError error={mockError} reset={mockReset} />);
        expect(screen.getByText('심각한 오류가 발생했습니다')).toBeInTheDocument();
    });

    it('GIVEN an error, THEN it should display guidance text', () => {
        render(<GlobalError error={mockError} reset={mockReset} />);
        expect(screen.getByText(/페이지를 새로고침하거나 홈으로 이동해 주세요/)).toBeInTheDocument();
    });

    it('GIVEN reset button clicked, THEN it should call reset function', async () => {
        const user = userEvent.setup();
        render(<GlobalError error={mockError} reset={mockReset} />);

        await user.click(screen.getByText('다시 시도'));
        expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it('GIVEN home button clicked, THEN it should navigate to home', async () => {
        const user = userEvent.setup();
        // Mock window.location
        delete (window as any).location;
        (window as any).location = { href: '' };

        render(<GlobalError error={mockError} reset={mockReset} />);
        await user.click(screen.getByText('홈으로'));

        // Verify window.location.href was set to '/'
        expect(window.location.href).toBe('/');
    });

    it('GIVEN development env, THEN it should show error details', () => {
        const originalEnv = process.env.NODE_ENV;

        // Set NODE_ENV to 'development' to show error details
        vi.stubEnv('NODE_ENV', 'development');

        render(<GlobalError error={mockError} reset={mockReset} />);
        expect(screen.getByText('Test error message')).toBeInTheDocument();
        expect(screen.getByText(/Digest: abc123/)).toBeInTheDocument();

        vi.unstubAllEnvs();
    });

    it('GIVEN production env, THEN it should NOT show error details', () => {
        // Set NODE_ENV to 'production' to hide error details
        vi.stubEnv('NODE_ENV', 'production');

        render(<GlobalError error={mockError} reset={mockReset} />);
        expect(screen.queryByText('Test error message')).not.toBeInTheDocument();
        expect(screen.queryByText(/Digest: abc123/)).not.toBeInTheDocument();

        vi.unstubAllEnvs();
    });
});
