'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Heart, Package, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    useMyOrganizedFundings,
    useMyParticipatedFundings,
    useMyReceivedFundings,
} from '@/features/funding/hooks/useFunding';

interface ActivityItem {
    icon: typeof Gift;
    label: string;
    count: number;
    href: string;
    color: string;
}

export function FundingActivityMenu() {
    const { data: organized } = useMyOrganizedFundings();
    const { data: participated } = useMyParticipatedFundings();
    const { data: received } = useMyReceivedFundings();

    const activities: ActivityItem[] = [
        {
            icon: Package,
            label: '내가 만든 펀딩',
            count: organized?.page.totalElements ?? 0,
            href: '/fundings/organized',
            color: 'text-blue-600',
        },
        {
            icon: Heart,
            label: '참여한 펀딩',
            count: participated?.page.totalElements ?? 0,
            href: '/fundings/participated',
            color: 'text-pink-600',
        },
        {
            icon: Gift,
            label: '받은 펀딩',
            count: received?.page.totalElements ?? 0,
            href: '/fundings/received',
            color: 'text-purple-600',
        },
    ];

    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle>펀딩 활동</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-2">
                    {activities.map((activity) => {
                        const Icon = activity.icon;
                        return (
                            <Link
                                key={activity.href}
                                href={activity.href}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn('p-2 rounded-full bg-secondary', activity.color)}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <span className="font-medium">{activity.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-semibold text-primary">
                                        {activity.count}
                                    </span>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
