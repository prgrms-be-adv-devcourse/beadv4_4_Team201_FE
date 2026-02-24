'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { createProduct } from '@/lib/api/products';
import { queryKeys } from '@/lib/query/keys';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ChevronLeft } from 'lucide-react';
import type { ProductCreateRequest } from '@/types/product';
import { toast } from 'sonner';
import { ProfileLayout } from '@/components/layout/ProfileLayout';

export const CATEGORIES = [
    { value: 'ELECTRONICS', label: '전자기기' },
    { value: 'BEAUTY', label: '뷰티' },
    { value: 'FASHION', label: '패션' },
    { value: 'LIVING', label: '리빙' },
    { value: 'FOODS', label: '식품' },
    { value: 'TOYS', label: '완구' },
    { value: 'OUTDOOR', label: '아웃도어' },
    { value: 'PET', label: '반려동물' },
    { value: 'KITCHEN', label: '주방' },
];

interface FormState {
    name: string;
    description: string;
    category: string;
    price: string;
    stock: string;
    imageKey: string;
}

export default function NewProductPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [form, setForm] = useState<FormState>({
        name: '',
        description: '',
        category: CATEGORIES[0].value,
        price: '',
        stock: '',
        imageKey: '',
    });

    const mutation = useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            toast.success('상품이 등록되었습니다.');
            queryClient.invalidateQueries({ queryKey: queryKeys.sellerProductsPrefix });
            router.push('/seller/products');
        },
        onError: (err: any) => {
            toast.error(err.message || '상품 등록에 실패했습니다.');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name || !form.description || !form.category || !form.price || !form.stock) {
            toast.error('필수 정보를 모두 입력해주세요.');
            return;
        }

        const priceNum = form.price === '' ? NaN : Number(form.price);
        const stockNum = form.stock === '' ? NaN : Number(form.stock);

        mutation.mutate({
            ...form,
            price: priceNum,
            stock: stockNum,
        });
    };

    return (
        <ProfileLayout>
            <div className="max-w-2xl mx-auto py-10">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <h1 className="text-2xl font-bold">새 상품 등록</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* 기본 정보 */}
                    <div className="space-y-4">
                        <div className="border-b pb-2">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">기본 정보</h2>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">상품명 *</Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="상품 이름을 입력하세요"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">카테고리 *</Label>
                            <select
                                id="category"
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                required
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">상품 설명 *</Label>
                            <textarea
                                id="description"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="상품에 대한 자세한 설명을 입력하세요"
                                required
                            />
                        </div>
                    </div>

                    {/* 가격 및 재고 */}
                    <div className="space-y-4">
                        <div className="border-b pb-2">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">가격 및 재고</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">판매가 (원) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min={0}
                                    onKeyDown={(e) => {
                                        if (e.key === '-') e.preventDefault();
                                    }}
                                    value={form.price}
                                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stock">초기 재고 (개) *</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    min={0}
                                    onKeyDown={(e) => {
                                        if (e.key === '-') e.preventDefault();
                                    }}
                                    value={form.stock}
                                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 이미지 */}
                    <div className="space-y-4">
                        <div className="border-b pb-2">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">이미지</h2>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="imageKey">이미지 키 (이미지 업로드 기능은 추후 제공됩니다)</Label>
                            <Input
                                id="imageKey"
                                value={form.imageKey}
                                onChange={(e) => setForm({ ...form, imageKey: e.target.value })}
                                placeholder="image-key-123"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
                            취소
                        </Button>
                        <Button type="submit" className="flex-1" disabled={mutation.isPending}>
                            {mutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />등록 중...</> : '상품 등록하기'}
                        </Button>
                    </div>
                </form>
            </div>
        </ProfileLayout>
    );
}
