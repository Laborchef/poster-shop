import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { NextResponse } from 'next/server'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const payload = await request.text()
  const signature = request.headers.get('stripe-signature')!
  
  let event
  try {
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
  
  const supabase = await createClient()
  
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const orderId = session.metadata?.orderId
      
      if (orderId) {
        await supabase
          .from('orders')
          .update({
            status: 'paid',
            stripe_payment_intent_id: session.payment_intent,
          })
          .eq('id', orderId)
        
        // TODO: Trigger WISO sync
      }
      break
    }
  }
  
  return NextResponse.json({ received: true })
}