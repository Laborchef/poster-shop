import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  format_size: string
  base_price_cents: number
  material: string
}

export function ProductCard({ product }: { product: Product }) {
  const price = (product.base_price_cents / 100).toFixed(2)
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        <div className="text-sm text-muted-foreground flex-1">
          <p>Format: {product.format_size}</p>
          <p>Material: {product.material}</p>
        </div>
        
        <div className="text-2xl font-bold">{price} €</div>
        
        <div className="flex gap-2">
          <Link href={`/upload?product=${product.id}`} className="flex-1">
            <Button className="w-full">Eigenes Bild</Button>
          </Link>
          <Link href={`/create?product=${product.id}`} className="flex-1">
            <Button variant="outline" className="w-full">KI Erstellen</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}