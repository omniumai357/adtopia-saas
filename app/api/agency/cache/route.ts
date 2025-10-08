import { NextRequest, NextResponse } from 'next/server';
import AgencyCacheManager from '@/src/utils/agencyCache';
import { AdTopiaMonitoring } from '@/src/lib/monitoring';

// Agency cache API endpoints for AdTopia scaling
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const agencyId = searchParams.get('agencyId');

    let result: any = null;

    switch (action) {
      case 'session':
        if (!agencyId) {
          return NextResponse.json(
            { error: 'Agency ID is required' },
            { status: 400 }
          );
        }
        result = await AgencyCacheManager.getAgencySession(agencyId);
        break;

      case 'commission':
        if (!agencyId) {
          return NextResponse.json(
            { error: 'Agency ID is required' },
            { status: 400 }
          );
        }
        const saleAmount = parseFloat(searchParams.get('saleAmount') || '0');
        result = await AgencyCacheManager.getCachedCommission(agencyId, saleAmount);
        break;

      case 'metrics':
        result = await AgencyCacheManager.getAgencyMetrics();
        break;

      case 'performance':
        if (!agencyId) {
          return NextResponse.json(
            { error: 'Agency ID is required' },
            { status: 400 }
          );
        }
        result = await AgencyCacheManager.getAgencyPerformance(agencyId);
        break;

      case 'quota':
        if (!agencyId) {
          return NextResponse.json(
            { error: 'Agency ID is required' },
            { status: 400 }
          );
        }
        result = await AgencyCacheManager.getAgencyQuota(agencyId);
        break;

      case 'stats':
        result = await AgencyCacheManager.getCacheStats();
        break;

      case 'health':
        result = await AgencyCacheManager.healthCheck();
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Valid actions: session, commission, metrics, performance, quota, stats, health' },
          { status: 400 }
        );
    }

    const duration = Date.now() - startTime;
    AdTopiaMonitoring.trackPerformance(
      `/api/agency/cache?action=${action}`,
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
      `/api/agency/cache`,
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

    let result: any = null;

    switch (action) {
      case 'session':
        if (!agencyId || !data) {
          return NextResponse.json(
            { error: 'Agency ID and session data are required' },
            { status: 400 }
          );
        }
        await AgencyCacheManager.setAgencySession(agencyId, data);
        result = { message: 'Agency session cached successfully' };
        break;

      case 'commission':
        if (!agencyId || !data.saleAmount || !data.commission) {
          return NextResponse.json(
            { error: 'Agency ID, sale amount, and commission are required' },
            { status: 400 }
          );
        }
        await AgencyCacheManager.cacheCommission(
          agencyId,
          data.saleAmount,
          data.commission,
          data.tier || 'BRONZE'
        );
        result = { message: 'Commission cached successfully' };
        break;

      case 'metrics':
        if (!data) {
          return NextResponse.json(
            { error: 'Metrics data is required' },
            { status: 400 }
          );
        }
        await AgencyCacheManager.setAgencyMetrics(data);
        result = { message: 'Agency metrics cached successfully' };
        break;

      case 'performance':
        if (!agencyId || !data) {
          return NextResponse.json(
            { error: 'Agency ID and performance data are required' },
            { status: 400 }
          );
        }
        await AgencyCacheManager.trackAgencyPerformance(agencyId, data);
        result = { message: 'Agency performance tracked successfully' };
        break;

      case 'quota':
        if (!agencyId || !data) {
          return NextResponse.json(
            { error: 'Agency ID and quota data are required' },
            { status: 400 }
          );
        }
        await AgencyCacheManager.trackAgencyQuota(agencyId, data);
        result = { message: 'Agency quota tracked successfully' };
        break;

      case 'invalidate':
        if (!agencyId) {
          return NextResponse.json(
            { error: 'Agency ID is required for cache invalidation' },
            { status: 400 }
          );
        }
        await AgencyCacheManager.invalidateAgencyCache(agencyId);
        result = { message: 'Agency cache invalidated successfully' };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Valid actions: session, commission, metrics, performance, quota, invalidate' },
          { status: 400 }
        );
    }

    const duration = Date.now() - startTime;
    AdTopiaMonitoring.trackPerformance(
      `/api/agency/cache?action=${action}`,
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

    await AgencyCacheManager.invalidateAgencyCache(agencyId);

    const duration = Date.now() - startTime;
    AdTopiaMonitoring.trackPerformance(
      `/api/agency/cache?agencyId=${agencyId}`,
      duration
    );

    return NextResponse.json({
      success: true,
      message: 'Agency cache invalidated successfully',
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
