'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { useABTest } from '@/hooks/useABTest';

interface OnboardingEmailFormProps {
  onSubmit?: (email: string) => void;
  className?: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * OnboardingEmailForm component with A/B testing integration
 * Features:
 * - A/B test variants for CTA buttons
 * - Framer Motion animations
 * - Supabase tracking for variant exposure
 * - Email validation and submission
 */
export function OnboardingEmailForm({ onSubmit, className = '' }: OnboardingEmailFormProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const { variant, isVariantA, isVariantB } = useABTest();

  // Track A/B test exposure on mount
  useEffect(() => {
    const trackExposure = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        await supabase.functions.invoke('track_ab_exposure', {
          body: {
            user_id: user?.id || null,
            variant: variant,
            event: 'cta_view',
            timestamp: new Date().toISOString()
          }
        });
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[AB Test] Tracked exposure for variant: ${variant}`);
        }
      } catch (error) {
        console.error('Failed to track A/B test exposure:', error);
      }
    };

    trackExposure();
  }, [variant]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the onSubmit prop if provided
      if (onSubmit) {
        await onSubmit(email);
      }

      // Track CTA click
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.functions.invoke('track_ab_exposure', {
        body: {
          user_id: user?.id || null,
          variant: variant,
          event: 'cta_click',
          email: email,
          timestamp: new Date().toISOString()
        }
      });

      setIsSubmitted(true);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[AB Test] Tracked CTA click for variant: ${variant}`);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`text-center ${className}`}
      >
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="text-green-600 text-2xl mb-2">✓</div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Welcome to AdTopia!
          </h3>
          <p className="text-green-700">
            Check your email for next steps to start your revenue journey.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`max-w-md mx-auto ${className}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3"
          >
            {error}
          </motion.div>
        )}

        {/* A/B Test CTA Button Variants */}
        {isVariantA ? (
          // Variant A: Blue button with "Start Free Trial Now"
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Starting...
              </div>
            ) : (
              'Start Free Trial Now'
            )}
          </motion.button>
        ) : (
          // Variant B: Green button with "Join Top Agencies – Free!" and badge
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="relative"
          >
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center relative"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Joining...
                </div>
              ) : (
                <>
                  Join Top Agencies – Free!
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    Limited Spots
                  </span>
                </>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Development indicator */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-gray-500 text-center bg-gray-100 rounded p-2"
          >
            A/B Test Variant: <span className="font-mono font-semibold">{variant}</span>
          </motion.div>
        )}
      </form>
    </motion.div>
  );
}

export default OnboardingEmailForm;
