'use client';

import { ReactNode, Suspense } from 'react';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Suspense fallback={<div className="w-64" />}>
        <AdminSidebar />
      </Suspense>
      <main className="flex-1 lg:ml-0">
        {children}
      </main>
    </div>
  );
}
