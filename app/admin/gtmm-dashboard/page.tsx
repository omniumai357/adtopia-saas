'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';

interface GTMMMetrics {
  active_research: number;
  completed_research: number;
  total_leads_sourced: number;
  avg_opportunity_score: number;
  top_performing_niche: string;
}

interface CronJob {
  jobname: string;
  schedule: string;
  active: boolean;
  last_run: string;
  next_run: string;
  category: string;
}

export default function GTMMDashboard() {
  const [metrics, setMetrics] = useState<GTMMMetrics | null>(null);
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGTMMData();
  }, []);

  const fetchGTMMData = async () => {
    try {
      setLoading(true);
      
      // Fetch GTMM metrics from audit log
      const metricsResponse = await fetch('/api/admin/gtmm-metrics');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }

      // Fetch cron job status
      const cronResponse = await fetch('/api/admin/gtmm-cron-status');
      if (cronResponse.ok) {
        const cronData = await cronResponse.json();
        setCronJobs(cronData);
      }

    } catch (err) {
      setError('Failed to fetch GTMM data');
      console.error('GTMM Dashboard Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (active: boolean) => {
    return active ? 'text-green-600' : 'text-red-600';
  };

  const getStatusText = (active: boolean) => {
    return active ? 'Active' : 'Inactive';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading GTMM Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>GTMM Dashboard - AdTopia Admin</title>
        <meta name="description" content="Go-To-Market Machine Dashboard" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">GTMM Dashboard</h1>
                <p className="mt-2 text-gray-600">Go-To-Market Machine - Automated Revenue Scaling</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={fetchGTMMData}
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

          {/* GTMM Metrics */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Revenue Machine Metrics</h2>
            {metrics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Research</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.active_research}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Completed Research</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.completed_research}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Leads Sourced</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.total_leads_sourced}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Opportunity Score</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.avg_opportunity_score}/10</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">No metrics data available</p>
              </div>
            )}
          </div>

          {/* Top Performing Niche */}
          {metrics?.top_performing_niche && (
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Performing Niche</h3>
                <p className="text-2xl font-bold text-blue-600 capitalize">{metrics.top_performing_niche}</p>
              </div>
            </div>
          )}

          {/* Cron Jobs Status */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Automation Status</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Run
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Run
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cronJobs.map((job) => (
                    <tr key={job.jobname}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{job.jobname}</div>
                        <div className="text-sm text-gray-500">{job.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {job.schedule}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getStatusColor(job.active)}`}>
                          {getStatusText(job.active)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {job.last_run ? formatDateTime(job.last_run) : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {job.next_run ? formatDateTime(job.next_run) : 'Not scheduled'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue Projection */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Revenue Projection</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Target</h3>
                <p className="text-3xl font-bold text-green-600">$50K</p>
                <p className="text-sm text-gray-600 mt-2">From current $2.5K</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Annual Target</h3>
                <p className="text-3xl font-bold text-blue-600">$600K</p>
                <p className="text-sm text-gray-600 mt-2">ARR Goal</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Lead Target</h3>
                <p className="text-3xl font-bold text-purple-600">50/week</p>
                <p className="text-sm text-gray-600 mt-2">Automated sourcing</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
