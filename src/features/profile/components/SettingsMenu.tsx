'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Bell,
    Palette,
    Globe,
    FileText,
    Shield,
    LogOut,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingItem {
    icon: typeof Bell;
    label: string;
    href?: string;
    onClick?: () => void;
    isPlaceholder?: boolean;
    isDanger?: boolean;
}

export function SettingsMenu() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'GET' });
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const settings: SettingItem[] = [
        {
            icon: Bell,
            label: '알림 설정',
            isPlaceholder: true,
        },
        {
            icon: Palette,
            label: '테마',
            isPlaceholder: true,
        },
        {
            icon: Globe,
            label: '언어',
            isPlaceholder: true,
        },
        {
            icon: FileText,
            label: '이용 약관',
            href: '/terms',
        },
        {
            icon: Shield,
            label: '개인정보 처리방침',
            href: '/privacy',
        },
        {
            icon: LogOut,
            label: '로그아웃',
            onClick: handleLogout,
            isDanger: true,
        },
    ];

    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle>설정</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-2">
                    {settings.map((setting, index) => {
                        const Icon = setting.icon;
                        const isClickable = !setting.isPlaceholder && (setting.href || setting.onClick);
                        const baseClassName = cn(
                            'flex items-center justify-between p-3 rounded-lg w-full text-left transition-colors',
                            isClickable
                                ? 'hover:bg-secondary/50 group'
                                : 'cursor-default',
                            setting.isPlaceholder && 'opacity-50',
                            setting.isDanger && isClickable && 'hover:bg-destructive/10'
                        );

                        const content = (
                            <>
                                <div className="flex items-center gap-3">
                                    <div
                                        className={cn(
                                            'p-2 rounded-full bg-secondary',
                                            setting.isDanger && 'text-destructive'
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <span
                                        className={cn(
                                            'font-medium',
                                            setting.isDanger && 'text-destructive'
                                        )}
                                    >
                                        {setting.label}
                                    </span>
                                    {setting.isPlaceholder && (
                                        <span className="text-xs text-muted-foreground">
                                            (준비 중)
                                        </span>
                                    )}
                                </div>
                                {isClickable && (
                                    <ChevronRight
                                        className={cn(
                                            'h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors',
                                            setting.isDanger && 'group-hover:text-destructive'
                                        )}
                                    />
                                )}
                            </>
                        );

                        if (setting.href && !setting.isPlaceholder) {
                            return (
                                <Link
                                    key={index}
                                    href={setting.href}
                                    className={baseClassName}
                                >
                                    {content}
                                </Link>
                            );
                        }

                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={setting.onClick}
                                disabled={setting.isPlaceholder}
                                className={baseClassName}
                            >
                                {content}
                            </button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
