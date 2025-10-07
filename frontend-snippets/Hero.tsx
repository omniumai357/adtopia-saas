'use client';
import React from 'react';
import { APP_CONFIG } from '../src/config/appConfig';

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-6">
          AI-Powered QR Codes for Your Business
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Generate professional QR codes in 24 hours. Boost your marketing with AI-driven designs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href={APP_CONFIG.PRICING.STARTER.stripeLink}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            {APP_CONFIG.PRICING.STARTER.name} - {APP_CONFIG.PRICING.STARTER.priceDisplay}
          </a>
          <a 
            href={APP_CONFIG.PRICING.ULTIMATE.stripeLink}
            className="bg-green-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors"
          >
            {APP_CONFIG.PRICING.ULTIMATE.name} - {APP_CONFIG.PRICING.ULTIMATE.priceDisplay}
          </a>
          <a 
            href="#pricing"
            className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
          >
            View All Plans
          </a>
        </div>
      </div>
    </section>
  );
}
