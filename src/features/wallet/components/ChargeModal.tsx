import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChargeWallet } from '@/features/wallet/hooks/useWalletMutations';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ChargeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const CHARGE_AMOUNTS = [10000, 30000, 50000, 100000];

export function ChargeModal({ open, onOpenChange }: ChargeModalProps) {
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState<string>('');
    const chargeWallet = useChargeWallet();

    const handleCharge = async () => {
        const amount = selectedAmount ?? Number(customAmount);
        if (!amount || amount <= 0) {
            toast.error('충전할 금액을 선택하거나 입력해주세요.');
            return;
        }

        try {
            await chargeWallet.mutateAsync({ amount });
            toast.success(`${amount.toLocaleString()}원이 충전되었습니다.`);
            onOpenChange(false);
            setSelectedAmount(null);
            setCustomAmount('');
        } catch (error) {
            toast.error('충전 중 오류가 발생했습니다.');
        }
    };

    const handleCustomAmountChange = (value: string) => {
        setCustomAmount(value);
        setSelectedAmount(null);
    };

    const handlePresetAmountClick = (amount: number) => {
        setSelectedAmount(amount);
        setCustomAmount('');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>포인트 충전</DialogTitle>
                    <DialogDescription>
                        충전할 금액을 선택하거나 직접 입력해주세요.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-3">
                        {CHARGE_AMOUNTS.map((amount) => (
                            <Button
                                key={amount}
                                variant={selectedAmount === amount ? "default" : "outline"}
                                className={selectedAmount === amount ? "border-primary" : ""}
                                onClick={() => handlePresetAmountClick(amount)}
                            >
                                {amount.toLocaleString()}원
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
                            min="0"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        className="w-full font-bold"
                        onClick={handleCharge}
                        disabled={(!selectedAmount && !customAmount) || chargeWallet.isPending}
                    >
                        {chargeWallet.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {selectedAmount || customAmount
                            ? `${(selectedAmount ?? Number(customAmount)).toLocaleString()}원 충전하기`
                            : '금액을 선택해주세요'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
