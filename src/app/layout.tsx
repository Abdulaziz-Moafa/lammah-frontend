import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lamma - Fun Group Trivia Game',
  description: 'Play exciting trivia games with friends and family. Host or join a match and compete in teams!',
  keywords: ['trivia', 'game', 'quiz', 'multiplayer', 'team', 'fun'],
  authors: [{ name: 'Lamma' }],
  openGraph: {
    title: 'Lamma - Fun Group Trivia Game',
    description: 'Play exciting trivia games with friends and family.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
