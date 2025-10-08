import { NextRequest, NextResponse } from 'next/server';
import { healthCheck } from '@/src/config/scaling';
import { monitoring } from '@/src/utils/monitoring';

// Health check endpoint for load balancer
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const healthStatus = await healthCheck();
    
    const duration = Date.now() - startTime;
    
    // Track health check
    monitoring.trackAPICall('/health', duration, 200);
    
    return NextResponse.json(healthStatus, { status: 200 });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    monitoring.trackError(error as Error, { endpoint: 'health_check' });
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
      },
      { status: 503 }
    );
  }
}
