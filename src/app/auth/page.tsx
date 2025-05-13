'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [justVerified, setJustVerified] = useState(false);

  const router = useRouter();
  const { session, loading } = useAuth();

  // Temporary sign-out function
  const handleSignOut = async () => {
    console.log('Signing out');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign-out error:', error.message);
    } else {
      console.log('Sign-out successful');
      router.refresh(); // Refresh to reset session state
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (!loading && session) {
      if (isMounted) {
        console.log('AuthPage: Redirecting to /auth/profile', { email: session?.user?.email });
        router.replace('/auth/profile');
      }
      return;
    }

    if (!loading) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('verified') === 'true') {
        if (isMounted) {
          console.log('AuthPage: Setting justVerified');
          setJustVerified(true);
          router.replace('/auth');
        }
      }
    }

    return () => {
      isMounted = false;
    };
  }, [session, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p>Loading...</p>
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <button
          onClick={handleSignOut}
          className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700"
        >
          Sign Out (Temporary)
        </button>
      </div>
    );
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setJustVerified(false);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        console.log('AuthPage: Login successful, redirecting to /auth/profile');
        router.push('/auth/profile');
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        setError('Please check your email to confirm your account.');
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isLogin ? 'Login' : 'Sign Up'}
        </h1>
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          {error && (
            <p
              className={
                error.includes('check your email')
                  ? 'text-green-500 text-sm'
                  : 'text-red-500 text-sm'
              }
            >
              {error}
            </p>
          )}
          {justVerified && (
            <p className="text-green-500 text-sm">
              Your email has been verified! You can now log in.
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <div className="text-center mt-4">
          <button
            className="text-blue-600 hover:underline"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setJustVerified(false);
            }}
          >
            {isLogin ? 'Need to sign up?' : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}