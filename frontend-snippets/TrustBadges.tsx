'use client';
import React from 'react';

export default function TrustBadges() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Trusted by 500+ Businesses
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">500+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">24h</div>
            <div className="text-gray-600">Delivery Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">99.9%</div>
            <div className="text-gray-600">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">4.9★</div>
            <div className="text-gray-600">Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
}
