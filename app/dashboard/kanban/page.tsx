import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  in_print: 'bg-blue-100 text-blue-800',
  printed: 'bg-purple-100 text-purple-800',
  shipped: 'bg-gray-100 text-gray-800',
}

const statusLabels: Record<string, string> = {
  pending: 'Ausstehend',
  paid: 'Bezahlt',
  in_print: 'In Druck',
  printed: 'Gedruckt',
  shipped: 'Versendet',
}

const columns = [
  { id: 'paid', title: 'Bezahlt', color: 'bg-green-50 border-green-200' },
  { id: 'in_print', title: 'In Druck', color: 'bg-blue-50 border-blue-200' },
  { id: 'printed', title: 'Gedruckt', color: 'bg-purple-50 border-purple-200' },
  { id: 'shipped', title: 'Versendet', color: 'bg-gray-50 border-gray-200' },
]

async function getOrders() {
  const supabase = await createClient()
  
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, order_items(*, product:products(*)), profile:profiles(*)')
    .in('status', ['paid', 'in_print', 'printed', 'shipped'])
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return orders || []
}

export default async function KanbanPage() {
  const orders = await getOrders()
  
  const ordersByStatus = orders.reduce((acc: Record<string, any[]>, order) => {
    if (!acc[order.status]) acc[order.status] = []
    acc[order.status].push(order)
    return acc
  }, {})
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Produktion – Kanban</h1>
          <p className="text-muted-foreground">Visualer Workflow für die Produktion</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">← Zurück zur Listenansicht</Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => (
          <div key={column.id} className={`${column.color} rounded-lg border p-4`}>
            <h2 className="font-semibold mb-4 flex items-center justify-between">
              {column.title}
              <span className="text-sm bg-white px-2 py-1 rounded-full">
                {(ordersByStatus[column.id] || []).length}
              </span>
            </h2>
            
            <div className="space-y-3">
              {(ordersByStatus[column.id] || []).map((order) => (
                <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
                  <div className="bg-white p-3 rounded shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="font-medium text-sm">{order.order_number}</div>
                    <div className="text-xs text-muted-foreground">
                      {order.profile.first_name} {order.profile.last_name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {(order.total_cents / 100).toFixed(2)} € • {order.order_items.length} Artikel
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(order.created_at).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}