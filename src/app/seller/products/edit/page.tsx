'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getSellerProducts, updateProduct } from '@/lib/api/products';
import { queryKeys } from '@/lib/query/keys';
import type { ProductUpdateRequest } from '@/types/product';
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
    status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'REJECTED';
    imageKey: string;
}

export default function EditProductPage() {
    return (
        <Suspense fallback={
            <ProfileLayout>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </ProfileLayout>
        }>
            <EditProductContent />
        </Suspense>
    );
}

function EditProductContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productIdStr = searchParams.get('id');
    const productId = productIdStr ? Number(productIdStr) : null;
    const queryClient = useQueryClient();
    const expectedStockRef = useRef<number>(0);

    const [form, setForm] = useState<FormState>({
        name: '',
        description: '',
        category: '',
        price: '',
        stock: '',
        status: 'DRAFT',
        imageKey: '',
    });

    // NOTE: GET /api/v2/products/my/{id} 미지원으로 인해 목록에서 해당 상품을 찾음
    const { data: productPage, isLoading: isProductsLoading } = useQuery({
        queryKey: queryKeys.sellerProducts({ size: 100 }), // 전체 목록을 적절히 가져옴
        queryFn: () => getSellerProducts({ size: 100 }),
        enabled: !!productId,
    });

    const product = productPage?.content.find(p => p.id === productId);

    useEffect(() => {
        if (product) {
            setForm({
                name: product.name,
                description: product.description,
                category: product.category || CATEGORIES[0].value,
                price: product.price.toString(),
                stock: product.stock.toString(),
                status: product.status as any,
                imageKey: product.imageKey || '',
            });
            expectedStockRef.current = product.stock;
        }
    }, [product]);

    const mutation = useMutation({
        mutationFn: (data: ProductUpdateRequest) => updateProduct(productId!, data),
        onSuccess: () => {
            toast.success('상품 정보가 수정되었습니다.');
            queryClient.invalidateQueries({ queryKey: queryKeys.sellerProductsPrefix });
            router.push('/seller/products');
        },
        onError: (err: any) => {
            toast.error(err.message || '상품 수정에 실패했습니다.');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!product || productId === null) return;

        const changed: ProductUpdateRequest = {};

        const priceNum = form.price === '' ? NaN : Number(form.price);
        const stockNum = form.stock === '' ? NaN : Number(form.stock);

        if (isNaN(priceNum) || isNaN(stockNum)) {
            toast.error('가격과 재고를 입력해주세요.');
            return;
        }

        const trimmedName = form.name.trim();
        const trimmedDescription = form.description.trim();
        const trimmedImageKey = form.imageKey.trim();

        if (trimmedName !== product.name) changed.name = trimmedName;
        if (trimmedDescription !== product.description) changed.description = trimmedDescription;
        if ((form.category || CATEGORIES[0].value) !== (product.category || CATEGORIES[0].value)) changed.category = form.category;
        if (priceNum !== product.price) changed.price = priceNum;
        if (stockNum !== product.stock) {
            changed.stock = stockNum;
            changed.expectedStock = expectedStockRef.current;
        }
        if (form.status !== product.status) changed.status = form.status as any;
        if (trimmedImageKey !== (product.imageKey || '')) changed.imageKey = trimmedImageKey;


        if (Object.keys(changed).length === 0) {
            toast.info('수정된 내용이 없습니다.');
            return;
        }

        mutation.mutate(changed);
    };

    if (isProductsLoading) {
        return (
            <ProfileLayout>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </ProfileLayout>
        );
    }

    if (!product) {
        return (
            <ProfileLayout>
                <div className="text-center py-20">
                    <p className="text-muted-foreground">상품을 찾을 수 없거나 접근 권한이 없습니다.</p>
                    <Button variant="link" onClick={() => router.push('/seller/products')}>
                        목록으로 돌아가기
                    </Button>
                </div>
            </ProfileLayout>
        );
    }

    return (
        <ProfileLayout>
            <div className="max-w-2xl mx-auto py-10">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <h1 className="text-2xl font-bold">상품 수정</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* 기본 정보 */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">기본 정보</h2>
                            <div className="flex items-center gap-3">
                                <Label htmlFor="status" className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">판매 상태</Label>
                                {product.status === 'DRAFT' ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-secondary text-secondary-foreground border border-border">
                                        검토 중
                                    </span>
                                ) : (
                                    <select
                                        id="status"
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                                        className="h-7 min-w-[90px] rounded border border-input bg-background px-2 py-0 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
                                    >
                                        <option value="ACTIVE">판매 중</option>
                                        <option value="INACTIVE">판매 중단</option>
                                    </select>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">상품명</Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">카테고리</Label>
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
                            <Label htmlFor="description">상품 설명</Label>
                            <textarea
                                id="description"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                <Label htmlFor="price">판매가 (원)</Label>
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
                                <Label htmlFor="stock">재고 수량 (개)</Label>
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
                            <Label htmlFor="imageKey">이미지 키</Label>
                            <Input
                                id="imageKey"
                                value={form.imageKey}
                                onChange={(e) => setForm({ ...form, imageKey: e.target.value })}
                                placeholder="image-key"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
                            취소
                        </Button>
                        <Button type="submit" className="flex-1" disabled={mutation.isPending}>
                            {mutation.isPending ? '수정 중...' : '수정 완료'}
                        </Button>
                    </div>
                </form>
            </div>
        </ProfileLayout>
    );
}
