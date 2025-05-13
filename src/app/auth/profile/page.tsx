'use client';

import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const { session, loading } = useAuth();

  if (loading || !session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome to Your Profile!</h1>
        <p className="mt-4">Logged in as: {session.user.email}</p>
      </div>
    </div>
  );
}