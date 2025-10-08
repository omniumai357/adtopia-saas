/**
 * Enhanced C1 Urgency Card System
 * Based on breakthrough results: +28% reply spike, FOMO flooding inboxes hour-one
 */

export interface UrgencyCardConfig {
  businessName: string;
  location: string;
  service: string;
  phone: string;
  features: string[];
  emergencyResponse: string;
  seniorDiscount: number;
  waterMotifs: boolean;
}

export interface UrgencyCardVariant {
  id: string;
  name: string;
  description: string;
  visualTheme: string;
  ctaColor: string;
  fomoHook: string;
  targetMetric: string;
  expectedUplift: number;
}

/**
 * C1 Urgency Card Variants (Orange Blaze System)
 */
export const C1_URGENCY_VARIANTS: UrgencyCardVariant[] = [
  {
    id: 'c1_drain_coil_fade',
    name: 'Drain Coil Fade - Clog Chaos',
    description: 'Drain coil fade screams "clog chaos" with emergency response urgency',
    visualTheme: 'Drain coil fade background with clog chaos overlay',
    ctaColor: '#F97316', // Orange blaze
    fomoHook: 'Slots Open NOW!',
    targetMetric: 'Emergency calls',
    expectedUplift: 28
  },
  {
    id: 'c1_wrench_drop_fix',
    name: 'Wrench Drop - Fix Tease',
    description: 'Wrench-drop teases the fix with professional tool imagery',
    visualTheme: 'Wrench drop action shot with fix promise overlay',
    ctaColor: '#F97316',
    fomoHook: 'Fix in 1hr - Limited Slots!',
    targetMetric: 'Same-day bookings',
    expectedUplift: 25
  },
  {
    id: 'c1_pipe_elbow_panic',
    name: 'Pipe Elbow - Mid-Plumb Panic',
    description: 'Pipe elbow for that mid-plumb panic with urgency overlay',
    visualTheme: 'Pipe elbow close-up with panic-inducing water flow',
    ctaColor: '#F97316',
    fomoHook: 'Emergency Response <30min!',
    targetMetric: 'Emergency response time',
    expectedUplift: 30
  },
  {
    id: 'c1_toolbelt_stack_pro',
    name: 'Toolbelt Stack - Pro Vibes',
    description: 'Toolbelt stack for professional credibility and trust',
    visualTheme: 'Professional toolbelt with licensed/insured badges',
    ctaColor: '#F97316',
    fomoHook: 'Licensed Pros - Book Today!',
    targetMetric: 'Professional credibility',
    expectedUplift: 22
  },
  {
    id: 'c1_showerhead_drip_dread',
    name: 'Showerhead Drip - Everyday Dread',
    description: 'Showerhead drip for everyday plumbing dread and urgency',
    visualTheme: 'Showerhead drip with water damage implications',
    ctaColor: '#F97316',
    fomoHook: 'Stop the Drip - Call Now!',
    targetMetric: 'Preventive maintenance',
    expectedUplift: 20
  }
];

/**
 * Generate C1 Urgency Card Prompt for Gamma AI
 */
export function generateC1UrgencyPrompt(config: UrgencyCardConfig, variant: UrgencyCardVariant): string {
  const { businessName, location, service, phone, features, emergencyResponse, seniorDiscount, waterMotifs } = config;
  
  const waterMotifText = waterMotifs ? 'Water motifs amp relevance 15% (from mover lifts)' : '';
  const featuresText = features.join("', '");
  
  return `Create 5 square PNG ad cards (1080x1080) for ${businessName} in ${location} (${service}). 
Use uploaded gallery images [describe: ${variant.visualTheme}—enlarge one per card as bg w/ zoom-tease]. 
Vibrant urgency theme (${variant.ctaColor} CTAs, Montserrat Bold). 
Each: Hero image bleed, top text '${location} ${service}? ${variant.fomoHook}', 
middle 3 bullets ('${featuresText}', '${emergencyResponse}', '${seniorDiscount}% Senior Discount'), 
bottom bar (${variant.ctaColor} button: 'Call ${phone} | ${businessName.toLowerCase().replace(/\s+/g, '')}${location.toLowerCase().replace(/\s+/g, '')}.zone'). 
Watermark: 'AdTopia – Flow Fixed'. ${waterMotifText}
Export layered Gamma, alt text: 'Urgent ${location} ${service} quote'.`;
}

/**
 * Enhanced Plumber-Specific Configurations
 */
export const PLUMBER_URGENCY_CONFIGS: UrgencyCardConfig[] = [
  {
    businessName: 'CoolFix Plumbing',
    location: 'Fresno CA',
    service: 'Drains Clogged',
    phone: '559-XXX-XXXX',
    features: ['Emergency Response <30min', 'No-Mess Cleanups Free'],
    emergencyResponse: '24/7 Emergency',
    seniorDiscount: 15,
    waterMotifs: true
  },
  {
    businessName: 'Pipe Pros',
    location: 'Stockton CA',
    service: 'Emergency Plumbing',
    phone: '209-XXX-XXXX',
    features: ['Same-Day Fixes', 'Licensed & Insured'],
    emergencyResponse: '1-Hour Response',
    seniorDiscount: 10,
    waterMotifs: true
  },
  {
    businessName: 'Flow Masters',
    location: 'Modesto CA',
    service: 'Leak Detection',
    phone: '209-XXX-XXXX',
    features: ['Advanced Detection', 'Eco-Friendly Solutions'],
    emergencyResponse: '30-Minute Response',
    seniorDiscount: 20,
    waterMotifs: true
  }
];

/**
 * Performance Tracking for C1 Urgency Cards
 */
export interface UrgencyCardPerformance {
  variantId: string;
  impressions: number;
  clicks: number;
  calls: number;
  texts: number;
  conversions: number;
  clickRate: number;
  conversionRate: number;
  avgResponseTime: number;
  revenue: number;
}

/**
 * Track C1 Urgency Card Performance
 */
export async function trackUrgencyCardPerformance(
  variantId: string,
  eventType: 'impression' | 'click' | 'call' | 'text' | 'conversion',
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // This would integrate with your existing tracking system
    console.log(`[C1 Urgency] Tracked ${eventType} for variant ${variantId}`, metadata);
    
    // In production, this would call your Supabase tracking function
    // await supabase.functions.invoke('track_ab_conversion', {
    //   body: {
    //     variant: variantId,
    //     event_type: eventType,
    //     metadata: {
    //       ...metadata,
    //       card_type: 'c1_urgency',
    //       timestamp: new Date().toISOString()
    //     }
    //   }
    // });
  } catch (error) {
    console.error('Failed to track urgency card performance:', error);
  }
}

/**
 * Get Optimal C1 Variant Based on Service Type
 */
export function getOptimalC1Variant(serviceType: string): UrgencyCardVariant {
  switch (serviceType.toLowerCase()) {
    case 'drain_cleaning':
    case 'clog_removal':
      return C1_URGENCY_VARIANTS[0]; // Drain coil fade
    case 'emergency_plumbing':
      return C1_URGENCY_VARIANTS[2]; // Pipe elbow panic
    case 'general_plumbing':
      return C1_URGENCY_VARIANTS[4]; // Showerhead drip
    case 'professional_services':
      return C1_URGENCY_VARIANTS[3]; // Toolbelt stack
    default:
      return C1_URGENCY_VARIANTS[1]; // Wrench drop fix
  }
}

/**
 * Generate UTM Parameters for C1 Urgency Cards
 */
export function generateC1UTM(variantId: string, campaign: string = 'c1_urgency'): string {
  return `?utm_source=craigslist&utm_medium=ad_card&utm_campaign=${campaign}&utm_content=${variantId}&utm_term=urgency_fomo`;
}

/**
 * C1 Urgency Card Deployment Strategy
 */
export const C1_DEPLOYMENT_STRATEGY = {
  timing: '5AM Craigslist posts for top visibility',
  frequency: 'Daily rotation of 5 variants',
  tracking: 'UTM parameters for performance analysis',
  webhook: 'Supabase webhook for real-time tracking',
  optimization: 'Weekly performance review and variant optimization',
  scaling: 'Deploy winning variants across all service types'
};
