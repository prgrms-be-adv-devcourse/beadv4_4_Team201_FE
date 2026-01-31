'use client';

import Link from 'next/link';
import { ArrowRight, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { FriendWishlistItem } from '@/types/wishlist';

interface FriendsWishlistSectionProps {
    friendsWishlists: FriendWishlistItem[];
}

export function FriendsWishlistSection({ friendsWishlists }: FriendsWishlistSectionProps) {
    if (friendsWishlists.length === 0) {
        return (
            <section className="py-8">
                <div className="px-4 md:px-8 mb-6">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Friends</p>
                    <h2 className="text-xl font-semibold tracking-tight mt-1">친구들의 위시리스트</h2>
                </div>

                <div className="mx-4 md:mx-8 border border-dashed border-border py-16 flex flex-col items-center">
                    <Users className="h-8 w-8 text-muted-foreground mb-4" strokeWidth={1} />
                    <p className="text-sm font-medium">친구들의 위시리스트가 없어요</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-6">
                        친구를 초대하고 함께 선물을 준비해보세요
                    </p>
                    <Button variant="outline" asChild>
                        <Link href="/friends/invite">친구 초대하기</Link>
                    </Button>
                </div>
            </section>
        );
    }

    return (
        <section className="py-8">
            {/* Section Header */}
            <div className="flex items-end justify-between px-4 md:px-8 mb-6">
                <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Friends</p>
                    <h2 className="text-xl font-semibold tracking-tight mt-1">친구들의 위시리스트</h2>
                </div>
                <Link
                    href="/friends"
                    className="flex items-center gap-1 text-sm hover:opacity-60 transition-opacity"
                >
                    더보기
                    <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
            </div>

            {/* Wishlist Items */}
            <div className="px-4 md:px-8 space-y-0 divide-y divide-border">
                {friendsWishlists.map((item) => {
                    const topItems = item.previewItems.slice(0, 3);
                    const itemCountText =
                        topItems.length > 0
                            ? `${topItems[0].product.name}${item.wishlist.itemCount > 1 ? ` 외 ${item.wishlist.itemCount - 1}개` : ''}`
                            : '아직 아이템이 없어요';

                    return (
                        <Link
                            key={item.member.id}
                            href={`/wishlist/${item.member.id}`}
                            className="flex items-center justify-between py-4 hover:opacity-70 transition-opacity group"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={item.member.avatarUrl || undefined} />
                                    <AvatarFallback className="text-sm">
                                        {(item.member.nickname || '알')[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {item.member.nickname}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {itemCountText}
                                    </p>
                                </div>
                            </div>
                            <ArrowRight
                                className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform"
                                strokeWidth={1.5}
                            />
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
