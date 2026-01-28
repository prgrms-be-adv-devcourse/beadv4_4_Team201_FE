import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { updateMember } from '@/lib/api/members';
import { getMe } from '@/lib/api/auth';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { MemberUpdateRequest } from '@/types/member';
import { toast } from 'sonner';

/**
 * Hook to fetch the current user's profile
 */
export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
    enabled: !!user,
  });
}

/**
 * Hook to update the current user's profile
 */
export function useUpdateProfile() {
  const { user } = useAuth();
  const memberId = user?.sub;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MemberUpdateRequest) => {
      if (!memberId) throw new Error('Not authenticated');
      return updateMember(memberId, data);
    },
    onSuccess: () => {
      if (memberId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.member(memberId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.me });
      }
      toast.success('프로필이 성공적으로 업데이트되었습니다');
    },
    onError: (error: Error) => {
      toast.error(`프로필 업데이트 실패: ${error.message}`);
    },
  });
}
