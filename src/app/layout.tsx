import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '@/lib/providers';
import { MSWProvider } from '@/lib/providers/msw-provider';
import { OfflineIndicator } from '@/components/common/OfflineIndicator';
import "./globals.css";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Giftify - 함께하는 선물 펀딩',
  description: '친구들과 함께 특별한 선물을 만들어보세요',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MSWProvider>
          <Providers>
            <OfflineIndicator />
            {children}
          </Providers>
        </MSWProvider>
      </body>
    </html>
  );
}
