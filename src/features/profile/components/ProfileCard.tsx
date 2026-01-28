'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit } from 'lucide-react';
import type { Member } from '@/types/member';

interface ProfileCardProps {
    member: Member;
    onEditClick: () => void;
}

export function ProfileCard({ member, onEditClick }: ProfileCardProps) {
    const getInitials = (nickname: string) => {
        return nickname.slice(0, 2).toUpperCase();
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                    <Avatar size="lg" className="size-20">
                        {member.avatarUrl ? (
                            <AvatarImage src={member.avatarUrl} alt={member.nickname} />
                        ) : (
                            <AvatarFallback className="text-lg">
                                {getInitials(member.nickname)}
                            </AvatarFallback>
                        )}
                    </Avatar>

                    <div className="flex-1">
                        <h2 className="text-xl font-bold">{member.nickname}</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {member.email}
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onEditClick}
                        aria-label="Edit profile"
                    >
                        <Edit />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
