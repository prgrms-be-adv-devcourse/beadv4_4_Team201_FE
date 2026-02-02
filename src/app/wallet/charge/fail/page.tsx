'use client';

import { Suspense, useEffect, useState } from 'react';

import { AlertTriangle, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FailInfo {
  code: string;
  message: string;
}

// Toss 에러 코드에 따른 사용자 친화적 메시지
const ERROR_MESSAGES: Record<string, string> = {
  PAY_PROCESS_CANCELED: '결제가 취소되었습니다.',
  PAY_PROCESS_ABORTED: '결제가 중단되었습니다.',
  REJECT_CARD_COMPANY: '카드사에서 결제를 거절했습니다.',
  INVALID_CARD_NUMBER: '유효하지 않은 카드 번호입니다.',
  INVALID_CARD_EXPIRY: '카드 유효기간이 올바르지 않습니다.',
  EXCEED_MAX_DAILY_PAYMENT_COUNT: '일일 결제 한도를 초과했습니다.',
  EXCEED_MAX_PAYMENT_AMOUNT: '결제 한도를 초과했습니다.',
  NOT_SUPPORTED_INSTALLMENT_PLAN: '할부 결제가 지원되지 않습니다.',
  INVALID_STOPPED_CARD: '정지된 카드입니다.',
  EXCEED_MAX_AMOUNT: '결제 금액이 한도를 초과했습니다.',
  INVALID_CARD_LOST_OR_STOLEN: '분실/도난 신고된 카드입니다.',
  NOT_ALLOWED_POINT_USE: '포인트 사용이 불가한 카드입니다.',
  REJECT_ACCOUNT_PAYMENT: '계좌 결제가 거절되었습니다.',
  NOT_AVAILABLE_PAYMENT: '결제가 불가능한 상태입니다.',
};

function LoadingFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center">
            <p className="text-lg font-semibold">페이지 로딩 중...</p>
            <p className="text-sm text-muted-foreground">잠시만 기다려주세요.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ChargeFailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [failInfo, setFailInfo] = useState<FailInfo>({
    code: '',
    message: '결제에 실패했습니다.',
  });

  useEffect(() => {
    // sessionStorage 정리
    sessionStorage.removeItem('pendingPaymentId');

    // URL에서 에러 정보 추출
    const code = searchParams.get('code') ?? '';
    const message = searchParams.get('message') ?? '';

    // 사용자 친화적 메시지 매핑
    const userMessage = ERROR_MESSAGES[code] ?? message ?? '결제에 실패했습니다.';

    setFailInfo({
      code,
      message: userMessage,
    });
  }, [searchParams]);

  const handleRetry = () => {
    router.push('/wallet');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <AlertTriangle className="h-16 w-16 text-amber-500" />
          </div>
          <CardTitle>결제 실패</CardTitle>
          <CardDescription>{failInfo.message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {failInfo.code && (
            <p className="text-center text-xs text-muted-foreground">에러 코드: {failInfo.code}</p>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleGoHome} className="flex-1">
              홈으로
            </Button>
            <Button onClick={handleRetry} className="flex-1">
              다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ChargeFailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ChargeFailContent />
    </Suspense>
  );
}
