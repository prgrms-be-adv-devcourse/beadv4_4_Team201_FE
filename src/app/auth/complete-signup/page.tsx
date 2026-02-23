'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useUser } from '@auth0/nextjs-auth0/client';
import DaumPostcode from 'react-daum-postcode';

import { AppShell } from '@/components/layout/AppShell';
import { LogoutButton } from '@/features/auth/components/LogoutButton';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signupMember } from '@/lib/api/members';
import { queryKeys } from '@/lib/query/keys';
import { Search } from 'lucide-react';

// 전화번호 자동 포맷팅 함수 (하이픈 자동 추가)
function formatPhoneNumber(value: string): string {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');
    
    // 최대 11자리까지만
    const limited = numbers.slice(0, 11);
    
    // 포맷팅
    if (limited.length <= 3) {
        return limited;
    } else if (limited.length <= 7) {
        return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    } else {
        // 010으로 시작하면 010-XXXX-XXXX, 그 외는 01X-XXX-XXXX
        const isSeoul = limited.startsWith('010');
        if (isSeoul) {
            return `${limited.slice(0, 3)}-${limited.slice(3, 7)}-${limited.slice(7)}`;
        } else {
            return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
        }
    }
}

const formSchema = z.object({
    nickname: z
        .string()
        .max(20, { message: '닉네임은 20글자 이하여야 합니다.' })
        .optional()
        .or(z.literal('')),
    birthday: z.string().optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    detailAddress: z.string().optional().or(z.literal('')),
    phoneNum: z
        .string()
        .refine(
            (val) => {
                if (!val || val === '') return true; // 빈 값은 허용 (선택 필드)
                // 010-XXXX-XXXX (13자) 또는 01X-XXX-XXXX (12자) 형식 검증
                const pattern010 = /^010-\d{4}-\d{4}$/;
                const patternOther = /^01[1-9]-\d{3}-\d{4}$/;
                return pattern010.test(val) || patternOther.test(val);
            },
            { message: '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)' }
        )
        .optional()
        .or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

export default function CompleteSignupPage() {
    const router = useRouter();
    const { user, isLoading: isAuthLoading } = useUser();
    const queryClient = useQueryClient();
    const [progress, setProgress] = useState(0);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    // Moved Hook: Generate a random example nickname for the placeholder
    const [placeholderNickname, setPlaceholderNickname] = useState('');

    useEffect(() => {
        setPlaceholderNickname(`User_${Math.floor(1000 + Math.random() * 9000)}`);
    }, []);

    // Removed getMe query as new users don't have a member profile yet

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nickname: '',
            birthday: '',
            address: '',
            detailAddress: '',
            phoneNum: '',
        },
    });

    // Calculate filled fields for button state (Moved up to access form)
    const filledFieldsCount = [
        form.watch('nickname'),
        form.watch('phoneNum'),
        form.watch('birthday'),
        form.watch('address'),
        form.watch('detailAddress'),
    ].filter(v => v && v.trim().length > 0).length;

    // Calculate progress whenever form values change
    useEffect(() => {
        const subscription = form.watch((value) => {
            let completedFields = 0;
            const totalFields = 5; // Nickname, Birthday, Address (Main), Phone, Detail Address

            if (value.nickname && value.nickname.trim().length > 0) completedFields++;
            if (value.birthday && value.birthday.trim().length > 0) completedFields++;
            if (value.address && value.address.trim().length > 0) completedFields++;
            if (value.detailAddress && value.detailAddress.trim().length > 0) completedFields++;
            if (value.phoneNum && value.phoneNum.trim().length > 0) completedFields++;

            setProgress((completedFields / totalFields) * 100);
        });
        return () => subscription.unsubscribe();
    }, [form.watch]);

    // Removed member pre-fill effect

    const updateMutation = useMutation({
        mutationFn: async (values: FormValues) => {
            // Combine address and detailAddress
            const fullAddress = values.address
                ? `${values.address} ${values.detailAddress || ''}`.trim()
                : undefined;

            return signupMember({
                nickname: values.nickname || undefined,
                birthday: values.birthday || undefined,
                address: fullAddress,
                phoneNum: values.phoneNum || undefined,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.me });
            queryClient.invalidateQueries({ queryKey: queryKeys.home });
            toast.success('프로필 설정이 완료되었습니다!');
            router.push('/');
        },
        onError: (error: any) => {
            // 409 Conflict means member already exists (created by UserAuthenticatedEvent)
            // Treat this as success and redirect to home
            if (error?.status === 409 || error?.message?.includes('409')) {
                queryClient.invalidateQueries({ queryKey: queryKeys.me });
                queryClient.invalidateQueries({ queryKey: queryKeys.home });
                toast.success('프로필 설정이 완료되었습니다!');
                router.push('/');
                return;
            }
            console.error('Failed to update profile:', error);
            toast.error('프로필 업데이트에 실패했습니다. 다시 시도해주세요.');
        },
    });

    function onSubmit(values: FormValues) {
        updateMutation.mutate(values);
    }

    const handleAddressComplete = (data: any) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
                extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            }
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        form.setValue('address', fullAddress);
        setIsAddressModalOpen(false); // Close modal
    };

    // Helper functions for button state
    const totalFields = 5;
    const isAllEmpty = filledFieldsCount === 0;

    const getButtonText = () => {
        if (updateMutation.isPending) return '처리 중...';
        if (isAllEmpty) return '다음에 입력하기';
        if (filledFieldsCount === totalFields) return '시작하기';
        return `${filledFieldsCount}/${totalFields} 나머지는 다음에 입력하기`;
    };

    const getButtonColorClass = () => {
        if (isAllEmpty) return 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
        switch (filledFieldsCount) {
            case 1: return 'bg-primary/20 hover:bg-primary/30 text-primary-foreground';
            case 2: return 'bg-primary/40 hover:bg-primary/50 text-primary-foreground';
            case 3: return 'bg-primary/60 hover:bg-primary/70 text-primary-foreground';
            case 4: return 'bg-primary/80 hover:bg-primary/90 text-primary-foreground';
            case 5: return 'bg-primary hover:bg-primary/90 text-primary-foreground';
            default: return ''; // Should not happen if > 0
        }
    };

    // Conditional Returns START HERE (after all hooks)
    if (isAuthLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                    <p className="text-muted-foreground">정보를 불러오는 중입니다...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // Will trigger redirect in middleware/AuthInitializer
    }

    return (
        <AppShell
            headerVariant="detail"
            showBottomNav={false}
            hideHeaderActions
        >
            <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-background p-4 pb-20">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">회원가입 마무리</CardTitle>
                        <CardDescription className="text-center mb-4">
                            서비스 이용을 위해 추가 정보를 입력해주세요.<br />
                            모든 정보는 선택사항입니다.
                        </CardDescription>
                        <div className="space-y-2">
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-right text-muted-foreground">
                                {Math.round(progress)}% 완료
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="nickname"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>닉네임</FormLabel>
                                            <FormControl>
                                                <Input placeholder={`${placeholderNickname} (선택)`} {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                입력하지 않으면 자동으로 닉네임이 생성됩니다.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phoneNum"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>휴대전화번호</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="010-1234-5678 (선택)" 
                                                    value={field.value}
                                                    onChange={(e) => {
                                                        const formatted = formatPhoneNumber(e.target.value);
                                                        field.onChange(formatted);
                                                    }}
                                                    inputMode="numeric"
                                                    maxLength={13}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="birthday"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>생년월일 <span className="text-muted-foreground font-normal">(선택)</span></FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>주소</FormLabel>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex gap-2">
                                                    <FormControl>
                                                        <Input placeholder="주소를 검색하세요 (선택)" {...field} readOnly />
                                                    </FormControl>
                                                    <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                                                        <DialogTrigger asChild>
                                                            <Button type="button" variant="outline" size="icon">
                                                                <Search className="h-4 w-4" strokeWidth={1.5} />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-md">
                                                            <DialogHeader>
                                                                <DialogTitle>주소 검색</DialogTitle>
                                                                <DialogDescription className="sr-only">도로명 또는 지번 주소를 검색하세요</DialogDescription>
                                                            </DialogHeader>
                                                            <div className="mt-4 border rounded-md overflow-hidden">
                                                                <DaumPostcode
                                                                    onComplete={handleAddressComplete}
                                                                    style={{ height: '400px', width: '100%' }}
                                                                />
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="detailAddress"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="상세 주소를 입력하세요 (선택)" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-3">
                                    <Button
                                        type="submit"
                                        className={`w-full transition-colors duration-300 ${getButtonColorClass()}`}
                                        disabled={updateMutation.isPending}
                                    >
                                        {getButtonText()}
                                    </Button>

                                    <div className="flex justify-center">
                                        <LogoutButton
                                            variant="ghost"
                                            className="text-muted-foreground hover:text-destructive"
                                        />
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
