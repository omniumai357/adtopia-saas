/**
 * Enhanced D2 Value Landing System
 * Based on breakthrough results: +22% dwell time with gallery enlargers
 */

export interface ValueLandingConfig {
  businessName: string;
  location: string;
  yearsExperience: number;
  basePrice: string;
  services: string[];
  faqs: Array<{ question: string; answer: string }>;
  galleryImages: string[];
  contactInfo: {
    phone: string;
    website: string;
    email?: string;
  };
}

export interface ValueLandingSlide {
  id: number;
  title: string;
  keyElement: string;
  textHooks: string[];
  visualInteractive: string;
  conversionGuess: number;
  seoKeywords: string[];
}

/**
 * D2 Value Landing Slides (5-Slide Flow)
 */
export const D2_VALUE_SLIDES: ValueLandingSlide[] = [
  {
    id: 1,
    title: 'Hero Quote Form',
    keyElement: 'Quote Form',
    textHooks: [
      'Stress-Free Plumbing – Free Quote in 60s!',
      '$89 starts, 20 yrs trusted',
      'Request Free Quote'
    ],
    visualInteractive: 'Form fields (name/phone/desc); Button: "Request Free Quote"',
    conversionGuess: 25,
    seoKeywords: ['free quote', 'stress-free', '60 seconds', 'trusted']
  },
  {
    id: 2,
    title: 'Services Why Us Grid',
    keyElement: 'Why Us Grid',
    textHooks: [
      '24/7 Emergencies',
      'Eco-Friendly Parts',
      'Drain & Leak Pros',
      'Transparent $89',
      '20 Yrs Fresno'
    ],
    visualInteractive: 'Icons with bullet benefits',
    conversionGuess: 15,
    seoKeywords: ['24/7', 'emergencies', 'eco-friendly', 'transparent pricing']
  },
  {
    id: 3,
    title: 'Gallery Work Showcase',
    keyElement: 'Work Showcase',
    textHooks: [
      'Fresno Clog-Free in 1hr',
      'Before & After Gallery',
      'Click to Enlarge'
    ],
    visualInteractive: '12-image carousel with clickable enlargers',
    conversionGuess: 22,
    seoKeywords: ['before after', 'gallery', 'clog-free', '1 hour']
  },
  {
    id: 4,
    title: 'FAQs Q&A Stack',
    keyElement: 'Q&A Stack',
    textHooks: [
      'Weekend Rates? Same rates.',
      'Same-day? <2hrs.',
      '$89? Diag basic.',
      'Warranty? 1yr.',
      'Licensed? Yes.'
    ],
    visualInteractive: 'Static list with SEO questions',
    conversionGuess: 12,
    seoKeywords: ['weekend rates', 'same-day', 'warranty', 'licensed']
  },
  {
    id: 5,
    title: 'CTA Book Footer',
    keyElement: 'Book Footer',
    textHooks: [
      'Book Now – Get Quote 60s',
      '20yrs Licensed Same-Day',
      'Call Now'
    ],
    visualInteractive: 'Tel link + Online booking + Badges',
    conversionGuess: 20,
    seoKeywords: ['book now', 'get quote', 'call now', 'licensed']
  }
];

/**
 * Generate D2 Value Landing Prompt for Gamma AI
 */
export function generateD2ValuePrompt(config: ValueLandingConfig): string {
  const { businessName, location, yearsExperience, basePrice, services, faqs, galleryImages, contactInfo } = config;
  
  const servicesText = services.join(', ');
  const faqsText = faqs.map(faq => `- **${faq.question}?** ${faq.answer}`).join('\n');
  const galleryText = galleryImages.length > 0 
    ? `Upload/integrate ${galleryImages.length} real-job images [${galleryImages.join(', ')}—Slide 3: Clickable gallery enlarger w/ captions '${location} Fix in 1hr']`
    : 'Upload/integrate 12 real-job images [faucet fixes, pipe snakes—Slide 3: Clickable gallery enlarger w/ captions]';
  
  return `Build 5-slide Gamma deck for ${businessName} ${location} (${servicesText}, transparent ${basePrice} starts, ${yearsExperience} yrs trusted). 
Light bg, green #10B981 accents. ${galleryText}. 
Slide 1: Hero 'Stress-Free ${servicesText} – Free Quote 60s!' w/ form (name/phone/desc). 
Slide 2: Why Us? ('${services[0]}', '${services[1]}'). 
Slide 3: Gallery (before/after zooms). 
Slide 4: FAQs (${faqsText}). 
Slide 5: CTA 'Book Now' to call ${contactInfo.phone}/site ${contactInfo.website}. 
Hosted URL, PDF export. Mobile <2s load, meta "${location} Plumbing Experts | Drain Leak Fixes | Free Quotes"—top SERP bait.`;
}

/**
 * Enhanced Gallery Configuration
 */
export interface GalleryImageConfig {
  id: string;
  title: string;
  description: string;
  beforeAfter: 'before' | 'after' | 'process';
  serviceType: string;
  location: string;
  timeToComplete: string;
  customerTestimonial?: string;
}

/**
 * Generate 12-Image Gallery for D2 Value Landing
 */
export function generateD2GalleryImages(location: string, serviceType: string): GalleryImageConfig[] {
  const baseImages = [
    { title: 'Clogged Drain', description: 'Severe kitchen sink blockage', timeToComplete: '45 minutes' },
    { title: 'Clear Drain', description: 'Fully cleared and flowing', timeToComplete: '45 minutes' },
    { title: 'Leaky Faucet', description: 'Dripping kitchen faucet', timeToComplete: '30 minutes' },
    { title: 'Fixed Faucet', description: 'No more drips, perfect flow', timeToComplete: '30 minutes' },
    { title: 'Burst Pipe', description: 'Emergency pipe burst', timeToComplete: '2 hours' },
    { title: 'Pipe Repaired', description: 'Professional pipe replacement', timeToComplete: '2 hours' },
    { title: 'Toilet Backup', description: 'Severe toilet blockage', timeToComplete: '1 hour' },
    { title: 'Toilet Fixed', description: 'Flushing perfectly', timeToComplete: '1 hour' },
    { title: 'Water Heater', description: 'Old water heater issues', timeToComplete: '3 hours' },
    { title: 'New Heater', description: 'Energy-efficient replacement', timeToComplete: '3 hours' },
    { title: 'Sewer Line', description: 'Main sewer line blockage', timeToComplete: '4 hours' },
    { title: 'Sewer Clear', description: 'Main line fully cleared', timeToComplete: '4 hours' }
  ];

  return baseImages.map((img, index) => ({
    id: `gallery_${index + 1}`,
    title: img.title,
    description: `${img.description} in ${location}`,
    beforeAfter: index % 2 === 0 ? 'before' : 'after',
    serviceType,
    location,
    timeToComplete: img.timeToComplete,
    customerTestimonial: index % 3 === 0 ? `"Fixed in ${img.timeToComplete} - amazing service!"` : undefined
  }));
}

/**
 * D2 Value Landing Performance Metrics
 */
export interface ValueLandingPerformance {
  slideId: number;
  slideName: string;
  impressions: number;
  interactions: number;
  dwellTime: number;
  conversionRate: number;
  expectedUplift: number;
}

/**
 * Track D2 Value Landing Performance
 */
export async function trackValueLandingPerformance(
  slideId: number,
  eventType: 'view' | 'interaction' | 'form_submit' | 'call_click',
  metadata?: Record<string, any>
): Promise<void> {
  try {
    console.log(`[D2 Value] Tracked ${eventType} for slide ${slideId}`, metadata);
    
    // In production, this would call your Supabase tracking function
    // await supabase.functions.invoke('track_ab_conversion', {
    //   body: {
    //     variant: `d2_value_slide_${slideId}`,
    //     event_type: eventType,
    //     metadata: {
    //       ...metadata,
    //       landing_type: 'd2_value',
    //       timestamp: new Date().toISOString()
    //     }
    //   }
    // });
  } catch (error) {
    console.error('Failed to track value landing performance:', error);
  }
}

/**
 * Enhanced Plumber Value Landing Configurations
 */
export const PLUMBER_VALUE_CONFIGS: ValueLandingConfig[] = [
  {
    businessName: 'CoolFix Plumbing',
    location: 'Fresno',
    yearsExperience: 20,
    basePrice: '$89',
    services: ['24/7 Emergencies', 'Eco-Friendly Parts', 'Drain & Leak Pros'],
    faqs: [
      { question: 'Weekend Rates', answer: 'Same rates' },
      { question: 'Same-day Service', answer: '<2hrs' },
      { question: '$89 Includes', answer: 'Diag basic' },
      { question: 'Warranty', answer: '1yr' },
      { question: 'Licensed', answer: 'Yes' }
    ],
    galleryImages: generateD2GalleryImages('Fresno', 'plumbing').map(img => img.title),
    contactInfo: {
      phone: '559-123-4567',
      website: 'coolfixfresno.com',
      email: 'info@coolfixfresno.com'
    }
  }
];

/**
 * D2 Value Landing SEO Optimization
 */
export const D2_SEO_OPTIMIZATION = {
  metaTitle: 'Fresno Plumbing Experts | Drain Leak Fixes | Free Quotes',
  metaDescription: 'Professional plumbing services in Fresno. 24/7 emergencies, eco-friendly parts, transparent pricing. Free quotes in 60 seconds. Licensed & insured.',
  keywords: [
    'Fresno plumbing',
    'drain cleaning',
    'emergency plumber',
    'leak repair',
    '24/7 plumbing',
    'eco-friendly plumbing',
    'licensed plumber',
    'free quotes'
  ],
  structuredData: {
    '@type': 'LocalBusiness',
    'name': 'CoolFix Plumbing',
    'address': 'Fresno, CA',
    'telephone': '559-123-4567',
    'priceRange': '$89+',
    'openingHours': 'Mo-Su 00:00-23:59'
  }
};
