'use client';

import { Button } from '@/components/ui/button';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="flex justify-center">
                    <div className="rounded-full bg-muted p-4">
                        <FileQuestion className="h-12 w-12 text-muted-foreground" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-6xl font-bold tracking-tight text-primary">
                        404
                    </h1>
                    <h2 className="text-xl font-semibold">
                        페이지를 찾을 수 없습니다
                    </h2>
                    <p className="text-muted-foreground">
                        요청하신 페이지가 존재하지 않거나
                        <br />
                        이동되었을 수 있습니다.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild className="gap-2">
                        <Link href="/">
                            <Home className="h-4 w-4" />
                            홈으로
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        이전 페이지
                    </Button>
                </div>
            </div>
        </div>
    );
}
