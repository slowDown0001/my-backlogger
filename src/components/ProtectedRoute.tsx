'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    let isMounted = true;

    if (!loading && !session) {
      if (isMounted) {
        console.log('ProtectedRoute: Redirecting to /auth');
        router.replace('/auth');
      }
    }

    return () => {
      isMounted = false;
    };
  }, [session, loading, router]);

  if (loading || !session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}