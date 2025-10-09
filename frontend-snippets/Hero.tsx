'use client';
import React from 'react';
import { APP_CONFIG } from '../src/config/appConfig';

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Launch Your Business Online in 7 Days
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Professional QR codes that turn visitors into customers. $297 vs $780+ value - limited time offer.
        </p>
        
        {/* Only 2 Primary CTAs as requested */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <a 
            href="#preview"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            See Your Ad Live
          </a>
          <a 
            href="#email-capture"
            className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
          >
            Hold 30 Days
          </a>
        </div>

        {/* Trust Elements */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm opacity-90">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>24-hour delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>Money-back guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>SSL secured</span>
          </div>
        </div>
      </div>
    </section>
  );
}
