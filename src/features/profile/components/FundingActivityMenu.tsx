'use client';

import Link from 'next/link';
import { Gift, Heart, Package, ChevronRight } from 'lucide-react';
import {

    useMyParticipatedFundings,
    useMyReceivedFundings,
} from '@/features/funding/hooks/useFunding';

interface ActivityItem {
    icon: typeof Gift;
    label: string;
    count: number;
    href: string;
}

/**
 * Funding Activity Menu - 29cm Style
 * Clean list with dividers
 */
export function FundingActivityMenu() {

    const { data: participated } = useMyParticipatedFundings();
    const { data: received } = useMyReceivedFundings();

    const activities: ActivityItem[] = [

        {
            icon: Heart,
            label: '참여한 펀딩',
            count: participated?.page.totalElements ?? 0,
            href: '/fundings/participated',
        },
        {
            icon: Gift,
            label: '받은 펀딩',
            count: received?.page.totalElements ?? 0,
            href: '/fundings/received',
        },
    ];

    return (
        <div className="py-6 border-b border-border">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                Fundings
            </h3>

            <div className="divide-y divide-border">
                {activities.map((activity) => {
                    const Icon = activity.icon;
                    return (
                        <Link
                            key={activity.href}
                            href={activity.href}
                            className="flex items-center justify-between py-4 hover:opacity-60 transition-opacity group"
                        >
                            <div className="flex items-center gap-3">
                                <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                                <span className="text-sm font-medium">{activity.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">
                                    {activity.count}
                                </span>
                                <ChevronRight
                                    className="h-4 w-4 text-muted-foreground"
                                    strokeWidth={1.5}
                                />
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
