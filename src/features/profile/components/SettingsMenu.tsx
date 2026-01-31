'use client';

import Link from 'next/link';
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

/**
 * Settings Menu - 29cm Style
 * Clean list with dividers
 */
export function SettingsMenu() {
    const handleLogout = () => {
        window.location.href = '/auth/logout';
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
        <div className="py-6">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4 px-4 md:px-0">
                Settings
            </h3>

            <div className="divide-y divide-border">
                {settings.map((setting, index) => {
                    const Icon = setting.icon;
                    const isClickable = !setting.isPlaceholder && (setting.href || setting.onClick);

                    const baseClassName = cn(
                        'flex items-center justify-between py-4 w-full text-left transition-opacity',
                        isClickable ? 'hover:opacity-60' : 'cursor-default',
                        setting.isPlaceholder && 'opacity-40',
                    );

                    const content = (
                        <>
                            <div className="flex items-center gap-3">
                                <Icon
                                    className={cn(
                                        'h-5 w-5',
                                        setting.isDanger ? 'text-destructive' : 'text-muted-foreground'
                                    )}
                                    strokeWidth={1.5}
                                />
                                <span
                                    className={cn(
                                        'text-sm font-medium',
                                        setting.isDanger && 'text-destructive'
                                    )}
                                >
                                    {setting.label}
                                </span>
                                {setting.isPlaceholder && (
                                    <span className="text-xs text-muted-foreground">
                                        준비 중
                                    </span>
                                )}
                            </div>
                            {isClickable && !setting.isDanger && (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
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
        </div>
    );
}
