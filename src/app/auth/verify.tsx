'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default function VerifyPage() {
  const router = useRouter();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const verify = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token_hash = urlParams.get('token_hash');
      const type = urlParams.get('type') || 'email'; // Default to 'email' for confirmation links

      if (token_hash) {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            type: type as 'email' | 'recovery' | 'invite' | 'email_change', // Valid types for email
            token_hash,
          });

          if (error) {
            console.error('Verification error:', error.message);
            alert('Verification failed: ' + error.message);
            router.push('/auth');
          } else {
            alert('Email verified successfully! Redirecting to profile setup...');
            router.push('/auth/profile');
          }
        } catch (err) {
          console.error('Unexpected error:', err);
          alert('An unexpected error occurred during verification.');
          router.push('/auth');
        }
      } else {
        alert('Invalid verification link - missing token_hash');
        router.push('/auth');
      }
    };

    verify();
  }, [router, supabase]);

  return <div className="flex justify-center items-center min-h-screen">Verifying...</div>;
}