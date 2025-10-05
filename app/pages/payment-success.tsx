import React from 'react';
import Head from 'next/head';

export default function PaymentSuccess() {
  return (
    <>
      <Head>
        <title>Payment Successful - AdTopia</title>
        <meta name="description" content="Your payment was successful. Welcome to AdTopia!" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your purchase. Your QR code will be delivered within 24 hours.
          </p>
          
          <div className="space-y-4">
            <a
              href="/"
              className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </a>
            
            <p className="text-sm text-gray-500">
              Questions? Contact us at beta@bizbox.host
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
