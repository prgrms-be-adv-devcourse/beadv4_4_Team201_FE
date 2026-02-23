'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAcceptFriendRequest, useRejectFriendRequest } from '../hooks/useFriendMutations';
import { toast } from 'sonner';
import type { FriendRequest } from '@/types/friend';

interface FriendRequestCardProps {
  request: FriendRequest;
}

export function FriendRequestCard({ request }: FriendRequestCardProps) {
  const acceptMutation = useAcceptFriendRequest();
  const rejectMutation = useRejectFriendRequest();
  const isPending = acceptMutation.isPending || rejectMutation.isPending;

  const handleAccept = () => {
    acceptMutation.mutate(request.friendshipId, {
      onSuccess: () => toast.success(`${request.requester.nickname}님의 친구 요청을 수락했습니다`),
      onError: () => toast.error('친구 요청 수락에 실패했습니다'),
    });
  };

  const handleReject = () => {
    rejectMutation.mutate(request.friendshipId, {
      onSuccess: () => toast.success('친구 요청을 거절했습니다'),
      onError: () => toast.error('친구 요청 거절에 실패했습니다'),
    });
  };

  const timeAgo = formatTimeAgo(request.createdAt);

  return (
    <div className="flex items-center justify-between py-3 border-b border-border">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={request.requester.avatarUrl || undefined} alt={request.requester.nickname} />
          <AvatarFallback className="text-sm">{request.requester.nickname.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{request.requester.nickname}</p>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          size="sm"
          onClick={handleAccept}
          disabled={isPending}
          className="h-8 text-xs"
        >
          수락
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReject}
          disabled={isPending}
          className="h-8 text-xs"
        >
          거절
        </Button>
      </div>
    </div>
  );
}

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 30) return `${diffDay}일 전`;
  return date.toLocaleDateString('ko-KR');
}
