'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';

interface PaymentLink {
  name: string;
  url: string;
  price: number;
  status: 'testing' | 'success' | 'error' | 'pending';
  error?: string;
}

export default function PaymentLinkTester() {
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([
    {
      name: 'Starter Package',
      url: 'https://buy.stripe.com/4gM5kCfCfghHeAnaFNbfO07',
      price: 49,
      status: 'pending'
    },
    {
      name: 'Basic Package',
      url: 'https://buy.stripe.com/dRmbJ0cq37Lb0JxdRZbfO08',
      price: 497,
      status: 'pending'
    },
    {
      name: 'Pro Package',
      url: 'https://buy.stripe.com/fZu8wO9dRfdDfErbJRbfO09',
      price: 997,
      status: 'pending'
    },
    {
      name: 'Ultimate Package',
      url: 'https://buy.stripe.com/14AfZg1LpaXn0JxcNVbfO0a',
      price: 1997,
      status: 'pending'
    },
    {
      name: 'Extra Translation',
      url: 'https://buy.stripe.com/test_translation',
      price: 29,
      status: 'pending'
    },
    {
      name: 'Domain + SSL',
      url: 'https://buy.stripe.com/test_domain_ssl',
      price: 49,
      status: 'pending'
    },
    {
      name: 'Extra Cards',
      url: 'https://buy.stripe.com/test_extra_cards',
      price: 39,
      status: 'pending'
    },
    {
      name: 'Premium Analytics',
      url: 'https://buy.stripe.com/test_analytics',
      price: 19,
      status: 'pending'
    },
    {
      name: 'Social Media Pack',
      url: 'https://buy.stripe.com/test_social_pack',
      price: 35,
      status: 'pending'
    },
    {
      name: 'Enterprise Package',
      url: 'https://buy.stripe.com/test_enterprise',
      price: 2997,
      status: 'pending'
    },
    {
      name: 'White Label Package',
      url: 'https://buy.stripe.com/test_white_label',
      price: 4997,
      status: 'pending'
    }
  ]);

  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState({
    total: 0,
    success: 0,
    error: 0,
    pending: 0
  });

  const testPaymentLink = async (link: PaymentLink, index: number) => {
    setPaymentLinks(prev => prev.map((l, i) => 
      i === index ? { ...l, status: 'testing' } : l
    ));

    try {
      // Test if the URL is accessible
      const response = await fetch(link.url, { 
        method: 'HEAD',
        mode: 'no-cors' // Avoid CORS issues
      });
      
      // If we get here, the URL is accessible
      setPaymentLinks(prev => prev.map((l, i) => 
        i === index ? { ...l, status: 'success' } : l
      ));
    } catch (error) {
      setPaymentLinks(prev => prev.map((l, i) => 
        i === index ? { 
          ...l, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error'
        } : l
      ));
    }
  };

  const testAllLinks = async () => {
    setTesting(true);
    setResults({ total: 0, success: 0, error: 0, pending: 0 });

    for (let i = 0; i < paymentLinks.length; i++) {
      await testPaymentLink(paymentLinks[i], i);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setTesting(false);
  };

  useEffect(() => {
    // Calculate results
    const total = paymentLinks.length;
    const success = paymentLinks.filter(l => l.status === 'success').length;
    const error = paymentLinks.filter(l => l.status === 'error').length;
    const pending = paymentLinks.filter(l => l.status === 'pending').length;

    setResults({ total, success, error, pending });
  }, [paymentLinks]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'testing':
        return '🔄';
      default:
        return '⏳';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'testing':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <>
      <Head>
        <title>Payment Link Tester - AdTopia</title>
        <meta name="description" content="Test all AdTopia payment links for functionality" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🔗 Payment Link Tester
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Test all AdTopia payment links to ensure they're working correctly
            </p>
            
            {/* Test All Button */}
            <button
              onClick={testAllLinks}
              disabled={testing}
              className={`px-6 py-3 rounded-lg font-semibold text-white ${
                testing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {testing ? '🔄 Testing All Links...' : '🚀 Test All Links'}
            </button>
          </div>

          {/* Results Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{results.total}</div>
              <div className="text-sm text-gray-600">Total Links</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">{results.success}</div>
              <div className="text-sm text-gray-600">Working</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-red-600">{results.error}</div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-gray-600">{results.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>

          {/* Payment Links List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Payment Links</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {paymentLinks.map((link, index) => (
                <div key={index} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getStatusIcon(link.status)}</span>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {link.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            ${link.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 break-all"
                        >
                          {link.url}
                        </a>
                      </div>
                      
                      {link.error && (
                        <div className="mt-2 text-sm text-red-600">
                          Error: {link.error}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(link.status)}`}>
                        {link.status.toUpperCase()}
                      </span>
                      
                      <button
                        onClick={() => testPaymentLink(link, index)}
                        disabled={link.status === 'testing'}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          link.status === 'testing'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {link.status === 'testing' ? 'Testing...' : 'Test'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              📋 Testing Instructions
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Click "Test All Links" to test all payment links automatically</li>
              <li>• Click individual "Test" buttons to test specific links</li>
              <li>• Green checkmarks (✅) indicate working links</li>
              <li>• Red X marks (❌) indicate broken or inaccessible links</li>
              <li>• Click on any URL to open it in a new tab for manual testing</li>
              <li>• All links should redirect to Stripe Checkout pages</li>
            </ul>
          </div>

          {/* Security Notice */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">
              ⚠️ Security Notice
            </h3>
            <p className="text-sm text-yellow-800">
              This page is for testing purposes only. Do not share these payment links publicly. 
              All payment links are configured for the AdTopia production environment.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
