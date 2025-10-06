// Stripe webhook handler
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    // Mock webhook handling for now (until Stripe is properly configured)
    console.log('Webhook received:', { signature: signature?.substring(0, 20) + '...' })
    
    // Parse the webhook body to get event type
    let event
    try {
      event = JSON.parse(body)
    } catch (e) {
      console.error('Error parsing webhook body:', e)
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      console.log('Checkout completed:', {
        session_id: session.id,
        customer_email: session.customer_email,
        amount_total: session.amount_total
      })
      
      // Mock response - in production this would store in Supabase
      console.log('Purchase would be stored:', {
        email: session.customer_email || '',
        product: session.metadata?.product || 'Unknown',
        price: session.amount_total || 0,
        stripe_session_id: session.id,
      })
    }

    return NextResponse.json({ 
      received: true, 
      message: 'Webhook processed (mock mode)',
      event_type: event.type 
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}
