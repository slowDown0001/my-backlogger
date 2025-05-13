import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Error fetching session:', sessionError.message);
        }

        if (session) {
          // Validate session by fetching user
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError || !user) {
            console.log('Invalid or stale session, clearing:', userError?.message || 'No user');
            await supabase.auth.signOut();
            if (isMounted) {
              setSession(null);
              setLoading(false);
            }
            return;
          }
        }

        if (isMounted) {
          console.log('Initial session fetch:', {
            sessionExists: !!session,
            email: session?.user?.email || 'None',
          });
          setSession(session);
          setLoading(false);
        }
      } catch (err) {
        console.error('Unexpected error fetching session:', err);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.log('Invalid or stale session on auth change, clearing:', userError?.message || 'No user');
          await supabase.auth.signOut();
          if (isMounted) {
            setSession(null);
            setLoading(false);
          }
          return;
        }
      }

      if (isMounted) {
        console.log('Auth state changed:', {
          event: _event,
          sessionExists: !!session,
          email: session?.user?.email || 'None',
        });
        setSession(session);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}