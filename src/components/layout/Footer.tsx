'use client';

import Link from 'next/link';

const FOOTER_LINKS = {
    aboutUs: [
        { label: '회사소개', href: '/about' },
        { label: '채용안내', href: '/careers' },
    ],
    myOrder: [
        { label: '주문배송', href: '/orders' },
        { label: '취소/교환/반품', href: '/orders/cancel' },
    ],
    myAccount: [
        { label: '프로필 설정', href: '/profile' },
        { label: '위시리스트', href: '/wishlist' },
        { label: '내 펀딩', href: '/fundings/my' },
        { label: '지갑', href: '/wallet' },
    ],
    help: [
        { label: '1:1 문의', href: '/support' },
        { label: '자주 묻는 질문', href: '/faq' },
        { label: '공지사항', href: '/notice' },
    ],
};

const NOTICE_ITEMS = [
    '[공지] 서비스 이용약관 개정 안내 (2025.01.01 시행)',
    '[공지] GIFTIFY 개인정보처리방침 변경 안내',
    '[공지] 2025년 설 연휴 고객센터 운영 안내',
];

/**
 * 29cm-inspired Footer for Giftify
 * Clean, minimal design with organized link sections
 */
export function Footer() {
    return (
        <footer className="border-t border-border bg-background mt-16">
            {/* Customer Service & Links */}
            <div className="max-w-screen-2xl mx-auto px-8 py-10">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                    {/* Customer Center */}
                    <div className="col-span-2 md:col-span-1">
                        <p className="text-xs text-muted-foreground mb-2">고객센터</p>
                        <p className="text-xl font-semibold tracking-tight mb-1">1234-5678</p>
                        <p className="text-xs text-muted-foreground">
                            운영시간: 평일 10:00 - 18:00
                            <br />
                            (점심시간 13:00 - 14:00)
                        </p>
                        <div className="flex gap-2 mt-4">
                            <Link
                                href="/faq"
                                className="px-3 py-1.5 border border-border text-xs hover:bg-secondary transition-colors"
                            >
                                FAQ
                            </Link>
                            <Link
                                href="/support"
                                className="px-3 py-1.5 border border-border text-xs hover:bg-secondary transition-colors"
                            >
                                1:1 문의
                            </Link>
                        </div>
                    </div>

                    {/* Notice */}
                    <div className="col-span-2 md:col-span-1">
                        <p className="text-xs text-muted-foreground mb-3">NOTICE</p>
                        <ul className="space-y-2">
                            {NOTICE_ITEMS.map((notice, idx) => (
                                <li key={idx}>
                                    <Link
                                        href="/notice"
                                        className="text-xs text-muted-foreground hover:text-foreground transition-colors line-clamp-1"
                                    >
                                        {notice}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* About Us */}
                    <div>
                        <p className="text-xs text-muted-foreground mb-3">ABOUT US</p>
                        <ul className="space-y-2">
                            {FOOTER_LINKS.aboutUs.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-xs hover:text-muted-foreground transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* My Account */}
                    <div>
                        <p className="text-xs text-muted-foreground mb-3">MY ACCOUNT</p>
                        <ul className="space-y-2">
                            {[...FOOTER_LINKS.myOrder, ...FOOTER_LINKS.myAccount].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-xs hover:text-muted-foreground transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Help */}
                    <div>
                        <p className="text-xs text-muted-foreground mb-3">HELP</p>
                        <ul className="space-y-2">
                            {FOOTER_LINKS.help.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-xs hover:text-muted-foreground transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Social Links */}
                <div className="flex gap-3 mt-8">
                    <a
                        href="https://instagram.com/giftify"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center text-background hover:opacity-80 transition-opacity"
                        aria-label="Instagram"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                    </a>
                    <a
                        href="https://youtube.com/giftify"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center text-background hover:opacity-80 transition-opacity"
                        aria-label="YouTube"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                    </a>
                    <a
                        href="https://facebook.com/giftify"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center text-background hover:opacity-80 transition-opacity"
                        aria-label="Facebook"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                    </a>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-border">
                <div className="max-w-screen-2xl mx-auto px-8 py-6">
                    {/* Legal Links */}
                    <div className="flex flex-wrap gap-4 text-xs mb-4">
                        <Link href="/terms" className="hover:text-muted-foreground transition-colors">
                            이용약관
                        </Link>
                        <Link href="/privacy" className="font-semibold hover:text-muted-foreground transition-colors">
                            개인정보처리방침
                        </Link>
                        <Link href="/youth-policy" className="hover:text-muted-foreground transition-colors">
                            청소년보호정책
                        </Link>
                        <Link href="/business-info" className="hover:text-muted-foreground transition-colors">
                            사업자정보확인
                        </Link>
                    </div>

                    {/* Company Info */}
                    <div className="text-[11px] text-muted-foreground leading-relaxed space-y-1">
                        <p>
                            (주)기프티파이 | 대표이사: 홍길동 | 사업자등록번호: 123-45-67890{' '}
                            <button className="underline hover:text-foreground transition-colors">
                                사업자정보확인
                            </button>
                        </p>
                        <p>
                            통신판매업신고: 제2025-서울강남-00001호 | 개인정보보호책임자: 김개인
                        </p>
                        <p>
                            주소: 서울특별시 강남구 테헤란로 123, 기프티파이빌딩 | 호스팅서비스: Amazon Web Services
                        </p>
                        <p className="pt-2">
                            (주)기프티파이는 통신판매중개자이며, 통신판매의 당사자가 아닙니다. 상품, 상품정보, 거래에 관한 의무와 책임은 판매자에게 있습니다.
                        </p>
                    </div>

                    {/* Copyright */}
                    <p className="text-[11px] text-muted-foreground mt-4">
                        © {new Date().getFullYear()} GIFTIFY Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
