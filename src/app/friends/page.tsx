'use client';

import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FriendCard } from '@/features/friend/components/FriendCard';
import { FriendRequestCard } from '@/features/friend/components/FriendRequestCard';
import { useMyFriends, useFriendRequests } from '@/features/friend/hooks/useFriends';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { InlineError } from '@/components/common/InlineError';
import { Loader2, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FriendsPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { data: friends, isLoading: isFriendsLoading, error: friendsError, refetch: refetchFriends } = useMyFriends();
  const { data: requests, isLoading: isRequestsLoading, error: requestsError, refetch: refetchRequests } = useFriendRequests();

  if (!isAuthLoading && !isAuthenticated) {
    window.location.href = '/auth/login';
    return null;
  }

  const isLoading = isAuthLoading || isFriendsLoading || isRequestsLoading;
  const error = friendsError || requestsError;

  if (isLoading) {
    return (
      <AppShell headerVariant="detail">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" strokeWidth={1.5} />
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell headerVariant="detail">
        <div className="p-8">
          <InlineError
            message="친구 정보를 불러오는데 실패했습니다."
            error={error}
            onRetry={() => { refetchFriends(); refetchRequests(); }}
          />
        </div>
      </AppShell>
    );
  }

  const friendCount = friends?.length ?? 0;
  const requestCount = requests?.length ?? 0;

  return (
    <AppShell headerVariant="detail">
      <div className="max-w-screen-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">친구 관리</h1>
          <Link href="/explore">
            <Button variant="outline" size="sm" className="text-xs">
              <Users className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} />
              친구 찾기
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="friends">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-8 mb-4">
            <TabsTrigger
              value="friends"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-0 py-3 font-medium"
            >
              친구 목록
              <span className="ml-1.5 text-xs text-muted-foreground font-normal">{friendCount}</span>
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-0 py-3 font-medium"
            >
              받은 요청
              {requestCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-5 min-w-5 px-1 text-xs font-medium bg-black text-white rounded-full">
                  {requestCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-0">
            {friendCount > 0 ? (
              <div>
                {friends!.map((friend) => (
                  <FriendCard key={friend.id} friend={friend} />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" strokeWidth={1} />
                <p className="text-sm text-muted-foreground mb-4">아직 친구가 없습니다</p>
                <Link href="/explore">
                  <Button variant="outline" size="sm">친구 찾기</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="mt-0">
            {requestCount > 0 ? (
              <div>
                {requests!.map((req) => (
                  <FriendRequestCard key={req.friendshipId} request={req} />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center text-muted-foreground">
                <p className="text-sm">받은 친구 요청이 없습니다</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </AppShell>
  );
}
