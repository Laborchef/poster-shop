import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { orderId } = await request.json()
  
  // Get order details
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*, product:products(*))')
    .eq('id', orderId)
    .single()
  
  if (error || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
  
  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'paypal'],
    line_items: order.order_items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `${item.product.name} (${item.product.format_size})`,
          description: item.product.material,
        },
        unit_amount: item.unit_price_cents,
      },
      quantity: item.quantity,
    })),
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
    metadata: {
      orderId: order.id,
    },
  })
  
  // Update order with Stripe session ID
  await supabase
    .from('orders')
    .update({ stripe_checkout_session_id: session.id })
    .eq('id', orderId)
  
  return NextResponse.json({ sessionId: session.id, url: session.url })
}