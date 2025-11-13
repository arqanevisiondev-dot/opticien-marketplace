'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Rediriger selon le rôle
    if (session.user?.role === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/catalogue');
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-palladian">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-fantastic"></div>
        <p className="mt-4 text-gray-600">Redirection en cours...</p>
      </div>
    </div>
  );
}
