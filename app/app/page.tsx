'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AppRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to homepage with preview anchor
    router.replace('/#preview');
  }, [router]);

  // SSR fallback - show content even with JS disabled
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Redirecting to Preview...
        </h1>
        <p className="text-gray-600 mb-6">
          If you're not redirected automatically, 
          <a href="/#preview" className="text-blue-600 hover:underline ml-1">
            click here to see your ad preview
          </a>
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
}
