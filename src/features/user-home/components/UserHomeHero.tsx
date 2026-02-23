import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AddFriendButton } from '@/features/friend/components/AddFriendButton';

interface UserPublicProfile {
    id: string;
    nickname: string;
    description?: string;
    avatarUrl?: string;
    coverImageUrl?: string;
    followerCount: number;
}

interface UserHomeHeroProps {
    user: UserPublicProfile;
    isMe?: boolean;
}

export function UserHomeHero({ user, isMe = false }: UserHomeHeroProps) {

    return (
        <div className="relative mb-12">
            {/* Cover Image */}
            <div className="relative h-64 md:h-80 w-full bg-secondary overflow-hidden">
                <Image
                    src={user.coverImageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80'}
                    alt="Cover"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* Profile Info */}
            <div className="max-w-screen-2xl mx-auto px-8">
                <div className="relative -mt-16 flex flex-col items-center text-center">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-sm">
                        <AvatarImage src={user.avatarUrl} alt={user.nickname} />
                        <AvatarFallback className="text-2xl">{user.nickname[0]}</AvatarFallback>
                    </Avatar>

                    <div className="mt-4 space-y-2 max-w-lg">
                        <h1 className="text-2xl font-bold tracking-tight">{user.nickname}</h1>
                        <p className="text-muted-foreground whitespace-pre-wrap text-sm md:text-base">
                            {user.description || "안녕하세요. 취향을 공유하는 펀딩을 만듭니다."}
                        </p>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-3 h-10">
                        {!isMe && (
                            <AddFriendButton
                                targetUserId={user.id}
                                targetNickname={user.nickname}
                            />
                        )}
                        <Button variant="outline" size="icon" className="rounded-full">
                            <Share2 className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="mt-4 flex gap-6 text-sm">
                        <div className="flex flex-col items-center">
                            <span className="font-bold text-lg">{user.followerCount.toLocaleString()}</span>
                            <span className="text-muted-foreground text-xs uppercase tracking-wide">Followers</span>
                        </div>
                        <div className="w-px h-10 bg-border" />
                        <div className="flex flex-col items-center">
                            <span className="font-bold text-lg">12</span>
                            <span className="text-muted-foreground text-xs uppercase tracking-wide">Fundings</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
