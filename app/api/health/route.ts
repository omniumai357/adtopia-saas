// Health check endpoint
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AdTopia SaaS API',
    version: '1.0.0'
  })
}
