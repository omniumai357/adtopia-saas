// Stripe Products Report API
// AdTopia SaaS - Product Creation Analytics

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const project = searchParams.get('project')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Mock data for now (until Supabase is properly configured)
    const mockData = {
      recent_products: [
        {
          id: '1',
          project: 'adtopia',
          name: 'Preview Package',
          price_usd: 29,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          project: 'adtopia',
          name: 'Full Package',
          price_usd: 297,
          created_at: new Date().toISOString()
        }
      ],
      summary: {
        total_products: 2,
        total_value: 326,
        project: project || 'adtopia'
      },
      report: []
    }

    return NextResponse.json({
      success: true,
      data: mockData,
      message: 'Mock data - Supabase integration pending'
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { project, stripe_product_id, name, price_usd, metadata } = body

    // Validate required fields
    if (!project || !stripe_product_id || !name || !price_usd) {
      return NextResponse.json({ 
        error: 'Missing required fields: project, stripe_product_id, name, price_usd' 
      }, { status: 400 })
    }

    // Mock response for now (until Supabase is properly configured)
    return NextResponse.json({
      success: true,
      log_id: 'mock_' + Date.now(),
      message: 'Product logged successfully (mock)',
      data: {
        project,
        stripe_product_id,
        name,
        price_usd,
        metadata
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
