import type { Metadata } from 'next';

/**
 * Base metadata configuration for the application
 */
export const BASE_METADATA: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://giftify.app'),
    title: {
        default: 'Giftify - 함께하는 선물 펀딩',
        template: '%s | Giftify',
    },
    description: '친구들과 함께 특별한 선물을 만들어보세요. 원하는 선물을 위시리스트에 추가하고, 친구들이 함께 펀딩하여 선물을 완성하세요.',
    keywords: ['선물', '펀딩', '위시리스트', '크라우드펀딩', '생일선물', '기념일', 'giftify'],
    authors: [{ name: 'Giftify Team' }],
    creator: 'Giftify',
    publisher: 'Giftify',
    formatDetection: {
        email: false,
        telephone: false,
    },
    openGraph: {
        type: 'website',
        locale: 'ko_KR',
        url: 'https://giftify.app',
        siteName: 'Giftify',
        title: 'Giftify - 함께하는 선물 펀딩',
        description: '친구들과 함께 특별한 선물을 만들어보세요.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Giftify - 함께하는 선물 펀딩',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Giftify - 함께하는 선물 펀딩',
        description: '친구들과 함께 특별한 선물을 만들어보세요.',
        images: ['/og-image.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon-16x16.png',
        apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
    alternates: {
        canonical: 'https://giftify.app',
    },
};

/**
 * Generate metadata for a specific funding page
 */
export function generateFundingMetadata(funding: {
    productName: string;
    recipientName: string;
    targetAmount: number;
    currentAmount: number;
}): Metadata {
    const progress = Math.round((funding.currentAmount / funding.targetAmount) * 100);

    return {
        title: `${funding.productName} 펀딩`,
        description: `${funding.recipientName}님을 위한 ${funding.productName} 펀딩에 참여하세요! 현재 ${progress}% 달성`,
        openGraph: {
            title: `${funding.productName} 펀딩 | Giftify`,
            description: `${funding.recipientName}님을 위한 선물 펀딩에 참여해보세요.`,
        },
    };
}

/**
 * Generate metadata for a product page
 */
export function generateProductMetadata(product: {
    name: string;
    price: number;
    description?: string;
}): Metadata {
    return {
        title: product.name,
        description: product.description || `${product.name} - ${product.price.toLocaleString()}원`,
        openGraph: {
            title: `${product.name} | Giftify`,
            description: product.description || `${product.name} 상품 정보를 확인하세요.`,
        },
    };
}

/**
 * Generate metadata for a wishlist page
 */
export function generateWishlistMetadata(owner: {
    nickname: string;
}): Metadata {
    return {
        title: `${owner.nickname}님의 위시리스트`,
        description: `${owner.nickname}님이 갖고 싶어하는 선물들을 확인하고 펀딩에 참여해보세요.`,
        openGraph: {
            title: `${owner.nickname}님의 위시리스트 | Giftify`,
            description: `${owner.nickname}님의 위시리스트에서 선물 펀딩에 참여해보세요.`,
        },
    };
}
