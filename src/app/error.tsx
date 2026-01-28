'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Log error to error reporting service
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="flex justify-center">
                    <div className="rounded-full bg-destructive/10 p-4">
                        <AlertTriangle className="h-12 w-12 text-destructive" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">
                        문제가 발생했습니다
                    </h1>
                    <p className="text-muted-foreground">
                        예기치 않은 오류가 발생했습니다.
                        <br />
                        잠시 후 다시 시도해 주세요.
                    </p>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="rounded-lg bg-muted p-4 text-left">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                            Error Details (개발 환경)
                        </p>
                        <p className="text-sm font-mono text-destructive break-all">
                            {error.message}
                        </p>
                        {error.digest && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Digest: {error.digest}
                            </p>
                        )}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={reset} className="gap-2">
                        <RefreshCcw className="h-4 w-4" />
                        다시 시도
                    </Button>
                    <Button variant="outline" asChild className="gap-2">
                        <Link href="/">
                            <Home className="h-4 w-4" />
                            홈으로
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
