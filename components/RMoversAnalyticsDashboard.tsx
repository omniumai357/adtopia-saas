'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface RMoversAnalytics {
  variant: string;
  service: string;
  views: number;
  clicks: number;
  conversions: number;
  signups: number;
  avg_engagement_time: number;
  avg_dwell_time: number;
  unique_viewers: number;
  unique_clickers: number;
  unique_converters: number;
  click_rate_percent: number;
  conversion_rate_percent: number;
  click_to_conversion_rate_percent: number;
  uplift_percent: number;
  is_statistically_significant: boolean;
  p_value: number;
  roi_projection_usd: number;
}

interface HybridRecommendation {
  variant_name: string;
  hybrid_description: string;
  recommended_mix: string;
  best_use_case: string;
  expected_improvement: string;
}

interface WinnerAnalysis {
  variant: string;
  views: number;
  conversions: number;
  conversion_rate_percent: number;
  click_rate_percent: number;
  avg_dwell_time: number;
  roi_projection_usd: number;
  is_statistically_significant: boolean;
  p_value: number;
  recommendation: any;
}

export function RMoversAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<RMoversAnalytics[]>([]);
  const [hybridRecommendations, setHybridRecommendations] = useState<HybridRecommendation[]>([]);
  const [winnerAnalysis, setWinnerAnalysis] = useState<WinnerAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRMoversAnalytics();
  }, []);

  const fetchRMoversAnalytics = async () => {
    try {
      // Fetch R Movers analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('rmovers_ab_test_analytics')
        .select('*');

      if (analyticsError) {
        console.error('Error fetching R Movers analytics:', analyticsError);
        return;
      }

      setAnalytics(analyticsData || []);

      // Fetch hybrid recommendations
      const { data: hybridData, error: hybridError } = await supabase
        .from('ab_test_hybrid_recommendations')
        .select('*');

      if (hybridError) {
        console.error('Error fetching hybrid recommendations:', hybridError);
        return;
      }

      setHybridRecommendations(hybridData || []);

      // Fetch winner analysis
      const { data: winnerData, error: winnerError } = await supabase
        .from('rmovers_winner_analysis')
        .select('*');

      if (winnerError) {
        console.error('Error fetching winner analysis:', winnerError);
        return;
      }

      setWinnerAnalysis(winnerData || []);
    } catch (error) {
      console.error('Error fetching R Movers data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const totalViews = analytics.reduce((sum, item) => sum + item.views, 0);
  const totalConversions = analytics.reduce((sum, item) => sum + item.conversions, 0);
  const totalROI = analytics.reduce((sum, item) => sum + item.roi_projection_usd, 0);
  const avgConversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{totalViews}</div>
          <div className="text-sm text-gray-600">Total Views</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{totalConversions}</div>
          <div className="text-sm text-gray-600">Conversions</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{avgConversionRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Avg Conversion Rate</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-orange-600">${totalROI}</div>
          <div className="text-sm text-gray-600">Projected ROI</div>
        </div>
      </div>

      {/* Winner Analysis Alert */}
      {winnerAnalysis.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Winner Analysis</h3>
          {winnerAnalysis.map((analysis) => (
            <div key={analysis.variant} className="mb-4">
              <div className={`p-4 rounded-lg ${
                analysis.recommendation?.confidence === 'high' 
                  ? 'bg-green-50 border border-green-200' 
                  : analysis.recommendation?.confidence === 'medium'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Variant {analysis.variant}</h4>
                    <p className="text-sm text-gray-600">
                      {analysis.recommendation?.reason}
                    </p>
                    <p className="text-sm font-medium">
                      Action: {analysis.recommendation?.action}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {analysis.conversion_rate_percent}%
                    </div>
                    <div className="text-sm text-gray-600">Conversion Rate</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Analytics Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">R Movers A/B Test Results</h3>
        </div>
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
                  Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Click Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conv Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Dwell
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Significance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.map((item) => (
                <tr key={item.variant}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.variant === 'A' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.variant === 'A' ? 'A1 Urgency Red' : 'A2 Value Blue'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.views}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.clicks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.conversions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.click_rate_percent}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.conversion_rate_percent}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.avg_dwell_time}s
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${item.roi_projection_usd}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.variant === 'B' ? (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.is_statistically_significant
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.is_statistically_significant ? 'Significant' : 'Not Significant'}
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
      </div>

      {/* Conversion Rate Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Conversion Rate Comparison</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics}>
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

      {/* Hybrid Recommendations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Hybrid Test Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hybridRecommendations.map((rec, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-600 mb-2">{rec.variant_name}</h4>
              <p className="text-sm text-gray-600 mb-2">{rec.hybrid_description}</p>
              <p className="text-sm font-medium mb-2">Mix: {rec.recommended_mix}</p>
              <p className="text-sm text-gray-600 mb-2">Best for: {rec.best_use_case}</p>
              <p className="text-sm font-bold text-green-600">{rec.expected_improvement}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scaling Recommendations */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Scaling Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">1K Views</div>
            <div className="text-sm text-gray-600">Target for $4K ROI</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">500+ Impressions</div>
            <div className="text-sm text-gray-600">For statistical confidence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">+18% Uplift</div>
            <div className="text-sm text-gray-600">Hybrid test potential</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RMoversAnalyticsDashboard;
