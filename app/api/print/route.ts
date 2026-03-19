import { createClient } from '@/lib/supabase/server'
import { preparePrintJob } from '@/lib/print/print-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { orderId } = await request.json()
  
  try {
    // Get order details
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*, product:products(*)), profile:profiles(*)')
      .eq('id', orderId)
      .single()
    
    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    // Check if already printed
    if (order.status !== 'paid') {
      return NextResponse.json(
        { error: 'Order must be paid before printing' },
        { status: 400 }
      )
    }
    
    // TODO: Get image buffer from storage
    // For now, create placeholder
    const imageBuffer = Buffer.from([])
    
    // Prepare print job
    const folderPath = await preparePrintJob({
      orderId: order.id,
      orderNumber: order.order_number,
      imageBuffer,
      format: {
        widthMm: 420, // A2 width
        heightMm: 594, // A2 height
        dpi: 300,
      },
      customer: {
        name: `${order.profile.first_name} ${order.profile.last_name}`,
        address: order.shipping_address?.street || '',
        city: order.shipping_address?.city || '',
        zip: order.shipping_address?.zip || '',
      },
      order: {
        format: order.order_items[0]?.product.format_size || 'A2',
        material: order.order_items[0]?.product.material || 'Matte Paper',
        quantity: order.order_items.reduce((sum: number, item: any) => sum + item.quantity, 0),
        pricePoster: `${(order.subtotal_cents / 100).toFixed(2)} €`,
        priceShipping: `${(order.shipping_cents / 100).toFixed(2)} €`,
        priceTotal: `${(order.total_cents / 100).toFixed(2)} €`,
        paid: order.status === 'paid',
        paymentMethod: 'Stripe',
      },
    })
    
    // Update order status
    await supabase
      .from('orders')
      .update({
        status: 'in_print',
        print_folder_path: folderPath,
      })
      .eq('id', orderId)
    
    return NextResponse.json({ success: true, folderPath })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}