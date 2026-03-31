import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Oxydata Tools',
  description: 'AI-powered recruitment platform tools',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#0a0a0a', minHeight: '100vh', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
