import { createClient } from '@/lib/supabase/server'
import { wiso } from '@/lib/wiso/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { orderId } = await request.json()
  
  try {
    // Get order with customer details
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, profile:profiles(*), order_items(*, product:products(*))')
      .eq('id', orderId)
      .single()
    
    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    // Log sync attempt
    await supabase.from('wiso_sync_log').insert({
      entity_type: 'customer',
      entity_id: orderId,
      operation: 'create',
      status: 'pending',
      request_payload: { order_id: orderId },
    })
    
    // Create or get WISO customer
    const customerId = await wiso.createCustomer({
      name: `${order.profile.first_name} ${order.profile.last_name}`,
      street: order.shipping_address?.street || '',
      zip: order.shipping_address?.zip || '',
      city: order.shipping_address?.city || '',
      country: order.shipping_address?.country || 'DE',
      email: order.profile.email,
      phone: order.profile.phone,
    })
    
    // Create WISO invoice
    const invoiceId = await wiso.createInvoice({
      customer_id: customerId,
      date: new Date().toISOString().split('T')[0],
      items: order.order_items.map((item: any) => ({
        description: `${item.product.name} (${item.product.format_size})`,
        quantity: item.quantity,
        unit_price: item.unit_price_cents / 100,
        tax_rate: 19,
      })),
    })
    
    // Update order with WISO IDs
    await supabase
      .from('orders')
      .update({
        wiso_customer_id: customerId,
        wiso_invoice_id: invoiceId,
      })
      .eq('id', orderId)
    
    // Update sync log
    await supabase.from('wiso_sync_log').insert({
      entity_type: 'invoice',
      entity_id: orderId,
      operation: 'create',
      status: 'success',
      response_data: { customer_id: customerId, invoice_id: invoiceId },
    })
    
    return NextResponse.json({ success: true, customerId, invoiceId })
  } catch (error: any) {
    // Log error
    await supabase.from('wiso_sync_log').insert({
      entity_type: 'invoice',
      entity_id: orderId,
      operation: 'create',
      status: 'failed',
      error_message: error.message,
    })
    
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}