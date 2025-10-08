import { NextRequest, NextResponse } from 'next/server';
import { loadBalancer } from '@/src/config/loadBalancer';
import { healthCheck } from '@/src/config/scaling';
import { monitoring } from '@/src/utils/monitoring';

// Load Balancer Status API for AdTopia revenue system
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';

    let result: any = null;

    switch (action) {
      case 'status':
        result = loadBalancer.getStatus();
        break;

      case 'health':
        result = await healthCheck();
        break;

      case 'servers':
        result = {
          all: loadBalancer.getAllServers(),
          healthy: loadBalancer.getHealthyServers(),
          count: {
            total: loadBalancer.getAllServers().length,
            healthy: loadBalancer.getHealthyServers().length,
            unhealthy: loadBalancer.getAllServers().filter(s => s.status === 'unhealthy').length,
          },
        };
        break;

      case 'metrics':
        result = loadBalancer.getMetrics();
        break;

      case 'select-server':
        const selectedServer = loadBalancer.selectServer();
        result = {
          selected: selectedServer,
          algorithm: loadBalancer.getStatus().config.algorithm,
          available: selectedServer ? 'yes' : 'no',
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Valid actions: status, health, servers, metrics, select-server' },
          { status: 400 }
        );
    }

    const duration = Date.now() - startTime;
    
    // Track API call
    monitoring.trackAPICall(`/api/load-balancer/status?action=${action}`, duration, 200);

    return NextResponse.json({
      success: true,
      action,
      data: result,
      timestamp: new Date().toISOString(),
      duration,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    monitoring.trackError(error as Error, { action: 'load_balancer_status_get' });

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
    const { action, data } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    let result: any = null;

    switch (action) {
      case 'add-server':
        if (!data?.id || !data?.host || !data?.port) {
          return NextResponse.json(
            { error: 'Server ID, host, and port are required' },
            { status: 400 }
          );
        }
        loadBalancer.addServer({
          id: data.id,
          host: data.host,
          port: data.port,
          weight: data.weight || 1,
        });
        result = { message: `Server ${data.id} added successfully` };
        break;

      case 'remove-server':
        if (!data?.id) {
          return NextResponse.json(
            { error: 'Server ID is required' },
            { status: 400 }
          );
        }
        loadBalancer.removeServer(data.id);
        result = { message: `Server ${data.id} removed successfully` };
        break;

      case 'update-server-status':
        if (!data?.id || !data?.status) {
          return NextResponse.json(
            { error: 'Server ID and status are required' },
            { status: 400 }
          );
        }
        loadBalancer.updateServerStatus(data.id, data.status);
        result = { message: `Server ${data.id} status updated to ${data.status}` };
        break;

      case 'record-request':
        if (!data?.serverId) {
          return NextResponse.json(
            { error: 'Server ID is required' },
            { status: 400 }
          );
        }
        loadBalancer.recordRequest(data.serverId);
        result = { message: `Request recorded for server ${data.serverId}` };
        break;

      case 'record-error':
        if (!data?.serverId) {
          return NextResponse.json(
            { error: 'Server ID is required' },
            { status: 400 }
          );
        }
        loadBalancer.recordError(data.serverId);
        result = { message: `Error recorded for server ${data.serverId}` };
        break;

      case 'test-load-balancer':
        result = {
          status: 'operational',
          servers: loadBalancer.getAllServers().length,
          healthy: loadBalancer.getHealthyServers().length,
          algorithm: loadBalancer.getStatus().config.algorithm,
          healthChecks: 'running',
          metrics: 'collecting',
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Valid actions: add-server, remove-server, update-server-status, record-request, record-error, test-load-balancer' },
          { status: 400 }
        );
    }

    const duration = Date.now() - startTime;
    monitoring.trackAPICall(`/api/load-balancer/status?action=${action}`, duration, 200);

    return NextResponse.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString(),
      duration,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    monitoring.trackError(error as Error, { action: 'load_balancer_status_post' });

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
