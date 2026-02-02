'use client';

import { useState } from 'react';

import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTossPayments } from '@/features/wallet/hooks/useTossPayments';
import { createChargePayment } from '@/lib/api/payment';

interface ChargeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CHARGE_AMOUNTS = [10000, 30000, 50000, 100000];
const MIN_CHARGE_AMOUNT = 1000;
const MAX_CHARGE_AMOUNT = 1000000;

export function ChargeModal({ open, onOpenChange }: ChargeModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');

  // 회원 정보 가져오기
  const { user } = useAuth();
  // Toss는 customerKey에 | 문자를 허용하지 않으므로 _ 로 대체
  const customerKey = (user?.sub ?? 'anonymous').replace(/\|/g, '_');

  // Toss SDK 훅
  const { isReady: isTossReady, isLoading: isTossLoading, requestPayment } = useTossPayments(customerKey);

  // Payment 생성 mutation
  const createPaymentMutation = useMutation({
    mutationFn: createChargePayment,
    onError: (error) => {
      console.error('Payment 생성 실패:', error);
      toast.error('결제 준비 중 오류가 발생했습니다.');
    },
  });

  const amount = selectedAmount ?? Number(customAmount);
  const isValidAmount = amount >= MIN_CHARGE_AMOUNT && amount <= MAX_CHARGE_AMOUNT;
  const isProcessing = createPaymentMutation.isPending;

  const handleCharge = async () => {
    if (!isValidAmount) {
      toast.error(`${MIN_CHARGE_AMOUNT.toLocaleString()}원 ~ ${MAX_CHARGE_AMOUNT.toLocaleString()}원 사이의 금액을 입력해주세요.`);
      return;
    }

    if (!isTossReady) {
      toast.error('결제 시스템을 준비 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    try {
      // 1. Payment 레코드 생성
      const paymentResult = await createPaymentMutation.mutateAsync({ amount });

      // 2. paymentId를 sessionStorage에 저장 (success 페이지에서 사용)
      sessionStorage.setItem('pendingPaymentId', paymentResult.paymentId.toString());

      // 3. Toss SDK 결제창 호출 (리다이렉트됨)
      await requestPayment({
        orderId: paymentResult.orderId,
        amount: paymentResult.amount,
        method: 'CARD',
        easyPay: 'TOSSPAY',
        orderName: 'Giftify 캐시 충전',
        customerEmail: user?.email ?? undefined,
        customerName: user?.name ?? undefined,
      });

      // 여기까지 오면 사용자가 결제창을 닫은 것
      // (성공 시 successUrl로 리다이렉트되므로 여기까지 안 옴)
    } catch (error) {
      // 사용자가 결제창 닫기 또는 에러
      console.error('결제 요청 실패:', error);
      sessionStorage.removeItem('pendingPaymentId');
      // Toss SDK에서 취소한 경우 에러 메시지 표시하지 않음
      if (error instanceof Error && !error.message.includes('사용자')) {
        toast.error('결제 요청 중 오류가 발생했습니다.');
      }
    }
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const handlePresetAmountClick = (presetAmount: number) => {
    setSelectedAmount(presetAmount);
    setCustomAmount('');
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // 모달 닫힐 때 상태 초기화
      setSelectedAmount(null);
      setCustomAmount('');
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>포인트 충전</DialogTitle>
          <DialogDescription>충전할 금액을 선택하거나 직접 입력해주세요.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            {CHARGE_AMOUNTS.map((presetAmount) => (
              <Button
                key={presetAmount}
                variant={selectedAmount === presetAmount ? 'default' : 'outline'}
                className={selectedAmount === presetAmount ? 'border-primary' : ''}
                onClick={() => handlePresetAmountClick(presetAmount)}
                disabled={isProcessing}
              >
                {presetAmount.toLocaleString()}원
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">직접 입력</label>
            <Input
              type="number"
              placeholder="충전할 금액을 입력하세요"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              min={MIN_CHARGE_AMOUNT}
              max={MAX_CHARGE_AMOUNT}
              disabled={isProcessing}
            />
            <p className="text-xs text-muted-foreground">
              {MIN_CHARGE_AMOUNT.toLocaleString()}원 ~ {MAX_CHARGE_AMOUNT.toLocaleString()}원
            </p>
          </div>

          {/* 토스페이로 결제됩니다 */}
          <div className="flex items-center justify-center gap-2 rounded-md border bg-secondary/30 p-3">
            <span className="text-xl">🔵</span>
            <span className="text-sm font-medium">토스페이로 결제됩니다</span>
          </div>

          <div className="rounded-md bg-amber-50 p-3 border border-amber-200">
            <p className="text-xs text-amber-800 font-medium text-center">
              ⚠️ 본 결제는 테스트 결제입니다.
              <br />
              실제 결제가 발생하지 않으니 안심하고 진행해주세요.
            </p>
          </div>

          {isTossLoading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              결제 시스템 준비 중...
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            className="w-full font-bold"
            onClick={handleCharge}
            disabled={!isValidAmount || isProcessing || !isTossReady}
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {amount > 0 ? `${amount.toLocaleString()}원 충전하기` : '금액을 선택해주세요'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
