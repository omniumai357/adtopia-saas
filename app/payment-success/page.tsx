'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Head from 'next/head';
import { useRouter, useSearchParams } from 'next/navigation';

interface PaymentData {
  sessionId?: string;
  productName?: string;
  amount?: number;
  customerEmail?: string;
  status?: 'verified' | 'pending' | 'failed';
}

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentData>({ status: 'pending' });
  const [loading, setLoading] = useState(true);
  const [downloadReady, setDownloadReady] = useState(false);

  useEffect(() => {
    // Extract payment data from URL parameters
    if (!searchParams) return;
    
    const sessionId = searchParams.get('session_id');
    const productName = searchParams.get('product_name');
    const amount = searchParams.get('amount');
    const customerEmail = searchParams.get('customer_email');

    if (sessionId) {
      // Verify payment with Stripe (in production, this would be a server-side call)
      verifyPayment(sessionId, productName, amount, customerEmail);
    } else {
      // No session ID - show generic success
      setPaymentData({ status: 'verified' });
      setLoading(false);
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId: string, productName: string | null, amount: string | null, customerEmail: string | null) => {
    try {
      // In production, this would call your backend to verify with Stripe
      // For now, we'll simulate verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPaymentData({
        sessionId,
        productName: productName || 'AdTopia Package',
        amount: amount ? parseFloat(amount) : 0,
        customerEmail: customerEmail || '',
        status: 'verified'
      });
      
      // Simulate download preparation
      setTimeout(() => setDownloadReady(true), 3000);
      
    } catch (error) {
      console.error('Payment verification failed:', error);
      setPaymentData({ status: 'failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // In production, this would generate and download the actual QR code
    // For now, we'll create a placeholder download
    const element = document.createElement('a');
    const file = new Blob(['AdTopia QR Code Package\n\nYour custom QR code will be delivered within 24 hours.\n\nThank you for your purchase!'], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'adtopia-qr-package.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const sendConfirmationEmail = async () => {
    try {
      // In production, this would trigger an email via your backend
      console.log('Sending confirmation email to:', paymentData.customerEmail);
      alert('Confirmation email sent!');
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Verifying Payment - AdTopia</title>
        </Head>
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
            <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Verifying Payment...</h1>
            <p className="text-gray-600">Please wait while we confirm your purchase.</p>
          </div>
        </main>
      </>
    );
  }

  if (paymentData.status === 'failed') {
    return (
      <>
        <Head>
          <title>Payment Verification Failed - AdTopia</title>
        </Head>
        <main className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Verification Failed</h1>
            <p className="text-lg text-gray-600 mb-8">
              We couldn't verify your payment. Please contact support if you were charged.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/')}
                className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Return to Home
              </button>
              <a
                href="mailto:support@adtopia.io"
                className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Payment Successful - AdTopia</title>
        <meta name="description" content="Your payment was successful. Welcome to AdTopia!" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Payment Successful! 🎉
            </h1>
            
            <p className="text-xl text-gray-600 mb-2">
              Welcome to AdTopia! Your order has been confirmed.
            </p>
            
            {paymentData.productName && (
              <p className="text-lg text-gray-500">
                Package: <span className="font-semibold">{paymentData.productName}</span>
                {paymentData.amount && (
                  <span> - ${paymentData.amount.toFixed(2)}</span>
                )}
              </p>
            )}
          </div>

          {/* Next Steps */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📧 What's Next?</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-sm font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Confirmation Email</h3>
                    <p className="text-gray-600">Check your email for order details and next steps.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-sm font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">QR Code Generation</h3>
                    <p className="text-gray-600">Your custom QR code will be created within 24 hours.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-sm font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Delivery</h3>
                    <p className="text-gray-600">Download links and access will be sent to your email.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Your Benefits</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Professional QR Code Design</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Mobile-Responsive Design</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">24/7 Customer Support</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Analytics Dashboard</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            {downloadReady && (
              <button
                onClick={handleDownload}
                className="block w-full max-w-md mx-auto bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors text-lg"
              >
                📥 Download Your Package
              </button>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <button
                onClick={sendConfirmationEmail}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                📧 Resend Confirmation
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                🏠 Return to Home
              </button>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500 mb-2">
                Questions? We're here to help!
              </p>
              <a
                href="mailto:support@adtopia.io"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                support@adtopia.io
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
