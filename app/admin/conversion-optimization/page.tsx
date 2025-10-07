'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';

interface ABTest {
  test_id: string;
  test_name: string;
  target_niche: string;
  status: string;
  target_conversion_rate: number;
  current_conversion_rate: number;
  variant_a_visitors: number;
  variant_a_conversions: number;
  variant_a_rate: number;
  variant_b_visitors: number;
  variant_b_conversions: number;
  variant_b_rate: number;
  current_winner: string;
  improvement_margin: number;
}

interface MessagingVariant {
  id: string;
  variant_name: string;
  hook_line: string;
  value_proposition: string;
  call_to_action: string;
  target_niche: string;
  variant_type: string;
  expected_conversion_lift: number;
  actual_conversion_rate: number;
  test_status: string;
}

export default function ConversionOptimization() {
  const [abTests, setAbTests] = useState<ABTest[]>([]);
  const [messagingVariants, setMessagingVariants] = useState<MessagingVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [optimizationNiche, setOptimizationNiche] = useState('construction');
  const [currentConversionRate, setCurrentConversionRate] = useState(3.5);

  useEffect(() => {
    fetchConversionData();
  }, []);

  const fetchConversionData = async () => {
    try {
      setLoading(true);
      
      // Fetch A/B test data
      const testsResponse = await fetch('/api/admin/ab-tests');
      if (testsResponse.ok) {
        const testsData = await testsResponse.json();
        setAbTests(testsData);
      }

      // Fetch messaging variants
      const variantsResponse = await fetch('/api/admin/messaging-variants');
      if (variantsResponse.ok) {
        const variantsData = await variantsResponse.json();
        setMessagingVariants(variantsData);
      }

    } catch (err) {
      setError('Failed to fetch conversion optimization data');
      console.error('Conversion Optimization Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateOptimization = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/generate-optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          niche: optimizationNiche,
          current_conversion_rate: currentConversionRate
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Optimization generated:', result);
        await fetchConversionData(); // Refresh data
      } else {
        throw new Error('Failed to generate optimization');
      }

    } catch (err) {
      setError('Failed to generate optimization');
      console.error('Optimization Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(2)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getVariantTypeColor = (type: string) => {
    switch (type) {
      case 'urgency': return 'text-red-600 bg-red-100';
      case 'social_proof': return 'text-blue-600 bg-blue-100';
      case 'roi_focused': return 'text-green-600 bg-green-100';
      case 'risk_reduction': return 'text-purple-600 bg-purple-100';
      case 'scarcity': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Conversion Optimization...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Conversion Optimization - AdTopia Admin</title>
        <meta name="description" content="A/B Testing and Conversion Optimization Dashboard" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Conversion Optimization</h1>
                <p className="mt-2 text-gray-600">A/B Testing for 6-8% Conversion Rates</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={fetchConversionData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh Data
                </button>
                <a
                  href="/admin"
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back to Admin
                </a>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Optimization Generator */}
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Generate FOMO Messaging Variants</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Niche</label>
                <select
                  value={optimizationNiche}
                  onChange={(e) => setOptimizationNiche(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="construction">Construction</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="landscaping">Landscaping</option>
                  <option value="electrical">Electrical</option>
                  <option value="hvac">HVAC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Conversion Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={currentConversionRate}
                  onChange={(e) => setCurrentConversionRate(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={generateOptimization}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate Variants'}
                </button>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Target:</strong> 6-8% conversion rate</p>
              <p><strong>Improvement Needed:</strong> {((8 - currentConversionRate).toFixed(1))}%</p>
            </div>
          </div>

          {/* A/B Tests Overview */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">A/B Tests Overview</h2>
            {abTests.length > 0 ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niche</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant A</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant B</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Winner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Improvement</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {abTests.map((test) => (
                      <tr key={test.test_id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{test.test_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {test.target_niche}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(test.status)}`}>
                            {test.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{formatPercentage(test.variant_a_rate)}</div>
                          <div className="text-xs text-gray-500">{test.variant_a_visitors} visitors</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{formatPercentage(test.variant_b_rate)}</div>
                          <div className="text-xs text-gray-500">{test.variant_b_visitors} visitors</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`font-semibold ${test.current_winner === 'A' ? 'text-blue-600' : test.current_winner === 'B' ? 'text-green-600' : 'text-gray-600'}`}>
                            {test.current_winner}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPercentage(test.improvement_margin)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">No A/B tests found. Generate messaging variants to start testing.</p>
              </div>
            )}
          </div>

          {/* Messaging Variants */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">FOMO Messaging Variants</h2>
            {messagingVariants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {messagingVariants.map((variant) => (
                  <div key={variant.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVariantTypeColor(variant.variant_type)}`}>
                        {variant.variant_type.replace('_', ' ')}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(variant.test_status)}`}>
                        {variant.test_status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{variant.variant_name}</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Hook Line:</p>
                        <p className="text-sm text-gray-900">{variant.hook_line}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Value Proposition:</p>
                        <p className="text-sm text-gray-900">{variant.value_proposition}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Call to Action:</p>
                        <p className="text-sm text-gray-900">{variant.call_to_action}</p>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm text-gray-600">Expected Lift:</span>
                        <span className="text-sm font-semibold text-green-600">
                          +{formatPercentage(variant.expected_conversion_lift)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">No messaging variants found. Generate variants to start A/B testing.</p>
              </div>
            )}
          </div>

          {/* Conversion Goals */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Conversion Goals</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Performance</h3>
                <p className="text-3xl font-bold text-gray-600">{currentConversionRate}%</p>
                <p className="text-sm text-gray-600 mt-2">Average conversion rate</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Target Performance</h3>
                <p className="text-3xl font-bold text-blue-600">6-8%</p>
                <p className="text-sm text-gray-600 mt-2">Optimization target</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Improvement Needed</h3>
                <p className="text-3xl font-bold text-green-600">+{((8 - currentConversionRate).toFixed(1))}%</p>
                <p className="text-sm text-gray-600 mt-2">To reach target</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
