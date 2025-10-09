import React from 'react';
import Head from 'next/head';
import { STRIPE_LINKS } from '../../src/config/stripeConfig';
import BilingualGallery from '../../src/components/BilingualGallery';

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

export default function Home({ galleryImages = [] }: HomeProps) {
  const [language, setLanguage] = React.useState<'en' | 'es'>('en');
  
  const t = {
    en: {
      title: "AdTopia - AI-Powered Ad Cards",
      subtitle: "Generate professional QR codes for your business in 24 hours",
      cta: "Get Your QR Code",
      preview: "Preview - $29",
      full: "Full Package - $297",
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
      subtitle: "Genera códigos QR profesionales para tu negocio en 24 horas",
      cta: "Obtén Tu Código QR",
      preview: "Vista Previa - $29",
      full: "Paquete Completo - $297",
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

  return (
    <>
      <Head>
        <title>{currentT.title}</title>
        <meta name="description" content={currentT.subtitle} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">AdTopia</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded ${language === 'en' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('es')}
                  className={`px-3 py-1 rounded ${language === 'es' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
                >
                  ES
                </button>
                <a
                  href="/admin"
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Admin
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {currentT.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {currentT.subtitle}
            </p>
            
            {/* Simplified CTA Buttons - Only 2 Primary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href="#preview"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {currentT.cta}
              </a>
              <a
                href="#pricing"
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
              >
                {language === 'en' ? 'View Pricing' : 'Ver Precios'}
              </a>
            </div>

            {/* Secondary CTA for Email Capture */}
            <div className="mb-8">
              <a
                href="#email-capture"
                className="text-blue-600 underline hover:text-blue-800 transition-colors"
              >
                {language === 'en' ? 'Hold 30 Days (Free) - No commitment' : 'Reservar 30 Días (Gratis) - Sin compromiso'}
              </a>
            </div>

            <p className="text-lg text-gray-500 mb-16">
              {currentT.guarantee}
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              {language === 'en' ? 'Why Choose AdTopia?' : '¿Por qué elegir AdTopia?'}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentT.features.map((feature, index) => (
                <div key={index} className="text-center p-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✓</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bilingual Gallery Section - Embedded for immediate visibility */}
        <BilingualGallery />

        {/* Pricing Section - Made visible on load */}
        <section id="pricing" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {language === 'en' ? 'Choose Your Package' : 'Elige Tu Paquete'}
              </h2>
              <p className="text-lg text-gray-600">
                {language === 'en' 
                  ? 'Professional QR codes that convert visitors into customers' 
                  : 'Códigos QR profesionales que convierten visitantes en clientes'
                }
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Starter Package */}
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Starter</h3>
                <div className="text-3xl font-bold text-blue-600 mb-4">$29</div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    QR Code Generation
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    7-day Live Preview
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    Mobile Responsive
                  </li>
                </ul>
                <a
                  href={STRIPE_LINKS.PREVIEW}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-center block hover:bg-blue-700 transition-colors"
                >
                  {language === 'en' ? 'Get Started' : 'Comenzar'}
                </a>
              </div>

              {/* Basic Package */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-500 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {language === 'en' ? 'Most Popular' : 'Más Popular'}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Basic</h3>
                <div className="text-3xl font-bold text-blue-600 mb-4">$79</div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    Everything in Starter
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    30-day Extended Preview
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    Domain + SSL Setup
                  </li>
                </ul>
                <a
                  href={STRIPE_LINKS.FULL_PACKAGE}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-center block hover:bg-blue-700 transition-colors"
                >
                  {language === 'en' ? 'Get Started' : 'Comenzar'}
                </a>
              </div>

              {/* Pro Package */}
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Pro</h3>
                <div className="text-3xl font-bold text-blue-600 mb-4">$149</div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    Everything in Basic
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    Dual-language Support
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    Phone Support
                  </li>
                </ul>
                <a
                  href="#contact"
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg text-center block hover:bg-gray-700 transition-colors"
                >
                  {language === 'en' ? 'Contact Sales' : 'Contactar Ventas'}
                </a>
              </div>

              {/* Ultimate Package */}
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ultimate</h3>
                <div className="text-3xl font-bold text-blue-600 mb-4">$297</div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    5 Custom SEO Ad Cards
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    12 Months Hosting
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    Free Domain + SSL
                  </li>
                </ul>
                <a
                  href="#contact"
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg text-center block hover:bg-gray-700 transition-colors"
                >
                  {language === 'en' ? 'Contact Sales' : 'Contactar Ventas'}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-2xl font-bold mb-4">AdTopia</h3>
            <p className="text-gray-400 mb-4">
              {language === 'en' 
                ? 'Professional QR codes for your business' 
                : 'Códigos QR profesionales para tu negocio'
              }
            </p>
            <p className="text-gray-500">
              {language === 'en' ? 'Support:' : 'Soporte:'} beta@bizbox.host
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}

export async function getServerSideProps() {
  // Mock gallery images for now
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

  return {
    props: {
      galleryImages
    }
  };
}
