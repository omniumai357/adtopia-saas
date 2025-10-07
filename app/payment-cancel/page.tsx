import React from 'react';
import Head from 'next/head';

export default function PaymentCancel() {
  return (
    <>
      <Head>
        <title>Payment Cancelled - AdTopia</title>
        <meta name="description" content="Your payment was cancelled. No charges were made." />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Cancelled
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            No charges were made. You can try again anytime.
          </p>
          
          <div className="space-y-4">
            <a
              href="/"
              className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Try Again
            </a>
            
            <p className="text-sm text-gray-500">
              Need help? Contact us at beta@bizbox.host
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
