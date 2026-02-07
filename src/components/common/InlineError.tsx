import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InlineErrorProps {
    message?: string;
    onRetry?: () => void;
}

export function InlineError({
    message = '데이터를 불러오는데 실패했습니다.',
    onRetry,
}: InlineErrorProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <AlertCircle className="h-10 w-10 text-muted-foreground/50 mb-4" strokeWidth={1} />
            <p className="text-sm text-muted-foreground text-center mb-4">
                {message}
            </p>
            {onRetry && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="gap-1.5"
                >
                    <RefreshCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
                    다시 시도
                </Button>
            )}
        </div>
    );
}
