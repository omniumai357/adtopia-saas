import { NextRequest, NextResponse } from 'next/server';
import { assetOptimizer } from '@/src/utils/assetOptimizer';
import { AdTopiaMonitoring } from '@/src/lib/monitoring';

// CDN Asset Optimization API for AdTopia global performance
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const agencyId = searchParams.get('agencyId');
    const assetId = searchParams.get('assetId');

    let result: any = null;

    switch (action) {
      case 'optimized-url':
        if (!assetId) {
          return NextResponse.json(
            { error: 'Asset ID is required' },
            { status: 400 }
          );
        }
        result = assetOptimizer.getOptimizedUrl(assetId);
        break;

      case 'stats':
        result = assetOptimizer.getAssetStats();
        break;

      case 'analytics':
        const timeframe = searchParams.get('timeframe') || '24h';
        result = await assetOptimizer.getCDNAnalytics(timeframe);
        break;

      case 'health':
        result = await assetOptimizer.healthCheck();
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Valid actions: optimized-url, stats, analytics, health' },
          { status: 400 }
        );
    }

    const duration = Date.now() - startTime;
    AdTopiaMonitoring.trackPerformance(
      `/api/cdn/assets?action=${action}`,
      duration
    );

    return NextResponse.json({
      success: true,
      action,
      data: result,
      timestamp: new Date().toISOString(),
      duration,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    AdTopiaMonitoring.trackPerformance(
      `/api/cdn/assets`,
      duration
    );

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        duration,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { action, agencyId, data } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    if (!agencyId) {
      return NextResponse.json(
        { error: 'Agency ID is required' },
        { status: 400 }
      );
    }

    let result: any = null;

    switch (action) {
      case 'optimize-logo':
        if (!data?.path) {
          return NextResponse.json(
            { error: 'Logo path is required' },
            { status: 400 }
          );
        }
        result = await assetOptimizer.optimizeAgencyLogo(agencyId, data.path, data.options);
        break;

      case 'optimize-banner':
        if (!data?.path) {
          return NextResponse.json(
            { error: 'Banner path is required' },
            { status: 400 }
          );
        }
        result = await assetOptimizer.optimizeBannerImage(agencyId, data.path, data.options);
        break;

      case 'optimize-product':
        if (!data?.path || !data?.productId) {
          return NextResponse.json(
            { error: 'Product path and product ID are required' },
            { status: 400 }
          );
        }
        result = await assetOptimizer.optimizeProductImage(
          agencyId,
          data.productId,
          data.path,
          data.options
        );
        break;

      case 'optimize-avatar':
        if (!data?.path || !data?.userId) {
          return NextResponse.json(
            { error: 'Avatar path and user ID are required' },
            { status: 400 }
          );
        }
        result = await assetOptimizer.optimizeAvatarImage(
          agencyId,
          data.userId,
          data.path,
          data.options
        );
        break;

      case 'batch-optimize':
        if (!data?.assets || !Array.isArray(data.assets)) {
          return NextResponse.json(
            { error: 'Assets array is required' },
            { status: 400 }
          );
        }
        result = await assetOptimizer.batchOptimize(agencyId, data.assets);
        break;

      case 'purge':
        result = await assetOptimizer.purgeAgencyAssets(agencyId);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Valid actions: optimize-logo, optimize-banner, optimize-product, optimize-avatar, batch-optimize, purge' },
          { status: 400 }
        );
    }

    const duration = Date.now() - startTime;
    AdTopiaMonitoring.trackPerformance(
      `/api/cdn/assets?action=${action}`,
      duration
    );

    return NextResponse.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString(),
      duration,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    AdTopiaMonitoring.trackPerformance('/api/agency/cache', duration);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        duration,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const agencyId = searchParams.get('agencyId');

    if (!agencyId) {
      return NextResponse.json(
        { error: 'Agency ID is required' },
        { status: 400 }
      );
    }

    const result = await assetOptimizer.purgeAgencyAssets(agencyId);

    const duration = Date.now() - startTime;
    AdTopiaMonitoring.trackPerformance(
      `/api/cdn/assets?agencyId=${agencyId}`,
      duration
    );

    return NextResponse.json({
      success: result,
      message: result ? 'Agency assets purged successfully' : 'Failed to purge agency assets',
      agencyId,
      timestamp: new Date().toISOString(),
      duration,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    AdTopiaMonitoring.trackPerformance('/api/agency/cache', duration);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        duration,
      },
      { status: 500 }
    );
  }
}
