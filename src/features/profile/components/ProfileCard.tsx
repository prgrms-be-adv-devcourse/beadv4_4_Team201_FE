'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Edit } from 'lucide-react';
import type { Member } from '@/types/member';

interface ProfileCardProps {
    member: Member;
    onEditClick: () => void;
}

/**
 * Profile Card - 29cm Style
 * Clean, minimal profile display
 */
export function ProfileCard({ member, onEditClick }: ProfileCardProps) {
    const getInitials = (nickname: string) => {
        return nickname.slice(0, 2).toUpperCase();
    };

    return (
        <div className="border-b border-border pb-6">
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    {member.avatarUrl ? (
                        <AvatarImage src={member.avatarUrl} alt={member.nickname || 'Avatar'} />
                    ) : (
                        <AvatarFallback className="text-base font-medium">
                            {getInitials(member.nickname || '알 수 없음')}
                        </AvatarFallback>
                    )}
                </Avatar>

                <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold tracking-tight truncate">
                        {member.nickname || '알 수 없음'}
                    </h2>
                    <p className="text-sm text-muted-foreground truncate">
                        {member.email}
                    </p>
                </div>

                <button
                    onClick={onEditClick}
                    className="p-2 hover:opacity-60 transition-opacity"
                    aria-label="Edit profile"
                >
                    <Edit className="h-5 w-5" strokeWidth={1.5} />
                </button>
            </div>
        </div>
    );
}
