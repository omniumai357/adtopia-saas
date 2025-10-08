import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CraigslistAd {
  id: string;
  title: string;
  body: string;
  phone: string;
  email?: string;
  location: string;
  service_type: string;
  post_date: string;
  images: string[];
  url: string;
  is_optimized: boolean;
  optimization_score: number;
}

interface HarvestCriteria {
  location: string;
  service_types: string[];
  max_age_days: number;
  min_optimization_score: number;
}

/**
 * Craigslist Ad Harvester
 * Automates the collection and analysis of unoptimized service ads
 */
export class CraigslistHarvester {
  private criteria: HarvestCriteria;

  constructor(criteria: HarvestCriteria) {
    this.criteria = criteria;
  }

  /**
   * Analyze ad optimization score (0-100)
   * Higher score = more optimized
   */
  private calculateOptimizationScore(ad: Partial<CraigslistAd>): number {
    let score = 0;
    const title = ad.title?.toLowerCase() || '';
    const body = ad.body?.toLowerCase() || '';

    // SEO Keywords (20 points)
    const seoKeywords = [
      'affordable', 'licensed', 'insured', 'professional', 'experienced',
      '24/7', 'emergency', 'same day', 'free estimate', 'guaranteed'
    ];
    const seoCount = seoKeywords.filter(keyword => 
      title.includes(keyword) || body.includes(keyword)
    ).length;
    score += Math.min(seoCount * 4, 20);

    // Location specificity (15 points)
    if (title.includes(this.criteria.location.toLowerCase()) || 
        body.includes(this.criteria.location.toLowerCase())) {
      score += 15;
    }

    // Professional contact (15 points)
    if (ad.email && ad.email.includes('@') && !ad.email.includes('yahoo') && !ad.email.includes('gmail')) {
      score += 15;
    } else if (ad.email) {
      score += 5; // Has email but not professional
    }

    // Website/URL presence (20 points)
    if (ad.body?.includes('http') || ad.body?.includes('www.') || ad.body?.includes('.com')) {
      score += 20;
    }

    // Professional structure (15 points)
    if (ad.body && ad.body.length > 100 && ad.body.includes('\n')) {
      score += 15;
    } else if (ad.body && ad.body.length > 50) {
      score += 10;
    }

    // Trust signals (15 points)
    const trustSignals = ['licensed', 'insured', 'bonded', 'certified', 'warranty', 'guarantee'];
    const trustCount = trustSignals.filter(signal => 
      title.includes(signal) || body.includes(signal)
    ).length;
    score += Math.min(trustCount * 3, 15);

    return Math.min(score, 100);
  }

  /**
   * Check if ad meets harvest criteria (unoptimized)
   */
  private isHarvestable(ad: Partial<CraigslistAd>): boolean {
    const score = this.calculateOptimizationScore(ad);
    return score <= this.criteria.min_optimization_score;
  }

  /**
   * Parse Craigslist ad data from various sources
   */
  private parseAdData(rawData: any): Partial<CraigslistAd> {
    return {
      title: rawData.title || '',
      body: rawData.body || rawData.description || '',
      phone: rawData.phone || rawData.contact || '',
      email: rawData.email || '',
      location: rawData.location || this.criteria.location,
      service_type: rawData.service_type || 'general',
      post_date: rawData.post_date || new Date().toISOString(),
      images: rawData.images || [],
      url: rawData.url || '',
      is_optimized: false,
      optimization_score: 0
    };
  }

  /**
   * Harvest ads from Craigslist (mock implementation)
   * In production, this would integrate with Craigslist API or scraping service
   */
  async harvestAds(limit: number = 100): Promise<CraigslistAd[]> {
    // Mock data for demonstration - replace with actual Craigslist integration
    const mockAds = [
      {
        title: "PINK JUNK REMOVAL (Modesto)",
        body: "I GENERAL HAUL ANY KINDA DEBRIS\nI DO GENREAL DEMOLITION , TILE DEMOTION , FLOORING DEMOLITION, LAND CLEAN UP\nTEXT OR CALL 209 810 1133",
        phone: "209 810 1133",
        location: "Modesto",
        service_type: "junk_removal",
        post_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        images: [],
        url: "https://modesto.craigslist.org/example1"
      },
      {
        title: "R MOVERS !!! (MODESTO)",
        body: "FREE ESTIMATES!!!\nWe are professionals movers over 14 years of experience..\nIf you need a movers it will a pleasure to work with you..\nApartments\nHouse\nOffice\nLocal move\nLong distance\nWe also move:\nGrand piano\nBaby grand piano\nUpright piano\nWe can help you with your packing if you need it...\nGive us a call, text or email...\nRacoone1212@yahoo.com\n(209) 809-8541\n(916) 800- 9747\nWhatsApp\n(209) 809-8541\nRodrigo\nRmoversca.com\nFB... R-movers\nFREE ESTIMATES!!!",
        phone: "209 809-8541",
        email: "Racoone1212@yahoo.com",
        location: "Modesto",
        service_type: "movers",
        post_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        images: [],
        url: "https://modesto.craigslist.org/example2"
      },
      {
        title: "Lucky Spa - Therapeutic Massage Hayward",
        body: "Masajes Terapéuticos\nLicensed massage therapist\nOpen 7 days\nWalk-ins welcome\n510-888-9222\nJackson St, Hayward",
        phone: "510-888-9222",
        location: "Hayward",
        service_type: "massage",
        post_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        images: [],
        url: "https://sfbay.craigslist.org/example3"
      }
    ];

    const harvestableAds: CraigslistAd[] = [];

    for (const rawAd of mockAds.slice(0, limit)) {
      const parsedAd = this.parseAdData(rawAd);
      const score = this.calculateOptimizationScore(parsedAd);
      
      if (this.isHarvestable(parsedAd)) {
        harvestableAds.push({
          id: `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...parsedAd,
          optimization_score: score,
          is_optimized: false
        } as CraigslistAd);
      }
    }

    return harvestableAds;
  }

  /**
   * Store harvested ads in Supabase
   */
  async storeHarvestedAds(ads: CraigslistAd[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('harvested_ads')
        .insert(ads.map(ad => ({
          ...ad,
          created_at: new Date().toISOString()
        })));

      if (error) {
        console.error('Error storing harvested ads:', error);
        throw error;
      }

      console.log(`Stored ${ads.length} harvested ads`);
    } catch (error) {
      console.error('Failed to store harvested ads:', error);
      throw error;
    }
  }

  /**
   * Get harvest statistics
   */
  async getHarvestStats(): Promise<{
    total_harvested: number;
    by_service_type: Record<string, number>;
    avg_optimization_score: number;
    recent_harvests: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('harvested_ads')
        .select('service_type, optimization_score, created_at');

      if (error) {
        console.error('Error fetching harvest stats:', error);
        return {
          total_harvested: 0,
          by_service_type: {},
          avg_optimization_score: 0,
          recent_harvests: 0
        };
      }

      const total_harvested = data?.length || 0;
      const by_service_type: Record<string, number> = {};
      const recent_harvests = data?.filter(ad => 
        new Date(ad.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length || 0;

      data?.forEach(ad => {
        by_service_type[ad.service_type] = (by_service_type[ad.service_type] || 0) + 1;
      });

      const avg_optimization_score = data?.length 
        ? data.reduce((sum, ad) => sum + ad.optimization_score, 0) / data.length 
        : 0;

      return {
        total_harvested,
        by_service_type,
        avg_optimization_score: Math.round(avg_optimization_score),
        recent_harvests
      };
    } catch (error) {
      console.error('Failed to get harvest stats:', error);
      return {
        total_harvested: 0,
        by_service_type: {},
        avg_optimization_score: 0,
        recent_harvests: 0
      };
    }
  }
}

/**
 * Create harvester instance for specific criteria
 */
export function createHarvester(criteria: HarvestCriteria): CraigslistHarvester {
  return new CraigslistHarvester(criteria);
}

/**
 * Default harvest criteria for unoptimized ads
 */
export const DEFAULT_HARVEST_CRITERIA: HarvestCriteria = {
  location: 'Modesto',
  service_types: ['junk_removal', 'movers', 'massage', 'plumbing', 'hvac', 'cleaning'],
  max_age_days: 7,
  min_optimization_score: 30 // Harvest ads with optimization score <= 30
};
