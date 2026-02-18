import { AlertCircle, ServerCrash, WifiOff, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InlineErrorProps {
    message?: string;
    error?: unknown;
    onRetry?: () => void;
    fullPage?: boolean;
}

function getErrorInfo(error: unknown): { icon: 'server' | 'network' | 'default'; message: string } {
    if (!error) return { icon: 'default', message: '데이터를 불러오는데 실패했습니다.' };

    const status = error instanceof Object && 'status' in error ? (error as { status: number }).status : undefined;
    const errorMessage = error instanceof Error ? error.message : '';

    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('ERR_CONNECTION_REFUSED')) {
        return { icon: 'network', message: '서버에 연결할 수 없습니다.\n네트워크 연결을 확인하거나 잠시 후 다시 시도해 주세요.' };
    }

    if ((status !== undefined && status >= 500) || errorMessage.includes('Internal Server Error')) {
        return { icon: 'server', message: '서버에 일시적인 문제가 발생했습니다.\n잠시 후 다시 시도해 주세요.' };
    }

    return { icon: 'default', message: '데이터를 불러오는데 실패했습니다.' };
}

const ICONS = {
    server: ServerCrash,
    network: WifiOff,
    default: AlertCircle,
};

export function InlineError({
    message,
    error,
    onRetry,
    fullPage = false,
}: InlineErrorProps) {
    const errorInfo = error ? getErrorInfo(error) : null;
    const isServerOrNetwork = errorInfo?.icon === 'server' || errorInfo?.icon === 'network';
    const displayMessage = isServerOrNetwork ? errorInfo!.message : (message ?? errorInfo?.message ?? '데이터를 불러오는데 실패했습니다.');
    const IconComponent = ICONS[errorInfo?.icon ?? 'default'];

    return (
        <div className={`flex flex-col items-center justify-center px-4 ${fullPage ? 'min-h-[60vh]' : 'py-16'}`}>
            <IconComponent className={`mb-4 text-muted-foreground/50 ${fullPage ? 'h-14 w-14' : 'h-10 w-10'}`} strokeWidth={1} />
            <p className={`text-muted-foreground text-center mb-4 whitespace-pre-line ${fullPage ? 'text-base' : 'text-sm'}`}>
                {displayMessage}
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
