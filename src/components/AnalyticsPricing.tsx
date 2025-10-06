import React from 'react';
import { APP_CONFIG } from '../config/appConfig';

interface AnalyticsPricingProps {
  className?: string;
}

export default function AnalyticsPricing({ className = '' }: AnalyticsPricingProps) {
  const analyticsTiers = APP_CONFIG.ANALYTICS;

  return (
    <div className={`bg-white rounded-lg shadow-lg p-8 ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Analytics Pricing</h2>
        <p className="text-lg text-gray-600">
          Choose the analytics plan that fits your business needs
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Basic Analytics - Free */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {analyticsTiers.BASIC.name}
            </h3>
            <div className="text-3xl font-bold text-gray-900 mb-4">
              {analyticsTiers.BASIC.priceDisplay}
            </div>
            <p className="text-gray-600 mb-6">
              {analyticsTiers.BASIC.description}
            </p>
          </div>
          
          <ul className="space-y-3 mb-6">
            {analyticsTiers.BASIC.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
          
          <button className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
            Included with Package
          </button>
        </div>

        {/* Pro Analytics */}
        <div className="border-2 border-blue-500 rounded-lg p-6 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Most Popular
            </span>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {analyticsTiers.PRO.name}
            </h3>
            <div className="text-3xl font-bold text-gray-900 mb-4">
              {analyticsTiers.PRO.priceDisplay}
            </div>
            <p className="text-gray-600 mb-6">
              {analyticsTiers.PRO.description}
            </p>
          </div>
          
          <ul className="space-y-3 mb-6">
            {analyticsTiers.PRO.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
          
          <a
            href={analyticsTiers.PRO.stripeLink}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors block text-center"
          >
            Upgrade to Pro
          </a>
        </div>

        {/* Enterprise Analytics */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {analyticsTiers.ENTERPRISE.name}
            </h3>
            <div className="text-3xl font-bold text-gray-900 mb-4">
              {analyticsTiers.ENTERPRISE.priceDisplay}
            </div>
            <p className="text-gray-600 mb-6">
              {analyticsTiers.ENTERPRISE.description}
            </p>
          </div>
          
          <ul className="space-y-3 mb-6">
            {analyticsTiers.ENTERPRISE.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
          
          <a
            href={analyticsTiers.ENTERPRISE.stripeLink}
            className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors block text-center"
          >
            Upgrade to Enterprise
          </a>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-900">Feature</th>
                <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-900">Basic</th>
                <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-900">Pro</th>
                <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-900">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">Page Views</td>
                <td className="border border-gray-200 px-4 py-3 text-center">✓</td>
                <td className="border border-gray-200 px-4 py-3 text-center">✓</td>
                <td className="border border-gray-200 px-4 py-3 text-center">✓</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">Click Tracking</td>
                <td className="border border-gray-200 px-4 py-3 text-center">✓</td>
                <td className="border border-gray-200 px-4 py-3 text-center">✓</td>
                <td className="border border-gray-200 px-4 py-3 text-center">✓</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">Basic Reports</td>
                <td className="border border-gray-200 px-4 py-3 text-center">✓</td>
                <td className="border border-gray-200 px-4 py-3 text-center">✓</td>
                <td className="border border-gray-200 px-4 py-3 text-center">✓</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">Advanced Tracking</td>
                <td className="border border-gray-200 px-4 py-3 text-center">-</td>
                <td className="border border-gray-200 px-4 py-3 text-center">✓</td>
                <td className="border border-gray-200 px-4 py-3 text-center">✓</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">Conversion Metrics</td>
                <td className="border border-gray-200 px-4 py-3 text-center">-</td>
                <td className="border border-gray-200 px-4 py-3 text-center">✓</td>
                <td className="border border-gray-200 px-4 py-3 text-center">✓</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">Custom Reports</td>
                <td className="border border-gray-200 px-4 py-3 text-center">-</td>
                <td className="border border-gray-200 px-4 py-3 text-center">✓</td>
                <td className="border border-gray-200 px-4 py-3 text-center">✓</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">Real-time Data</td>
                <td className="border border-gray-200 px-4 py-3 text-center">-</td>
                <td className="border border-gray-200 px-4 py-3 text-center">✓</td>
                <td className="border border-gray-200 px-4 py-3 text-center">✓</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">Export Options</td>
                <td className="border border-gray-200 px-4 py-3 text-center">-</td>
                <td className="border border-gray-200 px-4 py-3 text-center">✓</td>
                <td className="border border-gray-200 px-4 py-3 text-center">✓</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">API Access</td>
                <td className="border border-gray-200 px-4 py-3 text-center">-</td>
                <td className="border border-gray-200 px-4 py-3 text-center">-</td>
                <td className="border border-gray-200 px-4 py-3 text-center">✓</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">Custom Dashboards</td>
                <td className="border border-gray-200 px-4 py-3 text-center">-</td>
                <td className="border border-gray-200 px-4 py-3 text-center">-</td>
                <td className="border border-gray-200 px-4 py-3 text-center">✓</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">White-label Reports</td>
                <td className="border border-gray-200 px-4 py-3 text-center">-</td>
                <td className="border border-gray-200 px-4 py-3 text-center">-</td>
                <td className="border border-gray-200 px-4 py-3 text-center">✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
