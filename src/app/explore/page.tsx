'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Gift, Users, ArrowRight } from 'lucide-react';
import { usePublicWishlistSearch } from '@/features/wishlist/hooks/useWishlist';
import { AddFriendButton } from '@/features/friend/components/AddFriendButton';

export default function DiscoverPage() {
    const router = useRouter();
    const [searchNickname, setSearchNickname] = useState('');
    const [searchedNickname, setSearchedNickname] = useState<string | undefined>(undefined);

    const { data: searchResults, isLoading: isSearchLoading } = usePublicWishlistSearch(searchedNickname);

    const { data: publicMembers, isLoading: isMembersLoading } = usePublicWishlistSearch();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = searchNickname.trim();
        setSearchedNickname(trimmed || undefined);
    };

    const handleViewWishlist = (memberId: string) => {
        router.push(`/wishlist/${memberId}`);
    };

    return (
        <AppShell headerTitle="DISCOVER" headerVariant="main">
            <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-12 md:py-20">
                {/* Hero / Search Section */}
                <div className="max-w-2xl mx-auto text-center mb-20">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">
                        Find Someone, <br />
                        Discover Joy
                    </h1>
                    <p className="text-muted-foreground mb-10 text-sm md:text-base">
                        닉네임으로 친구를 검색하여 위시리스트를 확인하고, <br />
                        함께 선물 펀딩을 시작해보세요.
                    </p>

                    <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
                        <Input
                            type="text"
                            placeholder="닉네임으로 검색"
                            value={searchNickname}
                            onChange={(e) => setSearchNickname(e.target.value)}
                            className="h-14 pl-12 pr-24 border-black border-2 rounded-none focus-visible:ring-0 text-sm font-bold"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black" strokeWidth={1.5} />
                        <Button
                            type="submit"
                            className="absolute right-1 top-1 bottom-1 px-6 rounded-none bg-black text-white hover:bg-gray-800"
                        >
                            SEARCH
                        </Button>
                    </form>
                </div>

                {/* Search Result (Dynamic) */}
                {searchedNickname && (
                    <div className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-2 mb-6">
                            <Users className="w-5 h-5" strokeWidth={1.5} />
                            <h2 className="text-lg font-black tracking-tight">"{searchedNickname}" 검색 결과</h2>
                        </div>

                        {isSearchLoading ? (
                            <Card className="p-8 border-2 border-black rounded-none">
                                <div className="flex items-center gap-6">
                                    <Skeleton className="w-20 h-20 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-6 w-40" />
                                        <Skeleton className="h-4 w-60" />
                                    </div>
                                </div>
                            </Card>
                        ) : !searchResults || searchResults.length === 0 ? (
                            <Card className="p-12 text-center border-2 border-dashed border-gray-200 rounded-none bg-gray-50">
                                <p className="font-bold text-gray-400">"{searchedNickname}" 검색 결과가 없습니다.</p>
                                <p className="text-xs text-muted-foreground mt-1">닉네임을 다시 확인해주세요.</p>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {searchResults.map((member) => (
                                    <Card
                                        key={member.memberId}
                                        className="p-8 border-2 border-black rounded-none hover:bg-gray-50 transition-colors cursor-pointer group"
                                        onClick={() => handleViewWishlist(member.memberId)}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-black flex items-center justify-center text-white text-2xl font-black rounded-full">
                                                    {member.nickname.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black">{member.nickname}</h3>
                                                    <p className="text-muted-foreground text-sm mt-1">
                                                        위시리스트 보기
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <AddFriendButton
                                                    targetUserId={member.memberId}
                                                    targetNickname={member.nickname}
                                                />
                                                <Button className="border-2 border-black bg-transparent text-black hover:bg-black hover:text-white rounded-none font-bold py-6 px-10 transition-all">
                                                    보러가기
                                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 위시리스트 둘러보기 */}
                <div className="mb-20">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-blue-500" strokeWidth={1.5} />
                                <span className="text-[10px] font-black tracking-widest text-blue-500 uppercase">Members</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tighter">위시리스트 둘러보기</h2>
                        </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-6">
                        공개 위시리스트를 가진 회원들이에요. 펀딩을 개설하거나 참여해보세요.
                    </p>
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
                        {isMembersLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex-shrink-0 w-[160px] flex flex-col items-center gap-3 p-6 border-2 border-gray-200">
                                    <Skeleton className="w-14 h-14 rounded-full" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            ))
                        ) : publicMembers && publicMembers.length > 0 ? (
                            publicMembers.map((member) => (
                                <MemberCard
                                    key={member.memberId}
                                    nickname={member.nickname}
                                    onClick={() => handleViewWishlist(member.memberId)}
                                />
                            ))
                        ) : (
                            <div className="w-full py-12 text-center border-2 border-dashed border-gray-100 bg-gray-50/50">
                                <p className="text-sm font-bold text-gray-300">공개 위시리스트가 없습니다.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-10 bg-black text-white group cursor-pointer overflow-hidden relative">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-2">My Wishlist</h3>
                            <p className="text-gray-400 text-sm mb-6">내가 받고 싶은 선물을 등록해보세요.</p>
                            <Button
                                className="bg-white text-black hover:bg-gray-200 rounded-none font-bold"
                                onClick={() => router.push('/wishlist')}
                            >
                                GO TO WISH
                            </Button>
                        </div>
                        <Gift className="absolute -right-8 -bottom-8 w-40 h-40 text-gray-800 opacity-50 group-hover:scale-110 transition-transform duration-700" strokeWidth={1} />
                    </div>

                    <div className="p-10 bg-gray-100 group cursor-pointer overflow-hidden relative border-2 border-transparent hover:border-black transition-all">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-2">Participation</h3>
                            <p className="text-muted-foreground text-sm mb-6">내가 참여한 모든 펀딩을 확인하세요.</p>
                            <Button
                                className="bg-black text-white hover:bg-gray-800 rounded-none font-bold"
                                onClick={() => router.push('/fundings/participated')}
                            >
                                VIEW MY FUNDINGS
                            </Button>
                        </div>
                        <Users className="absolute -right-8 -bottom-8 w-40 h-40 text-gray-200 group-hover:scale-110 transition-transform duration-700" strokeWidth={1} />
                    </div>
                </div>

                {/* Bottom Tip */}
                <div className="mt-20 pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between text-[11px] text-muted-foreground uppercase tracking-widest gap-4">
                    <span>&copy; 2026 GIFTIFY. ALL RIGHTS RESERVED.</span>
                    <div className="flex gap-6">
                        <span className="cursor-help" title="닉네임으로 다른 사람의 위시리스트를 검색할 수 있습니다.">NICKNAME SEARCH TIPS</span>
                    </div>
                </div>
            </div>
            <Footer />
        </AppShell>
    );
}

function MemberCard({ nickname, onClick }: {
    nickname: string;
    onClick: () => void;
}) {
    const initial = nickname.charAt(0);

    return (
        <button
            onClick={onClick}
            className="group flex-shrink-0 w-[160px] flex flex-col items-center gap-3 p-6 border-2 border-gray-200 hover:border-black transition-all"
        >
            <div className="w-14 h-14 bg-gray-100 group-hover:bg-black group-hover:text-white flex items-center justify-center text-xl font-black transition-colors rounded-full">
                {initial}
            </div>
            <div className="text-center min-w-0 w-full">
                <span className="block text-sm font-bold text-foreground group-hover:text-black truncate">
                    {nickname}
                </span>
            </div>
        </button>
    );
}
