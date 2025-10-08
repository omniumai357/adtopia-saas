'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRMoversTracking } from '@/hooks/useRMoversTracking';

interface RMoversABTestCardProps {
  onQuoteRequest?: (quoteType: 'family' | 'business' | 'student') => void;
  className?: string;
}

/**
 * R Movers A/B Test Card Component
 * A1: Urgency Red (FOMO) - "Slots Vanishing" overlay
 * A2: Value Blue (Trust) - "3,500+ Guarantee" + gallery
 */
export function RMoversABTestCard({ onQuoteRequest, className = '' }: RMoversABTestCardProps) {
  const [isEngaged, setIsEngaged] = useState(false);
  const [showUrgencyOverlay, setShowUrgencyOverlay] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  
  const { 
    trackCardView, 
    trackCTAClick, 
    trackQuoteRequest, 
    trackEngagementEnd,
    currentVariant, 
    currentCardType 
  } = useRMoversTracking();

  // Track card view on mount
  useEffect(() => {
    const ctaText = currentVariant === 'A' ? 'Slots Vanishing - Book Now!' : '3,500+ Moves Guaranteed';
    trackCardView(currentCardType as 'urgency_red' | 'value_blue', ctaText);
    
    // Show urgency overlay for A1 after 3 seconds
    if (currentVariant === 'A') {
      const timer = setTimeout(() => {
        setShowUrgencyOverlay(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentVariant, currentCardType, trackCardView]);

  const handleCTAClick = async (ctaText: string, urgencyLevel: 'high' | 'medium' | 'low' = 'medium') => {
    await trackCTAClick(ctaText, urgencyLevel);
    setIsEngaged(true);
  };

  const handleQuoteRequest = async (quoteType: 'family' | 'business' | 'student') => {
    await trackQuoteRequest(quoteType);
    if (onQuoteRequest) {
      onQuoteRequest(quoteType);
    }
  };

  const handleEngagementEnd = async () => {
    await trackEngagementEnd();
    setIsEngaged(false);
  };

  if (currentVariant === 'A') {
    // A1: Urgency Red (FOMO) Variant
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-6 shadow-lg ${className}`}
        onMouseEnter={() => setIsEngaged(true)}
        onMouseLeave={handleEngagementEnd}
      >
        {/* Urgency Overlay */}
        {showUrgencyOverlay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-2 -right-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg z-10"
          >
            🔥 SLOTS VANISHING
          </motion.div>
        )}

        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-2">
            Summer Move Rush
          </h2>
          <p className="text-red-700 mb-4">
            Last 3 slots available this week!
          </p>
          
          <div className="bg-white rounded-lg p-4 mb-4 border border-red-200">
            <div className="text-3xl font-bold text-red-600 mb-2">$99</div>
            <div className="text-sm text-gray-600">Complete Move Package</div>
            <div className="text-xs text-red-500 mt-1">Limited Time Only</div>
          </div>

          <motion.button
            onClick={() => handleCTAClick('Slots Vanishing - Book Now!', 'high')}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            BOOK NOW - SLOTS VANISHING!
          </motion.button>

          <div className="mt-4 text-xs text-red-600">
            ⚡ Same-day response guaranteed
          </div>
        </div>

        {/* Engagement indicator */}
        {isEngaged && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-2 right-2 text-xs text-red-500"
          >
            🔥 Hot lead
          </motion.div>
        )}
      </motion.div>
    );
  } else {
    // A2: Value Blue (Trust) Variant
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 shadow-lg ${className}`}
        onMouseEnter={() => setIsEngaged(true)}
        onMouseLeave={handleEngagementEnd}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-blue-800 mb-2">
            Trusted Moving Experts
          </h2>
          <p className="text-blue-700 mb-4">
            3,500+ successful moves guaranteed
          </p>
          
          <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">$99</div>
            <div className="text-sm text-gray-600">Complete Move Package</div>
            <div className="text-xs text-blue-500 mt-1">Satisfaction Guaranteed</div>
          </div>

          {/* Gallery preview */}
          <div className="mb-4">
            <button
              onClick={() => setShowGallery(!showGallery)}
              className="text-blue-600 text-sm underline hover:text-blue-800"
            >
              View Our Work Gallery
            </button>
            {showGallery && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 grid grid-cols-3 gap-2"
              >
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-200 h-16 rounded flex items-center justify-center text-xs text-gray-500">
                    Move {i}
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          <motion.button
            onClick={() => handleCTAClick('3,500+ Moves Guaranteed', 'medium')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            GET FREE QUOTE
          </motion.button>

          <div className="mt-4 text-xs text-blue-600">
            🏆 5-star rated, family-owned
          </div>
        </div>

        {/* Engagement indicator */}
        {isEngaged && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-2 right-2 text-xs text-blue-500"
          >
            👀 Browsing
          </motion.div>
        )}
      </motion.div>
    );
  }
}

/**
 * Quote Request Modal Component
 */
export function QuoteRequestModal({ 
  isOpen, 
  onClose, 
  onQuoteRequest 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onQuoteRequest: (type: 'family' | 'business' | 'student') => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
      >
        <h3 className="text-xl font-bold mb-4">What type of move?</h3>
        <div className="space-y-3">
          <button
            onClick={() => onQuoteRequest('family')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            👨‍👩‍👧‍👦 Family Move
          </button>
          <button
            onClick={() => onQuoteRequest('business')}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            🏢 Business Move
          </button>
          <button
            onClick={() => onQuoteRequest('student')}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            🎓 Student Move
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
}

export default RMoversABTestCard;
