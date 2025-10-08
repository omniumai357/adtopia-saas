import React from 'react';
import { useABTest, clearABTestCookie } from '@/hooks/useABTest';

interface OnboardingCTAProps {
  onGetStarted: () => void;
  onLearnMore: () => void;
}

/**
 * Example onboarding CTA component using A/B testing
 * Demonstrates how to use the useABTest hook for different variants
 */
export function OnboardingCTA({ onGetStarted, onLearnMore }: OnboardingCTAProps) {
  const { variant, isVariantA, isVariantB } = useABTest();

  return (
    <div className="onboarding-cta">
      {isVariantA ? (
        // Variant A: Direct, action-oriented CTA
        <div className="variant-a">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Scale Your Revenue?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of agencies already growing with AdTopia's proven system.
          </p>
          <div className="flex gap-4">
            <button
              onClick={onGetStarted}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started Now
            </button>
            <button
              onClick={onLearnMore}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>
      ) : (
        // Variant B: Social proof focused CTA
        <div className="variant-b">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Trusted by 500+ Agencies
          </h2>
          <p className="text-gray-600 mb-6">
            See why top-performing agencies choose AdTopia for their revenue growth.
          </p>
          <div className="flex gap-4">
            <button
              onClick={onGetStarted}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Start Your Journey
            </button>
            <button
              onClick={onLearnMore}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              View Success Stories
            </button>
          </div>
        </div>
      )}
      
      {/* Development helper - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Dev Mode:</strong> Current variant: <code>{variant}</code>
          </p>
          <button
            onClick={clearABTestCookie}
            className="mt-2 text-xs bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded"
          >
            Clear A/B Test Cookie
          </button>
        </div>
      )}
    </div>
  );
}

export default OnboardingCTA;
