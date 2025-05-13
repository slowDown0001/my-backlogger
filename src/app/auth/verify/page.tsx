'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function VerifyPage() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token_hash = urlParams.get('token_hash');
      const type = urlParams.get('type') || 'email';

      if (!token_hash) {
        if (isMounted) {
          console.log('VerifyPage: Missing token_hash, redirecting to /auth');
          alert('Invalid verification link - missing token_hash');
          router.replace('/auth');
        }
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          type: type as 'email' | 'recovery' | 'invite' | 'email_change',
          token_hash,
        });

        if (error) {
          if (isMounted) {
            console.log('VerifyPage: Verification failed, redirecting to /auth');
            alert('Verification failed: ' + error.message);
            router.replace('/auth');
          }
          return;
        }

        if (isMounted) {
          console.log('VerifyPage: Verification successful, redirecting to /auth?verified=true');
          router.replace('/auth?verified=true');
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        if (isMounted) {
          console.log('VerifyPage: Unexpected error, redirecting to /auth');
          alert('An unexpected error occurred during verification.');
          router.replace('/auth');
        }
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <p className="text-lg">Verifying your email...</p>
        <p className="mt-2 text-gray-600">Please wait while we confirm your email address.</p>
      </div>
    </div>
  );
}