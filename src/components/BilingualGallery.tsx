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
  images?: GalleryImage[];
}

export default function BilingualGallery({ images = [] }: BilingualGalleryProps) {
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  
  // Mock gallery images - 5 EN + 5 ES ad cards
  const mockImages: GalleryImage[] = [
    // English Cards
    {
      id: '1',
      title: 'Plumbing Services',
      description: 'Emergency plumbing with 24/7 availability',
      image_url: '/gallery/plumbing-en.jpg',
      language: 'en',
      category: 'services',
      is_featured: true
    },
    {
      id: '2',
      title: 'HVAC Solutions',
      description: 'Heating and cooling specialists',
      image_url: '/gallery/hvac-en.jpg',
      language: 'en',
      category: 'services',
      is_featured: true
    },
    {
      id: '3',
      title: 'Moving Services',
      description: 'Professional moving and relocation',
      image_url: '/gallery/moving-en.jpg',
      language: 'en',
      category: 'services',
      is_featured: true
    },
    {
      id: '4',
      title: 'Cleaning Services',
      description: 'Residential and commercial cleaning',
      image_url: '/gallery/cleaning-en.jpg',
      language: 'en',
      category: 'services',
      is_featured: true
    },
    {
      id: '5',
      title: 'Landscaping',
      description: 'Professional lawn care and maintenance',
      image_url: '/gallery/landscaping-en.jpg',
      language: 'en',
      category: 'services',
      is_featured: true
    },
    // Spanish Cards
    {
      id: '6',
      title: 'Servicios de Plomería',
      description: 'Plomería de emergencia disponible 24/7',
      image_url: '/gallery/plumbing-es.jpg',
      language: 'es',
      category: 'services',
      is_featured: true
    },
    {
      id: '7',
      title: 'Soluciones HVAC',
      description: 'Especialistas en calefacción y refrigeración',
      image_url: '/gallery/hvac-es.jpg',
      language: 'es',
      category: 'services',
      is_featured: true
    },
    {
      id: '8',
      title: 'Servicios de Mudanza',
      description: 'Mudanzas y reubicación profesional',
      image_url: '/gallery/moving-es.jpg',
      language: 'es',
      category: 'services',
      is_featured: true
    },
    {
      id: '9',
      title: 'Servicios de Limpieza',
      description: 'Limpieza residencial y comercial',
      image_url: '/gallery/cleaning-es.jpg',
      language: 'es',
      category: 'services',
      is_featured: true
    },
    {
      id: '10',
      title: 'Jardinería',
      description: 'Cuidado profesional de césped y mantenimiento',
      image_url: '/gallery/landscaping-es.jpg',
      language: 'es',
      category: 'services',
      is_featured: true
    }
  ];

  const displayImages = images.length > 0 ? images : mockImages;
  const filteredImages = displayImages.filter(img => img.language === language);

  return (
    <section id="preview" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {language === 'en' ? 'See Your Ad Cards Live' : 'Ve Tus Tarjetas Publicitarias en Vivo'}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {language === 'en' 
              ? 'Professional ad cards that convert visitors into customers' 
              : 'Tarjetas publicitarias profesionales que convierten visitantes en clientes'
            }
          </p>
          
          {/* Language Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  language === 'en' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  language === 'es' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Español
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredImages.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                <img
                  src={image.image_url}
                  alt={image.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    // Fallback for missing images
                    e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
                      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                        <rect width="400" height="300" fill="#f3f4f6"/>
                        <text x="200" y="150" text-anchor="middle" fill="#6b7280" font-family="Arial" font-size="16">
                          ${image.title}
                        </text>
                      </svg>
                    `)}`;
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {image.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{image.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                    {image.language === 'en' ? 'English' : 'Español'}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    QR Ready
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <p className="text-lg text-gray-600 mb-6">
            {language === 'en' 
              ? 'Ready to get your own professional ad cards?' 
              : '¿Listo para obtener tus propias tarjetas publicitarias profesionales?'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={language === 'en' ? '#pricing' : '#pricing'}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {language === 'en' ? 'Get Started Now' : 'Comenzar Ahora'}
            </a>
            <a
              href="#contact"
              className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
            >
              {language === 'en' ? 'Contact Us' : 'Contáctanos'}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
