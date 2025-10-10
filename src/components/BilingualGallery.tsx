'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { trackGammaCardView, trackGammaCardClick, trackGammaCardZoom, GammaCardData } from '../lib/gamma-analytics';

interface GalleryImage {
  id: string;
  title: string;
  description: string;
  image_url: string;
  language: string;
  category: string;
  is_featured: boolean;
  niche: string;
  cta_type: string;
  fomo_score: number;
  utm_campaign: string;
  is_placeholder: boolean;
}

interface BilingualGalleryProps {
  className?: string;
}

export default function BilingualGallery({ className = '' }: BilingualGalleryProps) {
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPlaceholders, setShowPlaceholders] = useState(true);

  // Fetch gallery images from Supabase
  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        setIsLoading(true);
        
        // Fetch from gamma_gallery table (public active previews)
        const { data: images, error } = await supabase
          .from('gamma_gallery')
          .select('*')
          .eq('language', language)
          .eq('status', 'active')
          .gt('expires_at', new Date().toISOString())
          .order('fomo_score', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Error fetching gallery images:', error);
          setError('Failed to load gallery images');
          return;
        }

        // Transform data and get public URLs
        const transformedImages = images.map(img => ({
          id: img.id,
          title: img.title,
          description: img.description,
          image_url: supabase.storage
            .from('gamma-cards')
            .getPublicUrl(img.storage_path).data.publicUrl,
          language: img.language,
          category: img.niche,
          is_featured: img.is_featured,
          niche: img.niche,
          cta_type: img.cta_type,
          fomo_score: img.fomo_score,
          utm_campaign: img.utm_campaign,
          is_placeholder: img.is_placeholder
        }));

        setGalleryImages(transformedImages);
        setError(null);
      } catch (err) {
        console.error('Error in fetchGalleryImages:', err);
        setError('Failed to load gallery images');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGalleryImages();
  }, [language, showPlaceholders]);

  // Filter images based on placeholder toggle
  const filteredImages = galleryImages.filter(img => 
    showPlaceholders ? img.is_placeholder : !img.is_placeholder
  );
  const featuredImages = filteredImages.filter(img => img.is_featured);

  // Track card interactions
  const handleCardView = (card: GalleryImage) => {
    const cardData: GammaCardData = {
      id: card.id,
      title: card.title,
      niche: card.niche,
      cta_type: card.cta_type,
      utm_campaign: card.utm_campaign,
      fomo_score: card.fomo_score
    };
    trackGammaCardView(cardData);
  };

  const handleCardClick = (card: GalleryImage) => {
    const cardData: GammaCardData = {
      id: card.id,
      title: card.title,
      niche: card.niche,
      cta_type: card.cta_type,
      utm_campaign: card.utm_campaign,
      fomo_score: card.fomo_score
    };
    trackGammaCardClick(cardData);
  };

  const handleCardZoom = (card: GalleryImage) => {
    const cardData: GammaCardData = {
      id: card.id,
      title: card.title,
      niche: card.niche,
      cta_type: card.cta_type,
      utm_campaign: card.utm_campaign,
      fomo_score: card.fomo_score
    };
    trackGammaCardZoom(cardData);
  };

  const translations = {
    en: {
      title: 'Professional Ad Gallery',
      subtitle: 'See how our QR codes work for real businesses',
      languageToggle: 'Español',
      featured: 'Featured',
      category: 'Category',
      viewAll: 'View All Examples',
      testGallery: 'Test Gallery',
      productionGallery: 'Production Gallery',
      loading: 'Loading gallery...',
      error: 'Failed to load gallery images'
    },
    es: {
      title: 'Galería Profesional de Anuncios',
      subtitle: 'Ve cómo funcionan nuestros códigos QR para negocios reales',
      languageToggle: 'English',
      featured: 'Destacado',
      category: 'Categoría',
      viewAll: 'Ver Todos los Ejemplos',
      testGallery: 'Galería de Prueba',
      productionGallery: 'Galería de Producción',
      loading: 'Cargando galería...',
      error: 'Error al cargar las imágenes de la galería'
    }
  };

  const t = translations[language];

  // Loading state
  if (isLoading) {
    return (
      <section id="preview" className={`py-16 bg-gray-50 ${className}`}>
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section id="preview" className={`py-16 bg-gray-50 ${className}`}>
        <div className="container mx-auto px-4 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600">{t.error}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="preview" className={`py-16 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Header with Language Toggle and Gallery Mode */}
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
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            {t.subtitle}
          </p>
          
          {/* Gallery Mode Toggle */}
          <div className="flex justify-center items-center gap-4">
            <span className="text-sm text-gray-600">Gallery Mode:</span>
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setShowPlaceholders(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  showPlaceholders 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t.testGallery}
              </button>
              <button
                onClick={() => setShowPlaceholders(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  !showPlaceholders 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t.productionGallery}
              </button>
            </div>
          </div>
        </div>

        {/* Featured Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredImages.map((image) => {
            // Track card view on mount
            React.useEffect(() => {
              handleCardView(image);
            }, [image.id]);

            return (
              <div 
                key={image.id} 
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => handleCardClick(image)}
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative group">
                  <img 
                    src={image.image_url} 
                    alt={image.title}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
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
                  {/* Zoom overlay */}
                  <div 
                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardZoom(image);
                    }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                      image.cta_type === 'urgency' 
                        ? 'bg-red-100 text-red-800' 
                        : image.cta_type === 'trust'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {image.category}
                    </span>
                    <div className="flex items-center gap-2">
                      {image.is_featured && (
                        <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
                          {t.featured}
                        </span>
                      )}
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        FOMO: {image.fomo_score}/10
                      </span>
                    </div>
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">
                    {image.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    {image.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {image.is_placeholder ? 'Test Card' : 'Production Card'}
                    </span>
                    <a 
                      href={`#pricing?utm_source=gallery&utm_campaign=${image.utm_campaign}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Get Started →
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
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