'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Login Button Component - 29cm Style
 * Text-only, minimal design
 */
export function LoginButton() {
  return (
    <Button asChild variant="ghost" size="sm">
      <Link href="/auth/login" className="text-sm font-medium">
        로그인
      </Link>
    </Button>
  );
}
