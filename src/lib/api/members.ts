import { apiClient } from './client';
import type { PageParams } from '@/types/api';
import type {
  Member,
  MemberPublic,
  MemberUpdateRequest,
  MemberListResponse
} from '@/types/member';

export async function getMember(memberId: string): Promise<MemberPublic> {
  return apiClient.get<MemberPublic>(`/api/members/${memberId}`);
}

return apiClient.patch<Member>(`/api/members/${memberId}`, data);
}

export async function signupMember(data: MemberUpdateRequest): Promise<Member> {
  return apiClient.post<Member>('/api/members/signup', data);
}

export async function getMemberFriends(memberId: string, params?: PageParams): Promise<MemberListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/members/${memberId}/friends?${queryString}` : `/api/members/${memberId}/friends`;

  return apiClient.get<MemberListResponse>(endpoint);
}
