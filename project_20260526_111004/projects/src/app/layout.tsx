import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppLayout from '@/components/layout/AppLayout';
import { AppProvider } from '@/lib/store';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CIM 客户信息管理系统',
  description: 'CIM 客户信息管理系统 - 配置化管理客户信息与账单拆分规则',
  openGraph: {
    title: 'CIM 客户信息管理系统',
    description: 'CIM 客户信息管理系统 - 配置化管理客户信息与账单拆分规则',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <AppProvider>
          <AppLayout>{children}</AppLayout>
        </AppProvider>
      </body>
    </html>
  );
}
