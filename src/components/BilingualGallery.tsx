'use client';

import React, { useState } from 'react';

interface GalleryImage {
  id: string;
  title: string;
  description: string;
  image_url: string;
  language: string;
  category: string;
  is_featured: boolean;
}

interface BilingualGalleryProps {
  className?: string;
}

export default function BilingualGallery({ className = '' }: BilingualGalleryProps) {
  const [language, setLanguage] = useState<'en' | 'es'>('en');

  // Bilingual gallery data
  const galleryImages: GalleryImage[] = [
    {
      id: '1',
      title: 'Plumbing Services',
      description: 'Professional plumbing QR code with emergency contact',
      image_url: '/gallery/plumbing-en.jpg',
      language: 'en',
      category: 'services',
      is_featured: true
    },
    {
      id: '2',
      title: 'Servicios de Plomería',
      description: 'Código QR profesional de plomería con contacto de emergencia',
      image_url: '/gallery/plumbing-es.jpg',
      language: 'es',
      category: 'services',
      is_featured: true
    },
    {
      id: '3',
      title: 'Construction Company',
      description: 'Professional construction QR code with project portfolio',
      image_url: '/gallery/construction-en.jpg',
      language: 'en',
      category: 'construction',
      is_featured: false
    },
    {
      id: '4',
      title: 'Empresa de Construcción',
      description: 'Código QR profesional de construcción con portafolio de proyectos',
      image_url: '/gallery/construction-es.jpg',
      language: 'es',
      category: 'construction',
      is_featured: false
    },
    {
      id: '5',
      title: 'HVAC Services',
      description: 'Professional HVAC QR code with service scheduling',
      image_url: '/gallery/hvac-en.jpg',
      language: 'en',
      category: 'services',
      is_featured: true
    },
    {
      id: '6',
      title: 'Servicios de HVAC',
      description: 'Código QR profesional de HVAC con programación de servicios',
      image_url: '/gallery/hvac-es.jpg',
      language: 'es',
      category: 'services',
      is_featured: true
    },
    {
      id: '7',
      title: 'Moving Services',
      description: 'Professional moving QR code with booking system',
      image_url: '/gallery/moving-en.jpg',
      language: 'en',
      category: 'services',
      is_featured: false
    },
    {
      id: '8',
      title: 'Servicios de Mudanza',
      description: 'Código QR profesional de mudanza con sistema de reservas',
      image_url: '/gallery/moving-es.jpg',
      language: 'es',
      category: 'services',
      is_featured: false
    }
  ];

  const filteredImages = galleryImages.filter(img => img.language === language);
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