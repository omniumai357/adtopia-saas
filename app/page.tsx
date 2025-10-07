'use client';

import React, { useState } from 'react';
import Head from 'next/head';
import { STRIPE_LINKS } from 'src/config/stripeConfig';
import { APP_CONFIG } from 'src/config/appConfig';
import Hero from '../frontend-snippets/Hero';
import Countdown from '../frontend-snippets/Countdown';
import TrustBadges from '../frontend-snippets/TrustBadges';
import PricingTiers from '../frontend-snippets/PricingTiers';
import LandingLayout from '../src/components/LandingLayout';

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
  
  const t = {
    en: {
      title: "AdTopia - AI-Powered Ad Cards",
      subtitle: "Generate professional QR codes for your business in 24 hours",
      cta: "Get Your QR Code",
      preview: `Preview - ${APP_CONFIG.PRICING.STARTER.priceDisplay}`,
      full: `Full Package - ${APP_CONFIG.PRICING.BASIC.priceDisplay}`,
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
      preview: `Vista Previa - ${APP_CONFIG.PRICING.STARTER.priceDisplay}`,
      full: `Paquete Completo - ${APP_CONFIG.PRICING.BASIC.priceDisplay}`,
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

      <LandingLayout brand="adtopia">
        <Hero />
        <Countdown deadline="2025-11-01T00:00:00Z" />
        <TrustBadges />
        <PricingTiers />
      </LandingLayout>
    </>
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
