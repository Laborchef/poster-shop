'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Order {
  id: string
  order_number: string
  status: string
  total_cents: number
  created_at: string
  profile: {
    first_name: string
    last_name: string
    email: string
  }
  order_items: Array<{
    quantity: number
    product: {
      name: string
      format_size: string
    }
  }>
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  paid: 'bg-green-100 text-green-800 hover:bg-green-200',
  in_print: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  printed: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  shipped: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  cancelled: 'bg-red-100 text-red-800 hover:bg-red-200',
}

const statusLabels: Record<string, string> = {
  pending: 'Ausstehend',
  paid: 'Bezahlt',
  in_print: 'In Druck',
  printed: 'Gedruckt',
  shipped: 'Versendet',
  cancelled: 'Storniert',
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Kunde</TableHead>
            <TableHead>Produkte</TableHead>
            <TableHead>Gesamt</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Datum</TableHead>
            <TableHead>Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                Keine Bestellungen vorhanden
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.order_number}</TableCell>
                <TableCell>
                  <div>{order.profile.first_name} {order.profile.last_name}</div>
                  <div className="text-sm text-muted-foreground">{order.profile.email}</div>
                </TableCell>
                <TableCell>
                  {order.order_items.map((item, i) => (
                    <div key={i} className="text-sm">
                      {item.product.name} ({item.product.format_size}) ×{item.quantity}
                    </div>
                  ))}
                </TableCell>
                <TableCell className="font-medium">{(order.total_cents / 100).toFixed(2)} €</TableCell>
                <TableCell>
                  <Badge className={statusColors[order.status] || 'bg-gray-100'}>
                    {statusLabels[order.status] || order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(order.created_at).toLocaleDateString('de-DE')}
                </TableCell>
                <TableCell>
                  <Link href={`/dashboard/orders/${order.id}`}>
                    <Button size="sm" variant="outline">Details</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}