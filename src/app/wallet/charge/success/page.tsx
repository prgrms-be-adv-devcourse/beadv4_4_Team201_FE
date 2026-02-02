'use client';

import { useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { confirmPayment } from '@/lib/api/payment';
import { queryKeys } from '@/lib/query/keys';

type PageStatus = 'loading' | 'success' | 'error';

interface ErrorState {
  code: string;
  message: string;
}

export default function ChargeSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<PageStatus>('loading');
  const [error, setError] = useState<ErrorState | null>(null);
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    const processPayment = async () => {
      try {
        // URL에서 Toss 결제 결과 파라미터 추출
        const paymentKey = searchParams.get('paymentKey');
        const orderId = searchParams.get('orderId');
        const amountParam = searchParams.get('amount');

        // sessionStorage에서 paymentId 가져오기
        const paymentIdStr = sessionStorage.getItem('pendingPaymentId');

        // 필수 파라미터 검증
        if (!paymentKey || !orderId || !amountParam || !paymentIdStr) {
          throw {
            code: 'INVALID_PARAMS',
            message: '결제 정보가 올바르지 않습니다.',
          };
        }

        const paymentId = parseInt(paymentIdStr, 10);
        const parsedAmount = parseInt(amountParam, 10);
        setAmount(parsedAmount);

        // 백엔드에 결제 승인 요청
        const result = await confirmPayment({
          paymentId,
          paymentKey,
          orderId,
          amount: parsedAmount,
        });

        if (result.success) {
          // 성공: sessionStorage 정리 및 캐시 무효화
          sessionStorage.removeItem('pendingPaymentId');
          queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
          queryClient.invalidateQueries({ queryKey: queryKeys.walletHistory() });
          setStatus('success');
        } else {
          throw {
            code: result.errorCode ?? 'CONFIRM_FAILED',
            message: result.errorMessage ?? '결제 승인에 실패했습니다.',
          };
        }
      } catch (err) {
        console.error('결제 승인 처리 실패:', err);
        sessionStorage.removeItem('pendingPaymentId');

        if (err && typeof err === 'object' && 'code' in err) {
          setError(err as ErrorState);
        } else {
          setError({
            code: 'UNKNOWN_ERROR',
            message: '결제 처리 중 오류가 발생했습니다.',
          });
        }
        setStatus('error');
      }
    };

    processPayment();
  }, [searchParams, queryClient]);

  const handleGoToWallet = () => {
    router.push('/wallet');
  };

  const handleRetry = () => {
    router.push('/wallet');
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-lg font-semibold">결제 처리 중...</p>
              <p className="text-sm text-muted-foreground">잠시만 기다려주세요.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <XCircle className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle>결제 실패</CardTitle>
            <CardDescription>{error?.message ?? '결제 처리 중 오류가 발생했습니다.'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error?.code && (
              <p className="text-center text-xs text-muted-foreground">에러 코드: {error.code}</p>
            )}
            <Button onClick={handleRetry} className="w-full">
              다시 시도하기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle>충전 완료!</CardTitle>
          <CardDescription>포인트가 성공적으로 충전되었습니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground">충전 금액</p>
            <p className="text-2xl font-bold">{amount.toLocaleString()}원</p>
          </div>
          <Button onClick={handleGoToWallet} className="w-full">
            지갑으로 이동
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            ※ 본 결제는 테스트 결제이며 실제 비용이 청구되지 않았습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
