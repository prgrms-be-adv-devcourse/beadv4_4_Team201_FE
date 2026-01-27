'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import { Loader2, Link as LinkIcon, Plus } from 'lucide-react';

// NOTE: shadcn/ui Label component might not be installed yet.
// I'll stick to native label or install it. Let's assume native for now to reduce overhead, or check if I installed it.
// I installed: button card input avatar badge progress sheet skeleton separator scroll-area tabs dialog dropdown-menu
// Label is NOT in the list. I'll use native <label>.

export function AddItemDrawer({
    children,
    onAdd
}: {
    children: React.ReactNode;
    onAdd: (item: any) => void;
}) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<'URL' | 'DETAILS'>('URL');
    const [loading, setLoading] = useState(false);
    const [url, setUrl] = useState('');

    // Details state
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');

    const handleCrawl = async () => {
        if (!url) return;
        setLoading(true);
        // Simulate crawling delay
        setTimeout(() => {
            setLoading(false);
            setStep('DETAILS');
            // Mock result
            setName('URL에서 가져온 상품명 예시');
            setPrice('50000');
        }, 1500);
    };

    const handleSubmit = () => {
        onAdd({
            name,
            price: Number(price),
            url,
            imageUrl: '/images/placeholder-product-1.jpg'
        });
        setOpen(false);
        reset();
    };

    const reset = () => {
        setStep('URL');
        setUrl('');
        setName('');
        setPrice('');
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle>위시리스트 담기</DrawerTitle>
                        <DrawerDescription>
                            {step === 'URL'
                                ? '상품 링크를 입력하면 정보를 자동으로 가져옵니다.'
                                : '상품 정보를 확인해주세요.'}
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-4 pb-0 space-y-4">
                        {step === 'URL' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">상품 URL</label>
                                <div className="flex gap-2">
                                    <Input
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://..."
                                    />
                                    <Button onClick={handleCrawl} disabled={!url || loading}>
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 'DETAILS' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">상품명</label>
                                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">가격</label>
                                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                                </div>
                            </div>
                        )}
                    </div>

                    <DrawerFooter>
                        {step === 'DETAILS' ? (
                            <Button onClick={handleSubmit}>저장하기</Button>
                        ) : (
                            <Button variant="ghost" onClick={() => setStep('DETAILS')} className="text-xs text-muted-foreground">
                                직접 입력하기
                            </Button>
                        )}
                        <DrawerClose asChild>
                            <Button variant="outline" onClick={reset}>취소</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
