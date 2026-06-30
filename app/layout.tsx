import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '多棱镜 · 人生事件解释系统',
  description: '把同一件人生事件折射成多种可验证解释，而不是急着给出唯一答案。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&family=Noto+Serif+SC:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}