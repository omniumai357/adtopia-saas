// Stripe webhook handler
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/src/lib/supabase'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      
      // Store purchase in Supabase
      const { error } = await supabase
        .from('purchases')
        .insert({
          email: session.customer_email || '',
          product: session.metadata?.product || 'Unknown',
          price: session.amount_total || 0,
          stripe_session_id: session.id,
        })

      if (error) {
        console.error('Error storing purchase:', error)
        return NextResponse.json({ error: 'Failed to store purchase' }, { status: 500 })
      }

      console.log('Purchase stored successfully:', session.id)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}
