'use client';

import { useState } from 'react';

import { AlertCircle, Loader2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWithdrawWallet } from '@/features/wallet/hooks/useWalletMutations';
import type { BankOption } from '@/types/wallet';

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;
}

const WITHDRAW_AMOUNTS = [10000, 30000, 50000, 100000];
const MIN_WITHDRAW_AMOUNT = 1000;

const BANK_OPTIONS: BankOption[] = [
  { code: '004', name: 'KB국민은행' },
  { code: '088', name: '신한은행' },
  { code: '020', name: '우리은행' },
  { code: '081', name: '하나은행' },
];

export function WithdrawModal({ open, onOpenChange, currentBalance }: WithdrawModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [bankCode, setBankCode] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');

  const withdrawMutation = useWithdrawWallet();

  const amount = selectedAmount ?? Number(customAmount);
  const isValidAmount = amount >= MIN_WITHDRAW_AMOUNT && amount <= currentBalance;
  const isFormValid = isValidAmount && bankCode !== '' && accountNumber.trim() !== '';
  const isProcessing = withdrawMutation.isPending;

  const handleWithdraw = async () => {
    if (!isFormValid) {
      return;
    }

    try {
      await withdrawMutation.mutateAsync({
        amount,
        bankCode,
        accountNumber: accountNumber.trim(),
      });

      toast.success(`${amount.toLocaleString()}원 출금이 요청되었습니다.`);
      handleOpenChange(false);
    } catch {
      toast.error('출금 요청 중 오류가 발생했습니다.');
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
      setBankCode('');
      setAccountNumber('');
    }
    onOpenChange(isOpen);
  };

  const getAmountValidationMessage = () => {
    if (amount > 0 && amount < MIN_WITHDRAW_AMOUNT) {
      return `최소 ${MIN_WITHDRAW_AMOUNT.toLocaleString()}원 이상 출금 가능합니다.`;
    }
    if (amount > currentBalance) {
      return '잔액이 부족합니다.';
    }
    return null;
  };

  const validationMessage = getAmountValidationMessage();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>예치금 출금</DialogTitle>
          <DialogDescription>출금할 금액과 계좌를 입력해주세요.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* 금액 선택 버튼 */}
          <div className="grid grid-cols-2 gap-3">
            {WITHDRAW_AMOUNTS.map((presetAmount) => (
              <Button
                key={presetAmount}
                variant={selectedAmount === presetAmount ? 'default' : 'outline'}
                className={selectedAmount === presetAmount ? 'border-primary' : ''}
                onClick={() => handlePresetAmountClick(presetAmount)}
                disabled={isProcessing || presetAmount > currentBalance}
              >
                {presetAmount.toLocaleString()}원
              </Button>
            ))}
          </div>

          {/* 직접 입력 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">직접 입력</label>
            <Input
              type="number"
              placeholder="금액 입력..."
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              min={MIN_WITHDRAW_AMOUNT}
              max={currentBalance}
              disabled={isProcessing}
            />
            <p className="text-xs text-muted-foreground">
              현재 잔액: {currentBalance.toLocaleString()}P
            </p>
            {validationMessage && (
              <p className="text-xs text-destructive">{validationMessage}</p>
            )}
          </div>

          {/* 출금 계좌 정보 */}
          <div className="space-y-3">
            <label className="text-sm font-medium">출금 계좌 정보</label>
            <Select value={bankCode} onValueChange={setBankCode} disabled={isProcessing}>
              <SelectTrigger>
                <SelectValue placeholder="은행을 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                {BANK_OPTIONS.map((bank) => (
                  <SelectItem key={bank.code} value={bank.code}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="text"
              placeholder="계좌번호 입력"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          {/* 안내 문구 */}
          <div className="flex items-start gap-2 rounded-md border bg-muted/50 p-3">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              출금은 1-2 영업일 소요됩니다.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            className="w-full font-bold"
            onClick={handleWithdraw}
            disabled={!isFormValid || isProcessing}
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {amount > 0 ? `${amount.toLocaleString()}원 출금하기` : '금액을 선택해주세요'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
