import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getMember, getMemberFriends } from '@/lib/api/members';
import type { PageParams } from '@/types/api';

/**
 * Hook to fetch a public member profile
 */
export function useMember(memberId: string) {
    return useQuery({
        queryKey: queryKeys.member(memberId),
        queryFn: () => getMember(memberId),
        enabled: !!memberId && memberId !== 'me',
    });
}

/**
 * Hook to fetch a member's friends list
 */
export function useMemberFriends(memberId: string, params?: PageParams) {
    return useQuery({
        queryKey: [...queryKeys.memberFriends(memberId), params],
        queryFn: () => getMemberFriends(memberId, params),
        enabled: !!memberId,
    });
}
