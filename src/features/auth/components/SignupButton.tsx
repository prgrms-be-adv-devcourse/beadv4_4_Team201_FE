'use client';

import { Button } from '@/components/ui/button';

/**
 * Signup Button Component - 29cm Style
 * Minimal filled button
 */
export function SignupButton() {
    return (
        <Button asChild variant="default" size="sm">
            <a href="/auth/login?screen_hint=signup" className="text-sm font-medium">
                회원가입
            </a>
        </Button>
    );
}
