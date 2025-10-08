'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FresnoPlumberMarketingProps {
  onLeadCapture?: (leadData: any) => void;
  className?: string;
}

/**
 * Fresno Plumber Marketing Blitz Component
 * Tied to Pipe Pros pivot with concise 3-second scroll bullets
 */
export function FresnoPlumberMarketing({ onLeadCapture, className = '' }: FresnoPlumberMarketingProps) {
  const [selectedService, setSelectedService] = useState<string>('');
  const [urgencyLevel, setUrgencyLevel] = useState<'emergency' | 'urgent' | 'routine'>('routine');

  const plumberBullets = [
    "🚰 24/7 Emergency Service - Fresno's #1",
    "💧 Same-Day Repairs - No Wait, No Hassle", 
    "🔧 Licensed & Insured - 15+ Years Experience",
    "💰 Upfront Pricing - No Surprise Bills",
    "⭐ 5-Star Rated - 500+ Happy Customers",
    "🏠 All Types: Kitchen, Bath, Main Line",
    "⚡ Free Estimates - Call Now!"
  ];

  const handleLeadCapture = (service: string, urgency: string) => {
    const leadData = {
      service,
      urgency,
      location: 'Fresno',
      timestamp: new Date().toISOString(),
      source: 'plumber_marketing_blitz'
    };
    
    if (onLeadCapture) {
      onLeadCapture(leadData);
    }
  };

  return (
    <div className={`bg-gradient-to-br from-blue-900 to-blue-800 text-white rounded-xl p-6 shadow-2xl ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Pipe Pros Fresno</h1>
        <p className="text-blue-200">Emergency Plumbing • Same-Day Service</p>
        <div className="text-2xl font-bold text-yellow-400 mt-2">(559) 555-PIPE</div>
      </div>

      {/* Urgency Selector */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">What's your situation?</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'emergency', label: '🚨 Emergency', color: 'bg-red-600 hover:bg-red-700' },
            { key: 'urgent', label: '⚡ Urgent', color: 'bg-orange-600 hover:bg-orange-700' },
            { key: 'routine', label: '🔧 Routine', color: 'bg-green-600 hover:bg-green-700' }
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setUrgencyLevel(key as any)}
              className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                urgencyLevel === key ? color : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Service Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">What do you need fixed?</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            'Kitchen Sink',
            'Bathroom',
            'Water Heater',
            'Main Line',
            'Toilet',
            'Drain Clog',
            'Pipe Burst',
            'Other'
          ].map((service) => (
            <button
              key={service}
              onClick={() => setSelectedService(service)}
              className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                selectedService === service 
                  ? 'bg-yellow-500 text-blue-900' 
                  : 'bg-blue-700 hover:bg-blue-600'
              }`}
            >
              {service}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Bullets - 3 Second Scroll Format */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Why Choose Pipe Pros?</h3>
        <div className="space-y-2">
          {plumberBullets.map((bullet, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center text-sm bg-blue-800 bg-opacity-50 rounded-lg p-2"
            >
              <span className="mr-2">{bullet}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          onClick={() => handleLeadCapture(selectedService, urgencyLevel)}
          className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold py-3 px-4 rounded-lg transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          📞 Call Now
        </motion.button>
        <motion.button
          onClick={() => handleLeadCapture(selectedService, urgencyLevel)}
          className="bg-green-500 hover:bg-green-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          💬 Text Quote
        </motion.button>
      </div>

      {/* Trust Indicators */}
      <div className="mt-6 text-center text-sm text-blue-200">
        <p>✅ Licensed • ✅ Insured • ✅ 24/7 Service</p>
        <p className="mt-1">Serving Fresno & Surrounding Areas</p>
      </div>
    </div>
  );
}

/**
 * HVAC Ad Prompts Component
 * "AC Fix Fresno" raw Craigslist spam style
 */
export function HVACAdPrompts() {
  const hvacPrompts = [
    {
      title: "AC Fix Fresno - Emergency Service",
      content: "🔥 AC BROKEN? We fix same day! Licensed HVAC techs. Free estimates. Call (559) 555-COOL",
      style: "emergency"
    },
    {
      title: "Fresno AC Repair - Fast & Cheap",
      content: "❄️ AC not cooling? We fix all brands. Same-day service. Upfront pricing. (559) 555-COOL",
      style: "urgent"
    },
    {
      title: "HVAC Fresno - 24/7 Emergency",
      content: "🌡️ Heat wave coming? Get your AC fixed NOW! Licensed & insured. Call (559) 555-COOL",
      style: "seasonal"
    },
    {
      title: "AC Repair Fresno - No Wait",
      content: "⚡ AC down? We're here! Fast repairs, fair prices. All makes & models. (559) 555-COOL",
      style: "immediate"
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">HVAC Ad Prompts (Craigslist Style)</h3>
      {hvacPrompts.map((prompt, index) => (
        <div key={index} className="bg-gray-100 border border-gray-300 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">{prompt.title}</h4>
          <p className="text-gray-700 text-sm">{prompt.content}</p>
          <div className="mt-2">
            <span className={`inline-block px-2 py-1 text-xs rounded ${
              prompt.style === 'emergency' ? 'bg-red-100 text-red-800' :
              prompt.style === 'urgent' ? 'bg-orange-100 text-orange-800' :
              prompt.style === 'seasonal' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {prompt.style}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FresnoPlumberMarketing;
