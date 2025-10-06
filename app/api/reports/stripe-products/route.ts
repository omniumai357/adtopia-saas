// Stripe Products Report API
// AdTopia SaaS - Product Creation Analytics

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/src/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const project = searchParams.get('project')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get recent products
    const { data: recentProducts, error: recentError } = await supabase
      .rpc('get_recent_stripe_products', { p_limit: limit })

    if (recentError) {
      console.error('Error fetching recent products:', recentError)
      return NextResponse.json({ error: 'Failed to fetch recent products' }, { status: 500 })
    }

    // Get summary by project
    const { data: summary, error: summaryError } = await supabase
      .rpc('get_stripe_products_summary', { p_project: project })

    if (summaryError) {
      console.error('Error fetching summary:', summaryError)
      return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 })
    }

    // Get full report view
    const { data: report, error: reportError } = await supabase
      .from('stripe_products_report')
      .select('*')
      .order('total_value', { ascending: false })

    if (reportError) {
      console.error('Error fetching report:', reportError)
      return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        recent_products: recentProducts,
        summary: summary,
        report: report,
        filters: {
          project: project,
          limit: limit
        }
      }
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

    // Log product creation
    const { data, error } = await supabase.rpc('log_stripe_product_creation', {
      p_project: project,
      p_stripe_product_id: stripe_product_id,
      p_name: name,
      p_price_usd: price_usd,
      p_metadata: metadata || null
    })

    if (error) {
      console.error('Error logging product:', error)
      return NextResponse.json({ error: 'Failed to log product' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      log_id: data,
      message: 'Product logged successfully'
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
