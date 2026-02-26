'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, UserMinus, Loader2 } from 'lucide-react';
import { useMyFriends, useFriendRequests, useSentFriendRequests } from '../hooks/useFriends';
import { useSendFriendRequest, useRemoveFriend } from '../hooks/useFriendMutations';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type FriendStatus = 'self' | 'friend' | 'not_friend' | 'sent_request' | 'received_request';

interface AddFriendButtonProps {
  targetUserId: string;
  targetNickname?: string;
  variant?: 'default' | 'compact';
}

export function AddFriendButton({ targetUserId, targetNickname, variant = 'default' }: AddFriendButtonProps) {
  const router = useRouter();
  const { data: me } = useProfile();
  const { data: friends } = useMyFriends();
  const { data: sentRequests } = useSentFriendRequests();
  const { data: receivedRequests } = useFriendRequests();
  const sendRequest = useSendFriendRequest();
  const removeFriend = useRemoveFriend();
  const [localRequested, setLocalRequested] = useState(false);

  const friend = friends?.find(f => f.id.toString() === targetUserId.toString());
  const sent = sentRequests?.find(r => r.requester.id.toString() === targetUserId.toString()); // Note: if backend uses the same DTO, requester field might actually be the receiver here
  const received = receivedRequests?.find(r => r.requester.id.toString() === targetUserId.toString());

  let status: FriendStatus;
  if (me?.id.toString() === targetUserId.toString()) {
    status = 'self';
  } else if (friend) {
    status = 'friend';
  } else if (sent || localRequested) {
    status = 'sent_request';
  } else if (received) {
    status = 'received_request';
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

  const onRemoveConfirm = () => {
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
      <AlertDialog>
        <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size={isCompact ? 'sm' : 'default'}
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
        </AlertDialogTrigger>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>친구 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              {targetNickname || '사용자'}님을 친구 목록에서 삭제하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>취소</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveConfirm();
              }}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (status === 'sent_request') {
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

  if (status === 'received_request') {
    return (
      <Button
        variant="default"
        size={isCompact ? 'sm' : 'default'}
        onClick={() => router.push('/friends')}
        className={isCompact ? 'h-7 text-xs' : ''}
      >
        요청 받음
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
