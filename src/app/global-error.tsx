'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    useEffect(() => {
        console.error('Global error:', error);
    }, [error]);

    return (
        <html lang="ko">
            <head>
                <link
                    rel="stylesheet"
                    as="style"
                    crossOrigin="anonymous"
                    href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
                />
            </head>
            <body style={{ fontFamily: '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif', margin: 0 }}>
                <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ borderRadius: '9999px', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1rem' }}>
                                <svg style={{ width: '3rem', height: '3rem', color: 'rgb(239, 68, 68)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                심각한 오류가 발생했습니다
                            </h1>
                            <p style={{ color: 'rgb(115, 115, 115)' }}>
                                애플리케이션에 예기치 않은 문제가 발생했습니다.
                                <br />
                                페이지를 새로고침하거나 홈으로 이동해 주세요.
                            </p>
                        </div>

                        {process.env.NODE_ENV === 'development' && (
                            <div style={{ borderRadius: '0.5rem', backgroundColor: 'rgb(245, 245, 245)', padding: '1rem', textAlign: 'left', marginBottom: '1.5rem' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: '500', color: 'rgb(115, 115, 115)', marginBottom: '0.25rem' }}>
                                    Error Details (개발 환경)
                                </p>
                                <p style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: 'rgb(239, 68, 68)', wordBreak: 'break-all' }}>
                                    {error.message}
                                </p>
                                {error.digest && (
                                    <p style={{ fontSize: '0.75rem', color: 'rgb(115, 115, 115)', marginTop: '0.5rem' }}>
                                        Digest: {error.digest}
                                    </p>
                                )}
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center' }}>
                            <button
                                onClick={reset}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    backgroundColor: 'rgb(24, 24, 27)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    cursor: 'pointer',
                                }}
                            >
                                <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                다시 시도
                            </button>
                            <button
                                onClick={() => { window.location.href = '/'; }}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    backgroundColor: 'white',
                                    color: 'rgb(24, 24, 27)',
                                    border: '1px solid rgb(228, 228, 231)',
                                    borderRadius: '0.375rem',
                                    cursor: 'pointer',
                                }}
                            >
                                <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                홈으로
                            </button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
