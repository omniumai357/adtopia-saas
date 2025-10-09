'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { STRIPE_LINKS } from 'src/config/stripeConfig';
import { APP_CONFIG } from 'src/config/appConfig';
import Hero from '../frontend-snippets/Hero';
import Countdown from '../frontend-snippets/Countdown';
import TrustBadges from '../frontend-snippets/TrustBadges';
import PricingTiers from '../frontend-snippets/PricingTiers';
import LandingLayout from '../src/components/LandingLayout';
import AdCards from '../src/components/AdCards';
import BilingualGallery from '../src/components/BilingualGallery';

// Error Boundary Component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
    // Log to monitoring service
    if (typeof window !== 'undefined') {
      window.onerror = (e) => console.error("SPA Crash", e);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-6">We're working to fix this issue. Please try refreshing the page.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface GalleryImage {
  id: string;
  title: string;
  description: string;
  image_url: string;
  language: string;
  category: string;
  is_featured: boolean;
}

interface HomeProps {
  galleryImages?: GalleryImage[];
}

export default function Home() {
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    // Simulate loading and error handling
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Global error handler
    const handleError = (error) => {
      console.error('Global error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);
  
  const t = {
    en: {
      title: "AdTopia - AI-Powered Ad Cards",
      subtitle: "Launch Your Business Online in 7 Days",
      cta: "See Your Ad Live",
      preview: `Preview - ${APP_CONFIG.PRICING.STARTER.priceDisplay}`,
      full: `Full Package - ${APP_CONFIG.PRICING.ULTIMATE.priceDisplay}`,
      guarantee: "24-hour delivery or full refund",
      features: [
        "Professional QR Code Generation",
        "Bilingual Support (English/Spanish)",
        "Custom Design Options",
        "Analytics Dashboard",
        "24/7 Support"
      ]
    },
    es: {
      title: "AdTopia - Tarjetas Publicitarias con IA",
      subtitle: "Lanza Tu Negocio Online en 7 Días",
      cta: "Ve Tu Anuncio en Vivo",
      preview: `Vista Previa - ${APP_CONFIG.PRICING.STARTER.priceDisplay}`,
      full: `Paquete Completo - ${APP_CONFIG.PRICING.ULTIMATE.priceDisplay}`,
      guarantee: "Entrega en 24 horas o reembolso completo",
      features: [
        "Generación Profesional de Códigos QR",
        "Soporte Bilingüe (Inglés/Español)",
        "Opciones de Diseño Personalizado",
        "Panel de Análisis",
        "Soporte 24/7"
      ]
    }
  };

  const currentT = t[language];
  const filteredImages = galleryImages.filter(img => img.language === language);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AdTopia...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-6">We're working to fix this issue. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Head>
        <title>{currentT.title}</title>
        <meta name="description" content={currentT.subtitle} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {/* SSR Fallback - Ensure content is visible even with JS disabled */}
        <noscript>
          <style>{`
            .js-only { display: none !important; }
            .no-js-fallback { display: block !important; }
          `}</style>
        </noscript>
      </Head>

      <LandingLayout brand="adtopia">
        <Hero />
        <BilingualGallery />
        <Countdown deadline="2025-11-01T00:00:00Z" />
        <TrustBadges />
        <PricingTiers />
        <AdCards language={language} />
        
        {/* SSR Fallback Content - Visible when JS is disabled */}
        <noscript>
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                JavaScript Required
              </h2>
              <p className="text-gray-600 mb-6">
                This application requires JavaScript to function properly. Please enable JavaScript in your browser.
              </p>
              <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
                <h3 className="text-xl font-semibold mb-4">Quick Preview</h3>
                <p className="text-gray-600 mb-4">
                  Professional QR code generation for your business. 
                  See your ad live with our preview system.
                </p>
                <a 
                  href="#preview" 
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  See Your Ad Live
                </a>
              </div>
            </div>
          </section>
        </noscript>
      </LandingLayout>
    </ErrorBoundary>
  );
}

// Mock gallery images for now - moved to component level for App Router
const galleryImages = [
  {
    id: '1',
    title: 'Plumbing Services',
    description: 'Professional plumbing QR code',
    image_url: '/gallery/plumbing-en.jpg',
    language: 'en',
    category: 'services',
    is_featured: true
  },
  {
    id: '2',
    title: 'Servicios de Plomería',
    description: 'Código QR profesional de plomería',
    image_url: '/gallery/plumbing-es.jpg',
    language: 'es',
    category: 'services',
    is_featured: true
  }
];
