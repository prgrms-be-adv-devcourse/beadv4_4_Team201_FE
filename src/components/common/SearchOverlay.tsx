'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

// Popular search keywords (could be fetched from API)
const POPULAR_KEYWORDS = [
    '에어팟',
    '무선이어폰',
    '선물세트',
    '향수',
    '지갑',
    '백팩',
    '스니커즈',
    '시계',
    '텀블러',
    '키링',
];

/**
 * SearchOverlay - 29cm Style
 * Full-screen overlay with search input and popular keywords
 */
export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    const handleSearch = useCallback(() => {
        if (query.trim()) {
            router.push(`/products?q=${encodeURIComponent(query.trim())}`);
            onClose();
            setQuery('');
        }
    }, [query, router, onClose]);

    const handleKeywordClick = (keyword: string) => {
        router.push(`/products?q=${encodeURIComponent(keyword)}`);
        onClose();
        setQuery('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-8 h-14 border-b border-border">
                <div className="flex-1" />

                {/* Search Input */}
                <div className="flex-[2] max-w-2xl">
                    <div className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search"
                            className="w-full h-10 px-0 bg-transparent border-0 border-b border-foreground text-base placeholder:text-muted-foreground focus:outline-none text-center"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Close Button & Search Icon */}
                <div className="flex-1 flex justify-end items-center gap-4">
                    <button
                        onClick={handleSearch}
                        className="hover:opacity-60 transition-opacity"
                        aria-label="Search"
                    >
                        <Search className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                    <button
                        onClick={onClose}
                        className="hover:opacity-60 transition-opacity"
                        aria-label="Close search"
                    >
                        <X className="h-6 w-6" strokeWidth={1} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 md:px-8 py-12 max-w-2xl mx-auto">
                {/* Popular Keywords */}
                <div>
                    <h3 className="text-sm font-semibold tracking-tight mb-6">
                        인기 검색어
                    </h3>
                    <ul className="space-y-3">
                        {POPULAR_KEYWORDS.map((keyword) => (
                            <li key={keyword}>
                                <button
                                    onClick={() => handleKeywordClick(keyword)}
                                    className="text-sm hover:opacity-60 transition-opacity text-left"
                                >
                                    {keyword}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
