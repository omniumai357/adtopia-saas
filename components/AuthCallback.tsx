'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useABConversionTracking } from '@/hooks/useABConversionTracking';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AuthCallbackProps {
  onSignupComplete?: (user: any) => void;
  redirectTo?: string;
}

/**
 * AuthCallback component for handling authentication callbacks
 * Tracks A/B test conversions when users complete signup
 */
export function AuthCallback({ onSignupComplete, redirectTo = '/dashboard' }: AuthCallbackProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { trackSignupComplete } = useABConversionTracking();
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Authentication error occurred');
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          // Track signup completion for A/B testing
          await trackSignupComplete({
            user_id: session.user.id,
            email: session.user.email,
            signup_method: 'email',
            signup_timestamp: new Date().toISOString(),
            user_metadata: session.user.user_metadata || {},
            app_metadata: session.user.app_metadata || {}
          });

          // Call the onSignupComplete callback if provided
          if (onSignupComplete) {
            await onSignupComplete(session.user);
          }

          // Redirect to the specified page
          router.push(redirectTo);
        } else {
          // No session found, redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [trackSignupComplete, onSignupComplete, redirectTo, router]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Track signup completion when user signs in
          await trackSignupComplete({
            user_id: session.user.id,
            email: session.user.email,
            signup_method: 'email',
            signup_timestamp: new Date().toISOString(),
            user_metadata: session.user.user_metadata || {},
            app_metadata: session.user.app_metadata || {}
          });

          if (onSignupComplete) {
            await onSignupComplete(session.user);
          }

          router.push(redirectTo);
        } else if (event === 'SIGNED_OUT') {
          router.push('/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [trackSignupComplete, onSignupComplete, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Completing signup...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default AuthCallback;
