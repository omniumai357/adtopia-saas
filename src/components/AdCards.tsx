'use client';

import React, { useState, useEffect } from 'react';

interface AdCard {
  id: string;
  title: string;
  description: string;
  image_url: string;
  language: string;
  category: string;
  is_featured: boolean;
}

interface AdCardsProps {
  language?: 'en' | 'es';
  onCardSelect?: (card: AdCard) => void;
}

export default function AdCards({ language = 'en', onCardSelect }: AdCardsProps) {
  const [cards, setCards] = useState<AdCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Demo cards data
  const demoCards: AdCard[] = [
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
    },
    {
      id: '3',
      title: 'Construction Company',
      description: 'Professional construction QR code',
      image_url: '/gallery/construction-en.jpg',
      language: 'en',
      category: 'construction',
      is_featured: false
    },
    {
      id: '4',
      title: 'Empresa de Construcción',
      description: 'Código QR profesional de construcción',
      image_url: '/gallery/construction-es.jpg',
      language: 'es',
      category: 'construction',
      is_featured: false
    }
  ];

  useEffect(() => {
    console.log("AdCards component initializing...");
    
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        console.log("Server-side rendering, skipping localStorage");
        setCards(demoCards.filter(card => card.language === language));
        setLoading(false);
        return;
      }

      console.log("Loading cards from localStorage...");
      
      // Try to load from localStorage
      const storedCards = localStorage.getItem('ad_mvp.cards.v1');
      
      if (storedCards) {
        try {
          const parsedCards = JSON.parse(storedCards);
          console.log("Loaded cards from localStorage:", parsedCards.length);
          setCards(parsedCards.filter((card: AdCard) => card.language === language));
        } catch (parseError) {
          console.warn("Failed to parse stored cards, using demo data");
          setCards(demoCards.filter(card => card.language === language));
        }
      } else {
        console.log("No stored cards found, using demo data");
        setCards(demoCards.filter(card => card.language === language));
        
        // Store demo cards for future use
        try {
          localStorage.setItem('ad_mvp.cards.v1', JSON.stringify(demoCards));
          console.log("Demo cards stored in localStorage");
        } catch (storageError) {
          console.warn("Failed to store demo cards:", storageError);
        }
      }
      
      console.log("Demo cards loaded successfully");
      setLoading(false);
      
    } catch (error) {
      console.error("Error initializing AdCards:", error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setCards(demoCards.filter(card => card.language === language));
      setLoading(false);
    }
  }, [language]);

  // Update cards when language changes
  useEffect(() => {
    if (cards.length > 0) {
      const filteredCards = cards.filter(card => card.language === language);
      setCards(filteredCards);
    }
  }, [language]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ad cards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading Cards</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {language === 'en' ? 'Ad Gallery' : 'Galería de Anuncios'}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {language === 'en' 
            ? 'Browse our collection of professional QR code designs' 
            : 'Explora nuestra colección de diseños profesionales de códigos QR'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div 
            key={card.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onCardSelect?.(card)}
          >
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              <img 
                src={card.image_url} 
                alt={card.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  // Fallback image if the image fails to load
                  e.currentTarget.src = '/placeholder-card.jpg';
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {card.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                {card.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {card.category}
                </span>
                {card.is_featured && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Featured
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {language === 'en' 
              ? 'No cards available for this language' 
              : 'No hay tarjetas disponibles para este idioma'
            }
          </p>
        </div>
      )}
    </div>
  );
}
