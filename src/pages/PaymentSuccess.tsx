import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { APP_CONFIG } from '../config/appConfig';

interface PaymentData {
  sessionId?: string;
  productName?: string;
  amount?: number;
  customerEmail?: string;
  status?: 'verified' | 'pending' | 'failed';
}

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  icon: string;
}

export default function PaymentSuccess() {
  const router = useRouter();
  const [paymentData, setPaymentData] = useState<PaymentData>({ status: 'pending' });
  const [loading, setLoading] = useState(true);
  const [timelineSteps, setTimelineSteps] = useState<TimelineStep[]>([]);

  useEffect(() => {
    // Extract payment data from URL parameters
    const sessionId = router.query.session_id as string;
    const productName = router.query.product_name as string;
    const amount = router.query.amount as string;
    const customerEmail = router.query.customer_email as string;

    if (sessionId) {
      // Verify payment with Stripe (in production, this would be a server-side call)
      verifyPayment(sessionId, productName, amount, customerEmail);
    } else {
      // No session ID - show generic success
      setPaymentData({ status: 'verified' });
      setLoading(false);
    }
  }, [router.query]);

  const verifyPayment = async (sessionId: string, productName: string | undefined, amount: string | undefined, customerEmail: string | undefined) => {
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
      
    } catch (error) {
      console.error('Payment verification failed:', error);
      setPaymentData({ status: 'failed' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paymentData.status === 'verified') {
      // Set up timeline based on product purchased
      const steps: TimelineStep[] = [
        {
          id: 'payment',
          title: 'Payment Confirmed',
          description: 'Your payment has been successfully processed',
          status: 'completed',
          icon: '💳'
        },
        {
          id: 'processing',
          title: 'Order Processing',
          description: 'Your order is being prepared for fulfillment',
          status: 'completed',
          icon: '⚙️'
        },
        {
          id: 'generation',
          title: 'QR Code Generation',
          description: 'Your custom QR code is being generated',
          status: 'current',
          icon: '🎨'
        },
        {
          id: 'delivery',
          title: 'Delivery',
          description: 'Your QR code will be delivered within 24 hours',
          status: 'upcoming',
          icon: '📧'
        }
      ];

      setTimelineSteps(steps);
    }
  }, [paymentData.status]);

  const handleDownload = () => {
    // In production, this would generate and download the actual QR code
    const element = document.createElement('a');
    const file = new Blob(['AdTopia QR Code Package\n\nYour custom QR code will be delivered within 24 hours.\n\nThank you for your purchase!'], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'adtopia-qr-package.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const openBillingPortal = () => {
    // In production, this would redirect to Stripe Customer Portal
    window.open('https://billing.stripe.com/p/login/test_123', '_blank');
  };

  const contactSupport = () => {
    window.location.href = `mailto:${APP_CONFIG.supportEmail}?subject=Payment Support - ${paymentData.sessionId}`;
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
              <button
                onClick={contactSupport}
                className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Contact Support
              </button>
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

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Order Timeline</h2>
            <div className="space-y-6">
              {timelineSteps.map((step, index) => (
                <div key={step.id} className="flex items-start">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                    step.status === 'completed' ? 'bg-green-100 text-green-600' :
                    step.status === 'current' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    <span className="text-xl">{step.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${
                      step.status === 'completed' ? 'text-green-900' :
                      step.status === 'current' ? 'text-blue-900' :
                      'text-gray-500'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm ${
                      step.status === 'completed' ? 'text-green-700' :
                      step.status === 'current' ? 'text-blue-700' :
                      'text-gray-500'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  {index < timelineSteps.length - 1 && (
                    <div className="w-px h-8 bg-gray-200 ml-6 mt-6"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">📥 Download Your Package</h3>
              <p className="text-gray-600 mb-4">
                Your QR code package will be ready for download within 24 hours.
              </p>
              <button
                onClick={handleDownload}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Download Now
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">💳 Manage Billing</h3>
              <p className="text-gray-600 mb-4">
                Update payment methods, view invoices, and manage your subscription.
              </p>
              <button
                onClick={openBillingPortal}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Billing Portal
              </button>
            </div>
          </div>

          {/* Support Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              Our support team is here to help you get the most out of your AdTopia package.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={contactSupport}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                📧 Contact Support
              </button>
              <button
                onClick={() => router.push('/')}
                className="bg-blue-100 text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-200 transition-colors"
              >
                🏠 Return to Home
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
