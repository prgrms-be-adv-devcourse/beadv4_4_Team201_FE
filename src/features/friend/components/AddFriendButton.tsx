'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, UserMinus, Loader2 } from 'lucide-react';
import { useMyFriends } from '../hooks/useFriends';
import { useSendFriendRequest, useRemoveFriend } from '../hooks/useFriendMutations';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';

type FriendStatus = 'self' | 'friend' | 'not_friend' | 'requested';

interface AddFriendButtonProps {
  targetUserId: string;
  targetNickname?: string;
  variant?: 'default' | 'compact';
}

export function AddFriendButton({ targetUserId, targetNickname, variant = 'default' }: AddFriendButtonProps) {
  const { user } = useAuth();
  const { data: friends } = useMyFriends();
  const sendRequest = useSendFriendRequest();
  const removeFriend = useRemoveFriend();
  const [localRequested, setLocalRequested] = useState(false);

  const currentUserId = user?.sub;
  const friend = friends?.find(f => f.id === targetUserId);

  let status: FriendStatus;
  if (currentUserId === targetUserId) {
    status = 'self';
  } else if (friend) {
    status = 'friend';
  } else if (localRequested) {
    status = 'requested';
  } else {
    status = 'not_friend';
  }

  if (status === 'self') return null;

  const handleSendRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    sendRequest.mutate(targetUserId, {
      onSuccess: () => {
        setLocalRequested(true);
        toast.success(`${targetNickname || '사용자'}에게 친구 요청을 보냈습니다`);
      },
      onError: () => toast.error('친구 요청에 실패했습니다'),
    });
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!friend?.friendshipId) {
      toast.error('친구 삭제를 위한 정보가 부족합니다');
      return;
    }
    removeFriend.mutate(friend.friendshipId, {
      onSuccess: () => toast.success(`${targetNickname || '사용자'}님을 친구에서 삭제했습니다`),
      onError: () => toast.error('친구 삭제에 실패했습니다'),
    });
  };

  const isPending = sendRequest.isPending || removeFriend.isPending;
  const isCompact = variant === 'compact';

  if (status === 'friend') {
    return (
      <Button
        variant="outline"
        size={isCompact ? 'sm' : 'default'}
        onClick={handleRemove}
        disabled={!friend?.friendshipId || isPending}
        className={isCompact ? 'h-7 text-xs' : ''}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
        ) : (
          <>
            <UserMinus className="h-3.5 w-3.5 mr-1" strokeWidth={1.5} />
            친구
          </>
        )}
      </Button>
    );
  }

  if (status === 'requested') {
    return (
      <Button
        variant="outline"
        size={isCompact ? 'sm' : 'default'}
        disabled
        className={isCompact ? 'h-7 text-xs' : ''}
      >
        <UserCheck className="h-3.5 w-3.5 mr-1" strokeWidth={1.5} />
        요청됨
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size={isCompact ? 'sm' : 'default'}
      onClick={handleSendRequest}
      disabled={isPending}
      className={isCompact ? 'h-7 text-xs' : ''}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
      ) : (
        <>
          <UserPlus className="h-3.5 w-3.5 mr-1" strokeWidth={1.5} />
          친구 추가
        </>
      )}
    </Button>
  );
}
