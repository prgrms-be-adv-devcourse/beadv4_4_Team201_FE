import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard } from 'lucide-react';

interface TossPaymentWidgetProps {
    amount: number;
    onSuccess: () => void;
    onFail: (error: string) => void;
}

export function TossPaymentWidget({ amount, onSuccess, onFail }: TossPaymentWidgetProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async () => {
        setIsProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            const success = Math.random() > 0.1; // 90% success rate

            if (success) {
                onSuccess();
            } else {
                onFail('결제에 실패했습니다. 다시 시도해주세요.');
            }

            setIsProcessing(false);
        }, 2000);
    };

    return (
        <Card className="border-border">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    모의 결제 위젯
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">충전 금액</span>
                        <span className="font-semibold">{amount.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">결제 방법</span>
                        <span className="font-semibold">카드 결제</span>
                    </div>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                        이것은 모의 결제 시스템입니다. 실제 결제는 진행되지 않습니다.
                    </p>
                </div>

                <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full font-bold"
                    size="lg"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            결제 처리중...
                        </>
                    ) : (
                        `${amount.toLocaleString()}원 결제하기`
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
