'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';

interface SupportedLanguage {
  language_code: string;
  language_name: string;
  native_name: string;
  market_priority: number;
  estimated_market_size_usd: number;
  translation_complexity: string;
  is_active: boolean;
}

interface GlobalMarket {
  market_name: string;
  primary_language: string;
  currency: string;
  market_size_usd: number;
  digital_adoption_percent: number;
  avg_marketing_budget_usd: number;
  cultural_notes: string;
}

interface MultilingualContent {
  id: string;
  source_content: string;
  source_language: string;
  target_language: string;
  translated_content: string;
  niche: string;
  content_type: string;
  quality_score: number;
  status: string;
  created_at: string;
}

export default function MultilingualScaling() {
  const [supportedLanguages, setSupportedLanguages] = useState<SupportedLanguage[]>([]);
  const [globalMarkets, setGlobalMarkets] = useState<GlobalMarket[]>([]);
  const [multilingualContent, setMultilingualContent] = useState<MultilingualContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [translationContent, setTranslationContent] = useState('');
  const [translationNiche, setTranslationNiche] = useState('construction');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['es', 'fr', 'de']);

  useEffect(() => {
    fetchMultilingualData();
  }, []);

  const fetchMultilingualData = async () => {
    try {
      setLoading(true);
      
      // Fetch supported languages
      const languagesResponse = await fetch('/api/admin/supported-languages');
      if (languagesResponse.ok) {
        const languagesData = await languagesResponse.json();
        setSupportedLanguages(languagesData);
      }

      // Fetch global markets
      const marketsResponse = await fetch('/api/admin/global-markets');
      if (marketsResponse.ok) {
        const marketsData = await marketsResponse.json();
        setGlobalMarkets(marketsData);
      }

      // Fetch multilingual content
      const contentResponse = await fetch('/api/admin/multilingual-content');
      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        setMultilingualContent(contentData);
      }

    } catch (err) {
      setError('Failed to fetch multilingual data');
      console.error('Multilingual Scaling Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateTranslation = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/generate-translation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: translationContent,
          niche: translationNiche,
          target_languages: selectedLanguages,
          content_type: 'ad_copy'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Translation generated:', result);
        await fetchMultilingualData(); // Refresh data
      } else {
        throw new Error('Failed to generate translation');
      }

    } catch (err) {
      setError('Failed to generate translation');
      console.error('Translation Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeGlobalMarkets = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/analyze-global-markets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          niche: translationNiche,
          target_revenue: 100000,
          analysis_depth: 'comprehensive'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Global market analysis:', result);
      } else {
        throw new Error('Failed to analyze global markets');
      }

    } catch (err) {
      setError('Failed to analyze global markets');
      console.error('Market Analysis Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-600 bg-red-100';
      case 2: return 'text-orange-600 bg-orange-100';
      case 3: return 'text-yellow-600 bg-yellow-100';
      case 4: return 'text-blue-600 bg-blue-100';
      case 5: return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Multilingual Scaling...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Multilingual Scaling - AdTopia Admin</title>
        <meta name="description" content="32-Language Global Market Penetration" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Multilingual Scaling</h1>
                <p className="mt-2 text-gray-600">32-Language Global Market Penetration</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={fetchMultilingualData}
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

          {/* Global Market Overview */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Global Market Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Supported Languages</h3>
                <p className="text-3xl font-bold text-blue-600">32</p>
                <p className="text-sm text-gray-600 mt-2">Global coverage</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Reach</h3>
                <p className="text-3xl font-bold text-green-600">4.5B</p>
                <p className="text-sm text-gray-600 mt-2">People worldwide</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Segments</h3>
                <p className="text-3xl font-bold text-purple-600">{globalMarkets.length}</p>
                <p className="text-sm text-gray-600 mt-2">Active markets</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Items</h3>
                <p className="text-3xl font-bold text-orange-600">{multilingualContent.length}</p>
                <p className="text-sm text-gray-600 mt-2">Translated content</p>
              </div>
            </div>
          </div>

          {/* Translation Generator */}
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Generate Global Translations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content to Translate</label>
                <textarea
                  value={translationContent}
                  onChange={(e) => setTranslationContent(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your marketing content here..."
                />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Niche</label>
                  <select
                    value={translationNiche}
                    onChange={(e) => setTranslationNiche(e.target.value)}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Languages</label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {supportedLanguages.slice(0, 12).map((lang) => (
                      <label key={lang.language_code} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedLanguages.includes(lang.language_code)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLanguages([...selectedLanguages, lang.language_code]);
                            } else {
                              setSelectedLanguages(selectedLanguages.filter(l => l !== lang.language_code));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{lang.language_name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={generateTranslation}
                    disabled={loading || !translationContent}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Generating...' : 'Generate Translations'}
                  </button>
                  <button
                    onClick={analyzeGlobalMarkets}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Analyze Markets
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Supported Languages */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Supported Languages (32)</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Native Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complexity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {supportedLanguages.map((lang) => (
                    <tr key={lang.language_code}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{lang.language_name}</div>
                        <div className="text-sm text-gray-500">{lang.language_code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lang.native_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(lang.market_priority)}`}>
                          Tier {lang.market_priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(lang.estimated_market_size_usd)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getComplexityColor(lang.translation_complexity)}`}>
                          {lang.translation_complexity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${lang.is_active ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'}`}>
                          {lang.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Global Markets */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Global Market Segments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {globalMarkets.slice(0, 12).map((market) => (
                <div key={market.market_name} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{market.market_name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Language:</span>
                      <span className="text-sm font-medium">{market.primary_language.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Currency:</span>
                      <span className="text-sm font-medium">{market.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Market Size:</span>
                      <span className="text-sm font-medium">{formatCurrency(market.market_size_usd)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Digital Adoption:</span>
                      <span className="text-sm font-medium">{market.digital_adoption_percent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg Budget:</span>
                      <span className="text-sm font-medium">{formatCurrency(market.avg_marketing_budget_usd)}</span>
                    </div>
                  </div>
                  {market.cultural_notes && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-gray-600">{market.cultural_notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Multilingual Content */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Translated Content</h2>
            {multilingualContent.length > 0 ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niche</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {multilingualContent.slice(0, 10).map((content) => (
                      <tr key={content.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{content.source_language.toUpperCase()}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{content.source_content}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{content.target_language.toUpperCase()}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{content.translated_content}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {content.niche}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {content.content_type.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {content.quality_score}/10
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(content.status === 'completed' ? 1 : 5)}`}>
                            {content.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">No translated content found. Generate translations to start global market penetration.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
