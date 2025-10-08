'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type DashboardStats = {
  totalProducts: number;
  totalRevenue: number;
  recentProducts: Array<{
    id: string;
    name: string;
    price_usd: number;
    created_at: string;
  }>;
};

type ABTestSummary = {
  variant: string;
  total_views: number;
  total_conversions: number;
  conversion_rate_percent: number;
  uplift_percent: number;
  is_statistically_significant: boolean;
  p_value: number;
};

type FeatureFlag = {
  flag_name: string;
  flag_value: string;
  is_active: boolean;
};

export default function AdminDashboard() {
  const supabase = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    : null;
  
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalRevenue: 0,
    recentProducts: []
  });
  const [abTestData, setAbTestData] = useState<ABTestSummary[]>([]);
  const [featureFlag, setFeatureFlag] = useState<FeatureFlag | null>(null);
  const [loading, setLoading] = useState(true);
  const [abTestLoading, setAbTestLoading] = useState(false);
  const [endingTest, setEndingTest] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!supabase) {
          // Set mock data if Supabase is not available
          setStats({
            totalProducts: 0,
            totalRevenue: 0,
            recentProducts: []
          });
          setLoading(false);
          return;
        }

        // Try to fetch real data from Supabase
        const { count: totalProducts } = await supabase
          .from('stripe_products_log')
          .select('*', { count: 'exact', head: true });

        const { data: revenueData } = await supabase
          .from('stripe_products_log')
          .select('price_usd');

        const totalRevenue = revenueData?.reduce((sum, item) => sum + (item.price_usd || 0), 0) || 0;

        const { data: recentProducts } = await supabase
          .from('stripe_products_log')
          .select('id, name, price_usd, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        setStats({
          totalProducts: totalProducts || 0,
          totalRevenue,
          recentProducts: recentProducts || []
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Set mock data if Supabase is not available
        setStats({
          totalProducts: 0,
          totalRevenue: 0,
          recentProducts: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    fetchABTestData();
    fetchFeatureFlag();
  }, [supabase]);

  const fetchABTestData = async () => {
    if (!supabase) return;
    
    setAbTestLoading(true);
    try {
      const { data, error } = await supabase
        .from('ab_test_summary')
        .select('*');

      if (error) {
        console.error('Error fetching A/B test data:', error);
        return;
      }

      setAbTestData(data || []);
    } catch (error) {
      console.error('Error fetching A/B test data:', error);
    } finally {
      setAbTestLoading(false);
    }
  };

  const fetchFeatureFlag = async () => {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .eq('flag_name', 'ab_test_active')
        .single();

      if (error) {
        console.error('Error fetching feature flag:', error);
        return;
      }

      setFeatureFlag(data);
    } catch (error) {
      console.error('Error fetching feature flag:', error);
    }
  };

  const endTestAndPickWinner = async () => {
    if (!supabase) return;
    
    setEndingTest(true);
    try {
      // Update feature flag to end the test
      const { error: flagError } = await supabase
        .from('feature_flags')
        .update({ 
          flag_value: 'false', 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('flag_name', 'ab_test_active');

      if (flagError) {
        console.error('Error updating feature flag:', flagError);
        return;
      }

      // Determine winner
      const variantB = abTestData.find(d => d.variant === 'B');
      const winner = variantB && variantB.uplift_percent > 1 && variantB.total_views > 500 ? 'B' : 'A';

      // Send email notification to admins
      const { error: emailError } = await supabase.functions.invoke('send-admin-notification', {
        body: {
          type: 'ab_test_completed',
          winner: winner,
          data: abTestData,
          timestamp: new Date().toISOString()
        }
      });

      if (emailError) {
        console.error('Error sending admin notification:', emailError);
      }

      // Refresh data
      await fetchFeatureFlag();
      await fetchABTestData();

      alert(`A/B test ended! Winner: Variant ${winner}`);
    } catch (error) {
      console.error('Error ending test:', error);
      alert('Error ending test. Please try again.');
    } finally {
      setEndingTest(false);
    }
  };

  const getWinnerRecommendation = () => {
    const variantB = abTestData.find(d => d.variant === 'B');
    if (!variantB) return null;

    if (variantB.total_views >= 500 && variantB.uplift_percent > 1 && variantB.is_statistically_significant) {
      return {
        winner: 'B',
        confidence: 'high',
        reason: 'Statistically significant uplift with sufficient sample size'
      };
    } else if (variantB.total_views >= 500 && variantB.uplift_percent > 1) {
      return {
        winner: 'B',
        confidence: 'medium',
        reason: 'Positive uplift but not statistically significant'
      };
    } else if (variantB.total_views < 500) {
      return {
        winner: null,
        confidence: 'low',
        reason: 'Insufficient sample size'
      };
    } else {
      return {
        winner: 'A',
        confidence: 'low',
        reason: 'No significant difference detected'
      };
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-semibold text-gray-900">2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Recent Products</h2>
            <Link 
              href="/admin/stripe-logs" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </Link>
          </div>
        </div>
        <div className="p-6">
          {stats.recentProducts.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products yet</h3>
              <p className="mt-1 text-sm text-gray-500">Products will appear here once they're created.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">
                      Created {new Date(product.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">${product.price_usd.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* A/B Test Monitor */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">A/B Test Monitor</h2>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                featureFlag?.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {featureFlag?.is_active ? 'Active' : 'Inactive'}
              </div>
              {featureFlag?.is_active && (
                <button
                  onClick={endTestAndPickWinner}
                  disabled={endingTest || abTestLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {endingTest ? 'Ending...' : 'End Test & Pick Winner'}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="p-6">
          {abTestLoading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ) : abTestData.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No A/B test data</h3>
              <p className="mt-1 text-sm text-gray-500">A/B test data will appear here once the test is running.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Winner Recommendation Alert */}
              {(() => {
                const recommendation = getWinnerRecommendation();
                if (recommendation && recommendation.winner && recommendation.confidence === 'high') {
                  return (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">
                            Winner Recommendation: Variant {recommendation.winner}
                          </h3>
                          <p className="mt-1 text-sm text-green-700">{recommendation.reason}</p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* A/B Test Results Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Variant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Conversions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rate %
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uplift %
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Significance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {abTestData.map((variant) => (
                      <tr key={variant.variant}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            variant.variant === 'A' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            Variant {variant.variant}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {variant.total_views.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {variant.total_conversions.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {variant.conversion_rate_percent}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {variant.variant === 'B' ? (
                            <span className={`font-medium ${
                              variant.uplift_percent > 0 
                                ? 'text-green-600' 
                                : variant.uplift_percent < 0 
                                  ? 'text-red-600' 
                                  : 'text-gray-600'
                            }`}>
                              {variant.uplift_percent > 0 ? '+' : ''}{variant.uplift_percent}%
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {variant.variant === 'B' ? (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              variant.is_statistically_significant
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {variant.is_statistically_significant ? 'Significant' : 'Not Significant'}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Conversion Rate Chart */}
              <div className="h-64">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Conversion Rate Comparison</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={abTestData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="variant" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, 'Conversion Rate']}
                      labelFormatter={(label) => `Variant ${label}`}
                    />
                    <Bar 
                      dataKey="conversion_rate_percent" 
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/admin/stripe-logs" 
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">View Stripe Logs</span>
              </div>
            </Link>

            <Link 
              href="/admin/products" 
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="text-sm font-medium text-gray-900">Manage Products</span>
              </div>
            </Link>

            <Link 
              href="/admin/analytics" 
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">View Analytics</span>
              </div>
            </Link>

            <Link 
              href="/" 
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="text-sm font-medium text-gray-900">View Site</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
