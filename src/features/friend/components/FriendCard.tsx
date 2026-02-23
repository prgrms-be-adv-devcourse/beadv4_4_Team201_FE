'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserMinus } from 'lucide-react';
import { useRemoveFriend } from '../hooks/useFriendMutations';
import { toast } from 'sonner';
import type { Friend } from '@/types/friend';

interface FriendCardProps {
  friend: Friend;
}

export function FriendCard({ friend }: FriendCardProps) {
  const removeFriend = useRemoveFriend();

  const handleRemove = () => {
    if (!friend.friendshipId) {
      toast.error('친구 삭제를 위한 정보가 부족합니다');
      return;
    }
    removeFriend.mutate(friend.friendshipId, {
      onSuccess: () => toast.success(`${friend.nickname}님을 친구에서 삭제했습니다`),
      onError: () => toast.error('친구 삭제에 실패했습니다'),
    });
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-border">
      <Link href={`/wishlist/${friend.id}`} className="flex items-center gap-3 min-w-0 flex-1">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={friend.avatarUrl || undefined} alt={friend.nickname} />
          <AvatarFallback className="text-sm">{friend.nickname.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{friend.nickname}</p>
          <p className="text-xs text-muted-foreground">위시리스트 보기</p>
        </div>
      </Link>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        disabled={!friend.friendshipId || removeFriend.isPending}
        className="text-muted-foreground hover:text-destructive flex-shrink-0"
      >
        <UserMinus className="h-4 w-4" strokeWidth={1.5} />
      </Button>
    </div>
  );
}
