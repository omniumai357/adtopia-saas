import { NextRequest, NextResponse } from 'next/server';
import { cdn } from '@/src/utils/cdn';
import { performanceMonitor } from '@/lib/monitoring';

// CDN Optimization API for AdTopia global performance
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const path = searchParams.get('path');
    const width = searchParams.get('width');
    const height = searchParams.get('height');
    const format = searchParams.get('format') || 'auto';
    const quality = searchParams.get('quality') || '85';

    let result: any = null;

    switch (action) {
      case 'optimize-image':
        if (!path) {
          return NextResponse.json(
            { error: 'Image path is required' },
            { status: 400 }
          );
        }
        
        const options = {
          width: width ? parseInt(width) : undefined,
          height: height ? parseInt(height) : undefined,
          format: format as 'webp' | 'avif' | 'auto',
          quality: parseInt(quality),
        };
        
        result = cdn.getOptimizedImageUrl(path, options);
        break;

      case 'analytics':
        const timeframe = searchParams.get('timeframe') || '24h';
        result = await cdn.getAnalytics(timeframe);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Valid actions: optimize-image, analytics' },
          { status: 400 }
        );
    }

    const duration = Date.now() - startTime;
    await performanceMonitor.trackApiResponse(
      `/api/cdn/optimize?action=${action}`,
      'GET',
      duration,
      200
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
    await performanceMonitor.trackError(error as Error, { action: 'cdn_optimize_get' });

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
    const { action, paths } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    let result: any = null;

    switch (action) {
      case 'purge-cache':
        if (!paths || !Array.isArray(paths)) {
          return NextResponse.json(
            { error: 'Paths array is required' },
            { status: 400 }
          );
        }
        result = await cdn.purgeCache(paths);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Valid actions: purge-cache' },
          { status: 400 }
        );
    }

    const duration = Date.now() - startTime;
    await performanceMonitor.trackApiResponse(
      `/api/cdn/optimize?action=${action}`,
      'POST',
      duration,
      200
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
    await performanceMonitor.trackError(error as Error, { action: 'cdn_optimize_post' });

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
