'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

interface GalleryImage {
  id: string;
  title: string;
  description: string;
  image_url: string;
  language: string;
  category: string;
  is_featured: boolean;
}

interface SupabaseGalleryProps {
  className?: string;
}

export default function SupabaseGallery({ className = '' }: SupabaseGalleryProps) {
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [galleryData, setGalleryData] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    try {
      setLoading(true);
      
      // Fetch the demo preview from Supabase
      const { data, error } = await supabase
        .from('previews')
        .select('card_json')
        .eq('id', 'demo')
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .single();

      if (error) {
        console.warn('Supabase fetch error, using fallback data:', error);
        // Fallback to static data if Supabase fails
        setGalleryData(getFallbackData());
        return;
      }

      if (data && data.card_json) {
        // Convert Supabase data to gallery format
        const supabaseImages: GalleryImage[] = [];
        
        if (data.card_json.en) {
          Object.entries(data.card_json.en).forEach(([key, card]: [string, any]) => {
            supabaseImages.push({
              id: `supabase-en-${key}`,
              title: card.title || 'Professional Service',
              description: card.description || 'Professional QR code',
              image_url: card.image_url || `/gallery/en/card1.svg`,
              language: 'en',
              category: card.category || 'services',
              is_featured: card.is_featured || false
            });
          });
        }

        if (data.card_json.es) {
          Object.entries(data.card_json.es).forEach(([key, card]: [string, any]) => {
            supabaseImages.push({
              id: `supabase-es-${key}`,
              title: card.title || 'Servicio Profesional',
              description: card.description || 'Código QR profesional',
              image_url: card.image_url || `/gallery/es/card1.svg`,
              language: 'es',
              category: card.category || 'services',
              is_featured: card.is_featured || false
            });
          });
        }

        setGalleryData(supabaseImages);
      } else {
        // Fallback to static data
        setGalleryData(getFallbackData());
      }
    } catch (err) {
      console.error('Error fetching gallery data:', err);
      setError('Failed to load gallery data');
      setGalleryData(getFallbackData());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackData = (): GalleryImage[] => [
    {
      id: '1',
      title: 'Plumbing Services',
      description: 'Professional plumbing QR code with emergency contact',
      image_url: '/gallery/en/card1.svg',
      language: 'en',
      category: 'services',
      is_featured: true
    },
    {
      id: '2',
      title: 'Servicios de Plomería',
      description: 'Código QR profesional de plomería con contacto de emergencia',
      image_url: '/gallery/es/card1.svg',
      language: 'es',
      category: 'services',
      is_featured: true
    },
    {
      id: '3',
      title: 'Construction Company',
      description: 'Professional construction QR code with project portfolio',
      image_url: '/gallery/en/card2.svg',
      language: 'en',
      category: 'construction',
      is_featured: false
    },
    {
      id: '4',
      title: 'Empresa de Construcción',
      description: 'Código QR profesional de construcción con portafolio de proyectos',
      image_url: '/gallery/es/card2.svg',
      language: 'es',
      category: 'construction',
      is_featured: false
    }
  ];

  const filteredImages = galleryData.filter(img => img.language === language);
  const featuredImages = filteredImages.filter(img => img.is_featured);

  const translations = {
    en: {
      title: 'Professional Ad Gallery',
      subtitle: 'See how our QR codes work for real businesses',
      languageToggle: 'Español',
      featured: 'Featured',
      category: 'Category',
      viewAll: 'View All Examples'
    },
    es: {
      title: 'Galería Profesional de Anuncios',
      subtitle: 'Ve cómo funcionan nuestros códigos QR para negocios reales',
      languageToggle: 'English',
      featured: 'Destacado',
      category: 'Categoría',
      viewAll: 'Ver Todos los Ejemplos'
    }
  };

  const t = translations[language];

  if (loading) {
    return (
      <section id="preview" className={`py-16 bg-gray-50 ${className}`}>
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="preview" className={`py-16 bg-gray-50 ${className}`}>
        <div className="container mx-auto px-4 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
            <h3 className="text-red-800 font-semibold mb-2">Error Loading Gallery</h3>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchGalleryData}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="preview" className={`py-16 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Header with Language Toggle */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-4 mb-6">
            <h2 className="text-4xl font-bold text-gray-900">
              {t.title}
            </h2>
            <button
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {t.languageToggle}
            </button>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Featured Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredImages.map((image) => (
            <div 
              key={image.id} 
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <img 
                  src={image.image_url} 
                  alt={image.title}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image doesn't exist
                    e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
                      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100%" height="100%" fill="#f3f4f6"/>
                        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6b7280" font-family="Arial, sans-serif" font-size="16">
                          ${image.title}
                        </text>
                      </svg>
                    `)}`;
                  }}
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    {image.category}
                  </span>
                  {image.is_featured && (
                    <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
                      {t.featured}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">
                  {image.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {image.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <a 
            href="#pricing"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {t.viewAll}
          </a>
        </div>
      </div>
    </section>
  );
}
