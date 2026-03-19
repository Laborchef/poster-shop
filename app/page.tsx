import { ProductCard } from '@/components/shop/product-card'
import { createClient } from '@/lib/supabase/server'

async function getProducts() {
  const supabase = await createClient()
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('base_price_cents')
  
  if (error) throw error
  return products || []
}

export default async function ShopPage() {
  const products = await getProducts()
  
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-4">Poster Shop</h1>
      <p className="text-muted-foreground mb-8 text-lg">
        Wählen Sie ein Format und erstellen Sie Ihr individuelles Poster
      </p>
      
      {products.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Keine Produkte verfügbar. Bitte später wiederkommen.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}