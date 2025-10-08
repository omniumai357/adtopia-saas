// Enhanced asset optimization for AdTopia global performance
import { cdn } from './cdn';

interface AssetOptimizationOptions {
  width?: number;
  height?: number;
  format?: 'webp' | 'avif' | 'auto' | 'jpeg' | 'png';
  quality?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  gravity?: 'auto' | 'center' | 'top' | 'bottom' | 'left' | 'right';
  blur?: number;
  sharpen?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
}

interface AgencyAsset {
  id: string;
  agencyId: string;
  type: 'logo' | 'banner' | 'product' | 'avatar' | 'document';
  originalPath: string;
  optimizedPath: string;
  size: number;
  dimensions: { width: number; height: number };
  format: string;
  createdAt: Date;
  lastAccessed: Date;
}

interface CDNAnalytics {
  bandwidth: number;
  requests: number;
  cacheHitRate: number;
  responseTime: number;
  errorRate: number;
  topAssets: Array<{
    path: string;
    requests: number;
    bandwidth: number;
  }>;
  geographicDistribution: Record<string, number>;
}

export class AssetOptimizer {
  private static instance: AssetOptimizer;
  private assetCache: Map<string, AgencyAsset> = new Map();
  private optimizationQueue: Array<{ path: string; options: AssetOptimizationOptions }> = [];

  static getInstance(): AssetOptimizer {
    if (!AssetOptimizer.instance) {
      AssetOptimizer.instance = new AssetOptimizer();
    }
    return AssetOptimizer.instance;
  }

  // Optimize agency logo with multiple formats
  async optimizeAgencyLogo(
    agencyId: string,
    logoPath: string,
    options: AssetOptimizationOptions = {}
  ): Promise<AgencyAsset> {
    const defaultOptions: AssetOptimizationOptions = {
      width: 200,
      height: 200,
      format: 'auto',
      quality: 90,
      fit: 'cover',
      gravity: 'center',
    };

    const optimizedOptions = { ...defaultOptions, ...options };
    // Ensure format is compatible with CDN function
    const cdnOptions = {
      width: optimizedOptions.width,
      height: optimizedOptions.height,
      format: optimizedOptions.format === 'jpeg' || optimizedOptions.format === 'png' ? 'auto' : optimizedOptions.format,
      quality: optimizedOptions.quality
    };
    const optimizedUrl = cdn.getOptimizedImageUrl(logoPath, cdnOptions);

    const asset: AgencyAsset = {
      id: `logo_${agencyId}_${Date.now()}`,
      agencyId,
      type: 'logo',
      originalPath: logoPath,
      optimizedPath: optimizedUrl,
      size: 0, // Will be updated after optimization
      dimensions: { width: optimizedOptions.width || 200, height: optimizedOptions.height || 200 },
      format: optimizedOptions.format || 'auto',
      createdAt: new Date(),
      lastAccessed: new Date(),
    };

    this.assetCache.set(asset.id, asset);
    return asset;
  }

  // Optimize product images for agency catalogs
  async optimizeProductImage(
    agencyId: string,
    productId: string,
    imagePath: string,
    options: AssetOptimizationOptions = {}
  ): Promise<AgencyAsset> {
    const defaultOptions: AssetOptimizationOptions = {
      width: 800,
      height: 600,
      format: 'auto',
      quality: 85,
      fit: 'cover',
      gravity: 'center',
    };

    const optimizedOptions = { ...defaultOptions, ...options };
    // Ensure format is compatible with CDN function
    const cdnOptions = {
      width: optimizedOptions.width,
      height: optimizedOptions.height,
      format: optimizedOptions.format === 'jpeg' || optimizedOptions.format === 'png' ? 'auto' : optimizedOptions.format,
      quality: optimizedOptions.quality
    };
    const optimizedUrl = cdn.getOptimizedImageUrl(imagePath, cdnOptions);

    const asset: AgencyAsset = {
      id: `product_${agencyId}_${productId}_${Date.now()}`,
      agencyId,
      type: 'product',
      originalPath: imagePath,
      optimizedPath: optimizedUrl,
      size: 0,
      dimensions: { width: optimizedOptions.width || 800, height: optimizedOptions.height || 600 },
      format: optimizedOptions.format || 'auto',
      createdAt: new Date(),
      lastAccessed: new Date(),
    };

    this.assetCache.set(asset.id, asset);
    return asset;
  }

  // Optimize banner images for agency dashboards
  async optimizeBannerImage(
    agencyId: string,
    bannerPath: string,
    options: AssetOptimizationOptions = {}
  ): Promise<AgencyAsset> {
    const defaultOptions: AssetOptimizationOptions = {
      width: 1200,
      height: 400,
      format: 'auto',
      quality: 80,
      fit: 'cover',
      gravity: 'center',
    };

    const optimizedOptions = { ...defaultOptions, ...options };
    // Ensure format is compatible with CDN function
    const cdnOptions = {
      width: optimizedOptions.width,
      height: optimizedOptions.height,
      format: optimizedOptions.format === 'jpeg' || optimizedOptions.format === 'png' ? 'auto' : optimizedOptions.format,
      quality: optimizedOptions.quality
    };
    const optimizedUrl = cdn.getOptimizedImageUrl(bannerPath, cdnOptions);

    const asset: AgencyAsset = {
      id: `banner_${agencyId}_${Date.now()}`,
      agencyId,
      type: 'banner',
      originalPath: bannerPath,
      optimizedPath: optimizedUrl,
      size: 0,
      dimensions: { width: optimizedOptions.width || 1200, height: optimizedOptions.height || 400 },
      format: optimizedOptions.format || 'auto',
      createdAt: new Date(),
      lastAccessed: new Date(),
    };

    this.assetCache.set(asset.id, asset);
    return asset;
  }

  // Optimize avatar images for agency profiles
  async optimizeAvatarImage(
    agencyId: string,
    userId: string,
    avatarPath: string,
    options: AssetOptimizationOptions = {}
  ): Promise<AgencyAsset> {
    const defaultOptions: AssetOptimizationOptions = {
      width: 150,
      height: 150,
      format: 'auto',
      quality: 90,
      fit: 'cover',
      gravity: 'center',
    };

    const optimizedOptions = { ...defaultOptions, ...options };
    // Ensure format is compatible with CDN function
    const cdnOptions = {
      width: optimizedOptions.width,
      height: optimizedOptions.height,
      format: optimizedOptions.format === 'jpeg' || optimizedOptions.format === 'png' ? 'auto' : optimizedOptions.format,
      quality: optimizedOptions.quality
    };
    const optimizedUrl = cdn.getOptimizedImageUrl(avatarPath, cdnOptions);

    const asset: AgencyAsset = {
      id: `avatar_${agencyId}_${userId}_${Date.now()}`,
      agencyId,
      type: 'avatar',
      originalPath: avatarPath,
      optimizedPath: optimizedUrl,
      size: 0,
      dimensions: { width: optimizedOptions.width || 150, height: optimizedOptions.height || 150 },
      format: optimizedOptions.format || 'auto',
      createdAt: new Date(),
      lastAccessed: new Date(),
    };

    this.assetCache.set(asset.id, asset);
    return asset;
  }

  // Batch optimize multiple assets
  async batchOptimize(
    agencyId: string,
    assets: Array<{ path: string; type: 'logo' | 'banner' | 'product' | 'avatar'; options?: AssetOptimizationOptions }>
  ): Promise<AgencyAsset[]> {
    const optimizedAssets: AgencyAsset[] = [];

    for (const asset of assets) {
      let optimizedAsset: AgencyAsset;

      switch (asset.type) {
        case 'logo':
          optimizedAsset = await this.optimizeAgencyLogo(agencyId, asset.path, asset.options);
          break;
        case 'banner':
          optimizedAsset = await this.optimizeBannerImage(agencyId, asset.path, asset.options);
          break;
        case 'product':
          optimizedAsset = await this.optimizeProductImage(agencyId, 'batch', asset.path, asset.options);
          break;
        case 'avatar':
          optimizedAsset = await this.optimizeAvatarImage(agencyId, 'batch', asset.path, asset.options);
          break;
        default:
          throw new Error(`Unsupported asset type: ${asset.type}`);
      }

      optimizedAssets.push(optimizedAsset);
    }

    return optimizedAssets;
  }

  // Get optimized asset URL with caching
  getOptimizedUrl(assetId: string): string | null {
    const asset = this.assetCache.get(assetId);
    if (asset) {
      asset.lastAccessed = new Date();
      return asset.optimizedPath;
    }
    return null;
  }

  // Purge agency assets from cache
  async purgeAgencyAssets(agencyId: string): Promise<boolean> {
    try {
      const agencyAssets = Array.from(this.assetCache.values())
        .filter(asset => asset.agencyId === agencyId)
        .map(asset => asset.optimizedPath);

      if (agencyAssets.length > 0) {
        await cdn.purgeCache(agencyAssets);
        console.log(`✅ Purged ${agencyAssets.length} assets for agency ${agencyId}`);
      }

      // Remove from local cache
      for (const [id, asset] of Array.from(this.assetCache.entries())) {
        if (asset.agencyId === agencyId) {
          this.assetCache.delete(id);
        }
      }

      return true;
    } catch (error) {
      console.error(`❌ Failed to purge assets for agency ${agencyId}:`, error);
      return false;
    }
  }

  // Get CDN analytics
  async getCDNAnalytics(timeframe: string = '24h'): Promise<CDNAnalytics | null> {
    try {
      const analytics = await cdn.getAnalytics(timeframe);
      
      // Process analytics data
      const processedAnalytics: CDNAnalytics = {
        bandwidth: analytics.result?.bandwidth?.all || 0,
        requests: analytics.result?.requests?.all || 0,
        cacheHitRate: analytics.result?.cache_hit_rate || 0,
        responseTime: analytics.result?.response_time || 0,
        errorRate: analytics.result?.error_rate || 0,
        topAssets: analytics.result?.top_assets || [],
        geographicDistribution: analytics.result?.geographic_distribution || {},
      };

      return processedAnalytics;
    } catch (error) {
      console.error('❌ Failed to get CDN analytics:', error);
      return null;
    }
  }

  // Get asset statistics
  getAssetStats(): {
    totalAssets: number;
    assetsByType: Record<string, number>;
    assetsByAgency: Record<string, number>;
    totalSize: number;
    averageSize: number;
  } {
    const assets = Array.from(this.assetCache.values());
    
    const assetsByType: Record<string, number> = {};
    const assetsByAgency: Record<string, number> = {};
    let totalSize = 0;

    for (const asset of assets) {
      assetsByType[asset.type] = (assetsByType[asset.type] || 0) + 1;
      assetsByAgency[asset.agencyId] = (assetsByAgency[asset.agencyId] || 0) + 1;
      totalSize += asset.size;
    }

    return {
      totalAssets: assets.length,
      assetsByType,
      assetsByAgency,
      totalSize,
      averageSize: assets.length > 0 ? totalSize / assets.length : 0,
    };
  }

  // Clean up old assets
  cleanupOldAssets(maxAge: number = 30 * 24 * 60 * 60 * 1000): number { // 30 days default
    const cutoffTime = Date.now() - maxAge;
    let cleanedCount = 0;

    for (const [id, asset] of Array.from(this.assetCache.entries())) {
      if (asset.lastAccessed.getTime() < cutoffTime) {
        this.assetCache.delete(id);
        cleanedCount++;
      }
    }

    console.log(`🧹 Cleaned up ${cleanedCount} old assets`);
    return cleanedCount;
  }

  // Health check
  async healthCheck(): Promise<{ healthy: boolean; latency: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      // Test CDN connectivity
      const analytics = await cdn.getAnalytics('1h');
      const latency = Date.now() - startTime;
      
      return {
        healthy: !!analytics,
        latency,
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        healthy: false,
        latency,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
export const assetOptimizer = AssetOptimizer.getInstance();
