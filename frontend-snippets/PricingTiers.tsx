'use client';
import React from 'react';
import pricingData from '../data/official_pricing.json';

export default function PricingTiers() {
  const tiers = Object.values(pricingData.tiers);
  
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600">
            Start with our Starter plan and scale as you grow
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tiers.map((tier, index) => (
            <div 
              key={tier.name}
              className={`p-8 rounded-lg border-2 ${
                index === 1 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              {index === 1 && (
                <div className="bg-blue-500 text-white text-center py-2 rounded-full text-sm font-semibold mb-4">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {tier.name}
              </h3>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-800">
                  ${tier.price}
                </span>
                <span className="text-gray-600">/month</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <a
                href={`https://buy.stripe.com/${tier.stripe_product_id}`}
                className={`w-full block text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                  index === 1 
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-800 text-white hover:bg-gray-900'
                }`}
              >
                Get Started
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
