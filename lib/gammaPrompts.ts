/**
 * Optimized Gamma AI Prompts for Ad Card Generation
 * Based on successful A/B testing results and conversion optimization
 */

export interface AdCardPrompt {
  id: string;
  name: string;
  description: string;
  prompt: string;
  variant: 'urgency' | 'value' | 'hybrid';
  service_type: string;
  target_metrics: {
    click_rate_target: number;
    conversion_rate_target: number;
    dwell_time_target: number;
  };
}

/**
 * R Movers Prompts (Based on successful A/B test results)
 */
export const RMOVERS_PROMPTS: AdCardPrompt[] = [
  {
    id: 'rmovers_urgency_a1',
    name: 'R Movers Urgency Red (A1)',
    description: 'FOMO-driven red cards with "Slots Vanishing" overlays - 28.8% click rate',
    variant: 'urgency',
    service_type: 'movers',
    target_metrics: {
      click_rate_target: 25,
      conversion_rate_target: 8,
      dwell_time_target: 25
    },
    prompt: `Create 5 PNG ad cards (1080x1080) for R Movers Modesto CA (14+ yrs pros, $99/hr locals, piano safe-hauls). Upload/integrate these gallery images [paste deck shots: truck unloads, piano wraps, eco-disposal bins—bg one per card w/ zoom overlay]. Red urgency (#EF4444 buttons, bold Montserrat). Each: Image bleed, top 'Modesto Slots Filling FAST – Secure Yours!', 3 bullets ('2-4hr Piano Moves', '10% Off First – Limited!', 'Free Eco-Disposal'), bottom CTA (red btn: 'Text 209-809-8541 | RMoversModesto.zone'). 'AdTopia Powered' watermark. Gamma: Layered export, alt: 'Urgent Modesto movers deal'.`
  },
  {
    id: 'rmovers_value_a2',
    name: 'R Movers Value Blue (A2)',
    description: 'Trust-building blue cards with "3,500+ Guarantee" - 45s dwell time, 10.4% conversion',
    variant: 'value',
    service_type: 'movers',
    target_metrics: {
      click_rate_target: 18,
      conversion_rate_target: 10,
      dwell_time_target: 45
    },
    prompt: `Generate 5 square ad images (1080x1080 PNGs) for R Movers (Central Valley relos, transparent pricing, damage-free guarantee). Embed uploaded real photos [deck gallery: family testimonials, pro crews, heirloom pianos—icon overlays]. Blue trust (#3B82F6 accents). Per card: Fade bg image, overlay '3,500+ Families Trust Us – Why?', bullets ('Licensed Piano Pros', 'No Hidden Fees $99/hr', 'Eco-Friendly Start Fresh'), footer (blue btn: 'Free Quote | Pro@RMoversModesto.com | zone'). Stars/100% badge. Output: Editable Gamma, SEO alt: 'Reliable Modesto piano movers gallery'.`
  }
];

/**
 * Fresno Plumber Prompts (Pipe Pros Pivot)
 */
export const FRESNO_PLUMBER_PROMPTS: AdCardPrompt[] = [
  {
    id: 'plumber_urgency_emergency',
    name: 'Fresno Plumber Emergency (Urgency)',
    description: 'Emergency plumbing with 24/7 urgency hooks - targets same-day response',
    variant: 'urgency',
    service_type: 'plumbing',
    target_metrics: {
      click_rate_target: 30,
      conversion_rate_target: 12,
      dwell_time_target: 20
    },
    prompt: `Create 5 PNG ad cards (1080x1080) for Pipe Pros Stockton CA plumbers (24/7 emergencies, $99 first hr, drain specialists). Upload/integrate stock images [clogged sinks bursting, pro wrench fixes, happy homes flowing—bg one per card w/ zoom tease]. Red urgency (#EF4444 CTAs, bold Montserrat). Each: Image bleed, top 'Stockton Clogs Filling Fast – Call Before Flood!', bullets ('24/7 Emergency Response', '10% Off First Service – Limited!', '$99/Hr Starts'), bottom (red btn: 'Text 209-XXX-XXXX | PipeProsStockton.zone'). 'AdTopia Powered' watermark. Gamma: Layered export, alt: 'Urgent Stockton CA plumber deal'.`
  },
  {
    id: 'plumber_value_trust',
    name: 'Fresno Plumber Trust (Value)',
    description: 'Trust-building with licensed/insured guarantees - targets family decision makers',
    variant: 'value',
    service_type: 'plumbing',
    target_metrics: {
      click_rate_target: 20,
      conversion_rate_target: 15,
      dwell_time_target: 35
    },
    prompt: `Generate 5 square ad images (1080x1080 PNGs) for Pipe Pros (licensed Stockton plumbing, transparent $99/hr, eco-drains). Embed real-fix photos [burst pipe repairs, clean flows, family relief—icon overlays]. Blue trust (#3B82F6 accents). Per card: Fade bg image, overlay 'Why 2,000+ Stockton Homes Trust Us?', bullets ('Fully Insured No Mess Guarantee', 'Same-Day Fixes Incl.', 'Free Leak Inspection'), footer (blue btn: 'Book Now | Pro@PipeProsStockton.com | zone'). Stars/100% badge. Output: Editable Gamma, alt: 'Reliable Stockton emergency plumbing'.`
  }
];

/**
 * HVAC Prompts (CoolFix Fresno)
 */
export const HVAC_PROMPTS: AdCardPrompt[] = [
  {
    id: 'hvac_urgency_heatwave',
    name: 'HVAC Heatwave Urgency',
    description: 'Heatwave emergency with AC repair urgency - targets summer panic',
    variant: 'urgency',
    service_type: 'hvac',
    target_metrics: {
      click_rate_target: 28,
      conversion_rate_target: 10,
      dwell_time_target: 22
    },
    prompt: `5 PNG ad cards (1080x1080) for CoolFix Fresno CA HVAC (24/7 AC repairs, $99 tune-ups, duct cleaners). Integrate stock images [overheating units, cool installs, family relief—bg w/ zoom tease]. Red urgency (#EF4444 CTAs, Montserrat Bold). Each: Bleed image, top 'Fresno Heatwave Alerts – Fix Before Meltdown!', bullets ('24/7 AC Rescue', '10% Off First – Limited Slots!', '$99 Tune-Up Starts'), bottom (red btn: 'Text 559-XXX-XXXX | CoolFixFresno.zone'). AdTopia watermark. Gamma: Layered, alt: 'Urgent Fresno AC repair deal'.`
  },
  {
    id: 'hvac_value_reliability',
    name: 'HVAC Reliability Value',
    description: 'Energy efficiency and reliability focus - targets cost-conscious homeowners',
    variant: 'value',
    service_type: 'hvac',
    target_metrics: {
      click_rate_target: 18,
      conversion_rate_target: 12,
      dwell_time_target: 40
    },
    prompt: `5 square PNGs (1080x1080) for CoolFix (licensed Fresno HVAC, transparent $99/hr, energy-efficient). Embed photos [duct cleans, thermostat swaps, bill savings—icon overlays]. Blue trust (#3B82F6 accents). Per card: Fade bg image, overlay 'Why 1,500+ Fresno Homes Stay Cool?', bullets ('Fully Insured No Downtime', 'Same-Day Installs Incl.', 'Free Energy Audit'), footer (blue btn: 'Book Now | Pro@CoolFixFresno.com | zone'). Stars/100% badge. Output: Editable Gamma, alt: 'Reliable Fresno HVAC services'.`
  }
];

/**
 * Lucky Spa Prompts (Massage Therapy)
 */
export const MASSAGE_PROMPTS: AdCardPrompt[] = [
  {
    id: 'massage_urgency_stress',
    name: 'Massage Stress Relief Urgency',
    description: 'Stress relief urgency with same-day booking - targets busy professionals',
    variant: 'urgency',
    service_type: 'massage',
    target_metrics: {
      click_rate_target: 25,
      conversion_rate_target: 8,
      dwell_time_target: 30
    },
    prompt: `Create 5 PNG ad cards (1080x1080) for Lucky Spa Hayward CA (licensed therapeutic massage, walk-ins welcome, stress relief). Upload/integrate spa images [relaxing massage rooms, happy clients, professional therapists—bg w/ zoom overlay]. Red urgency (#EF4444 CTAs, Montserrat Bold). Each: Image bleed, top 'Hayward Stress Relief – Book Today!', bullets ('Licensed Therapists', 'Walk-Ins Welcome', '10% Off First Visit'), bottom CTA (red btn: 'Call 510-888-9222 | LuckySpaHayward.zone'). 'AdTopia Powered' watermark. Gamma: Layered export, alt: 'Urgent Hayward massage therapy'.`
  },
  {
    id: 'massage_value_wellness',
    name: 'Massage Wellness Value',
    description: 'Wellness and health benefits focus - targets health-conscious clients',
    variant: 'value',
    service_type: 'massage',
    target_metrics: {
      click_rate_target: 20,
      conversion_rate_target: 12,
      dwell_time_target: 45
    },
    prompt: `Generate 5 square ad images (1080x1080 PNGs) for Lucky Spa (therapeutic massage, licensed therapists, wellness focus). Embed spa photos [professional treatments, serene environment, client testimonials—icon overlays]. Blue trust (#3B82F6 accents). Per card: Fade bg image, overlay 'Why 500+ Hayward Clients Choose Us?', bullets ('Licensed & Insured', 'Therapeutic Benefits', 'Flexible Scheduling'), footer (blue btn: 'Book Now | Pro@LuckySpaHayward.com | zone'). Stars/100% badge. Output: Editable Gamma, alt: 'Trusted Hayward therapeutic massage'.`
  }
];

/**
 * Hybrid Prompts (Combining A1 Urgency + A2 Value)
 */
export const HYBRID_PROMPTS: AdCardPrompt[] = [
  {
    id: 'hybrid_rmovers_red_cta_blue_trust',
    name: 'R Movers Hybrid: Red CTAs + Blue Trust',
    description: 'Combines A1 urgency CTAs with A2 trust elements - projected +18% uplift',
    variant: 'hybrid',
    service_type: 'movers',
    target_metrics: {
      click_rate_target: 30,
      conversion_rate_target: 12,
      dwell_time_target: 35
    },
    prompt: `Create 5 PNG ad cards (1080x1080) for R Movers Modesto CA (hybrid urgency+trust approach). Upload gallery images [piano wraps, family moves, truck loads—bg w/ zoom]. Blue trust theme (#3B82F6 bg) with red urgency CTAs (#EF4444 buttons). Each: Image bleed, overlay '3,500+ Families Trust Us – Slots Filling Fast!', bullets ('Licensed Piano Pros', '10% Off First – Limited!', 'Free Eco-Disposal'), bottom (red btn: 'Text 209-809-8541 NOW | RMoversModesto.zone'). 'AdTopia Powered' watermark. Gamma: Layered, alt: 'Hybrid Modesto movers urgency+trust'.`
  }
];

/**
 * Get prompts by service type
 */
export function getPromptsByServiceType(serviceType: string): AdCardPrompt[] {
  switch (serviceType.toLowerCase()) {
    case 'movers':
      return RMOVERS_PROMPTS;
    case 'plumbing':
    case 'plumber':
      return FRESNO_PLUMBER_PROMPTS;
    case 'hvac':
      return HVAC_PROMPTS;
    case 'massage':
    case 'spa':
      return MASSAGE_PROMPTS;
    default:
      return [...RMOVERS_PROMPTS, ...FRESNO_PLUMBER_PROMPTS, ...HVAC_PROMPTS, ...MASSAGE_PROMPTS];
  }
}

/**
 * Get prompts by variant type
 */
export function getPromptsByVariant(variant: 'urgency' | 'value' | 'hybrid'): AdCardPrompt[] {
  const allPrompts = [
    ...RMOVERS_PROMPTS,
    ...FRESNO_PLUMBER_PROMPTS,
    ...HVAC_PROMPTS,
    ...MASSAGE_PROMPTS,
    ...HYBRID_PROMPTS
  ];
  
  return allPrompts.filter(prompt => prompt.variant === variant);
}

/**
 * Get optimal prompt based on A/B test results
 */
export function getOptimalPrompt(serviceType: string, targetMetric: 'clicks' | 'conversions' | 'dwell'): AdCardPrompt | null {
  const prompts = getPromptsByServiceType(serviceType);
  
  if (prompts.length === 0) return null;
  
  switch (targetMetric) {
    case 'clicks':
      return prompts.reduce((best, current) => 
        current.target_metrics.click_rate_target > best.target_metrics.click_rate_target ? current : best
      );
    case 'conversions':
      return prompts.reduce((best, current) => 
        current.target_metrics.conversion_rate_target > best.target_metrics.conversion_rate_target ? current : best
      );
    case 'dwell':
      return prompts.reduce((best, current) => 
        current.target_metrics.dwell_time_target > best.target_metrics.dwell_time_target ? current : best
      );
    default:
      return prompts[0];
  }
}

/**
 * All available prompts
 */
export const ALL_PROMPTS: AdCardPrompt[] = [
  ...RMOVERS_PROMPTS,
  ...FRESNO_PLUMBER_PROMPTS,
  ...HVAC_PROMPTS,
  ...MASSAGE_PROMPTS,
  ...HYBRID_PROMPTS
];
