// Create: src/utils/cdn.ts
// Static asset optimization for global performance

interface CDNConfig {
  zone: string;
  apiToken: string;
  baseUrl: string;
}

export class CloudflareCDN {
  private config: CDNConfig;

  constructor(config: CDNConfig) {
    this.config = config;
  }

  // Optimize images for agency partner materials
  getOptimizedImageUrl(path: string, options: {
    width?: number;
    height?: number;
    format?: 'webp' | 'avif' | 'auto';
    quality?: number;
  } = {}) {
    const { width, height, format = 'auto', quality = 85 } = options;
    const params = new URLSearchParams();
    
    if (width) params.append('width', width.toString());
    if (height) params.append('height', height.toString());
    params.append('format', format);
    params.append('quality', quality.toString());

    return `${this.config.baseUrl}/cdn-cgi/image/${params.toString()}/${path}`;
  }

  // Cache agency dashboard assets
  async purgeCache(paths: string[]) {
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${this.config.zone}/purge_cache`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ files: paths })
    });
    
    return response.json();
  }

  // Real-time analytics integration
  async getAnalytics(timeframe: string = '24h') {
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${this.config.zone}/analytics/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.apiToken}`
      }
    });
    
    return response.json();
  }
}

export const cdn = new CloudflareCDN({
  zone: process.env.CLOUDFLARE_ZONE_ID!,
  apiToken: process.env.CLOUDFLARE_API_TOKEN!,
  baseUrl: 'https://adtopia.io'
});
