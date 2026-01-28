'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useUpdateProfile } from '@/features/profile/hooks/useProfile';
import type { Member } from '@/types/member';

interface ProfileEditSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member: Member;
}

function ProfileEditForm({ member, onCancel, onSuccess }: { member: Member; onCancel: () => void; onSuccess: () => void }) {
    const [nickname, setNickname] = useState(member.nickname);
    const updateProfile = useUpdateProfile();

    const handleSave = async () => {
        if (nickname.trim() === member.nickname) {
            onSuccess();
            return;
        }

        if (nickname.trim().length < 2) {
            return;
        }

        updateProfile.mutate(
            { nickname: nickname.trim() },
            {
                onSuccess,
            }
        );
    };

    const isChanged = nickname.trim() !== member.nickname;
    const isValid = nickname.trim().length >= 2;

    return (
        <>
            <div className="mt-6 space-y-4">
                <div className="space-y-2">
                    <label
                        htmlFor="nickname"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        닉네임
                    </label>
                    <Input
                        id="nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="닉네임을 입력하세요"
                        maxLength={20}
                        aria-invalid={!isValid}
                    />
                    {!isValid && nickname.trim().length > 0 && (
                        <p className="text-sm text-destructive">
                            닉네임은 최소 2자 이상이어야 합니다
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                        이메일
                    </label>
                    <p className="text-sm">{member.email}</p>
                </div>
            </div>

            <div className="mt-6 flex gap-3">
                <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                    disabled={updateProfile.isPending}
                >
                    취소
                </Button>
                <Button
                    onClick={handleSave}
                    className="flex-1"
                    disabled={!isChanged || !isValid || updateProfile.isPending}
                >
                    {updateProfile.isPending ? '저장 중...' : '저장'}
                </Button>
            </div>
        </>
    );
}

export function ProfileEditSheet({
    open,
    onOpenChange,
    member,
}: ProfileEditSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="rounded-t-3xl">
                <SheetHeader>
                    <SheetTitle>프로필 수정</SheetTitle>
                    <SheetDescription>
                        닉네임을 변경할 수 있습니다
                    </SheetDescription>
                </SheetHeader>

                {open && (
                    <ProfileEditForm
                        member={member}
                        onCancel={() => onOpenChange(false)}
                        onSuccess={() => onOpenChange(false)}
                    />
                )}
            </SheetContent>
        </Sheet>
    );
}
