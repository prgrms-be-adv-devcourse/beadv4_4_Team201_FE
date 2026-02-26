import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getMe, updateMe, getMember } from '@/lib/api/members';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { MemberUpdateRequest } from '@/types/member';
import { toast } from 'sonner';

import { usePathname } from 'next/navigation';

/**
 * Hook to fetch the current user's profile
 */
export function useProfile() {
  const { user } = useAuth();
  const pathname = usePathname();
  const isCompleteSignup = pathname === '/auth/complete-signup';

  return useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
    enabled: !!user && !isCompleteSignup,
    retry: false, // Don't retry if it fails for new users
  });
}

/**
 * Hook to update the current user's profile
 */
export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MemberUpdateRequest) => {
      if (!user) throw new Error('Not authenticated');
      return updateMe(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
      toast.success('프로필이 성공적으로 업데이트되었습니다');
    },
    onError: (error: Error) => {
      toast.error(`프로필 업데이트 실패: ${error.message}`);
    },
  });
}

/**
 * Hook to fetch a member's public profile
 * @param memberId - The ID of the member
 */
export function usePublicProfile(memberId: string) {
  return useQuery({
    queryKey: ['member', memberId],
    queryFn: () => getMember(memberId),
    enabled: !!memberId,
  });
}
