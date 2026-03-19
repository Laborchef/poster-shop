import { OrdersTable } from '@/components/admin/orders-table'
import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

async function getOrders() {
  const supabase = await createClient()
  
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, order_items(*, product:products(*)), profile:profiles(*)')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return orders || []
}

export default async function DashboardPage() {
  const orders = await getOrders()
  
  const statusCounts = orders.reduce((acc: Record<string, number>, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {})
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Bestellungen verwalten und Produktion steuern</p>
        </div>
        <Link href="/dashboard/kanban">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            Kanban Ansicht
          </button>
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { status: 'pending', label: 'Ausstehend', color: 'bg-yellow-100 text-yellow-800' },
          { status: 'paid', label: 'Bezahlt', color: 'bg-green-100 text-green-800' },
          { status: 'in_print', label: 'In Druck', color: 'bg-blue-100 text-blue-800' },
          { status: 'printed', label: 'Gedruckt', color: 'bg-purple-100 text-purple-800' },
          { status: 'shipped', label: 'Versendet', color: 'bg-gray-100 text-gray-800' },
        ].map(({ status, label, color }) => (
          <div key={status} className={`p-4 rounded-lg ${color}`}>
            <div className="text-2xl font-bold">{statusCounts[status] || 0}</div>
            <div className="text-sm">{label}</div>
          </div>
        ))}
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Alle ({orders.length})</TabsTrigger>
          <TabsTrigger value="action">Aktion nötig ({(statusCounts.pending || 0) + (statusCounts.paid || 0)})</TabsTrigger>
          <TabsTrigger value="production">In Produktion ({(statusCounts.in_print || 0) + (statusCounts.printed || 0)})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <OrdersTable orders={orders} />
        </TabsContent>
        
        <TabsContent value="action">
          <OrdersTable orders={orders.filter(o => ['pending', 'paid'].includes(o.status))} />
        </TabsContent>
        
        <TabsContent value="production">
          <OrdersTable orders={orders.filter(o => ['in_print', 'printed'].includes(o.status))} />
        </TabsContent>
      </Tabs>
    </div>
  )
}