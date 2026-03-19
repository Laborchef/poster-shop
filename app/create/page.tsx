'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function CreateContent() {
  const searchParams = useSearchParams()
  const productId = searchParams.get('product')
  const [product, setProduct] = useState<any>(null)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const supabase = createClient()
  
  useEffect(() => {
    if (productId) {
      supabase.from('products').select('*').eq('id', productId).single()
        .then(({ data, error }) => {
          if (!error) setProduct(data)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [productId])
  
  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setGenerating(true)
    // TODO: Call AI generation API
    setTimeout(() => setGenerating(false), 2000)
  }
  
  if (loading) return <div className="container mx-auto py-12">Laden...</div>
  if (!product) return (
    <div className="container mx-auto py-12">
      <p className="text-muted-foreground">Kein Produkt ausgewählt.</p>
      <Link href="/" className="text-primary hover:underline">
        ← Zurück zum Shop
      </Link>
    </div>
  )
  
  return (
    <div className="container mx-auto py-12 px-4">
      <Link href="/" className="text-muted-foreground hover:text-foreground mb-4 inline-block">
        ← Zurück zum Shop
      </Link>
      
      <h1 className="text-3xl font-bold mb-2">KI Poster erstellen</h1>
      <p className="text-muted-foreground mb-8">
        Beschreiben Sie Ihr Wunschmotiv. Die KI generiert ein passendes Bild.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Textarea
            placeholder="Beschreiben Sie Ihr Poster...

Beispiel: Ein majestätischer Adler, der über verschneite Berggipfel fliegt, goldene Stunde, dramatische Wolken"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            className="resize-none"
          />
          
          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              size="lg"
              disabled={!prompt.trim() || generating}
              onClick={handleGenerate}
            >
              {generating ? 'Wird generiert...' : 'Bild generieren'}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Die Generierung dauert ca. 10-30 Sekunden. Sie erhalten 3 Varianten zur Auswahl.
          </p>
        </div>
        
        <div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Format: {product.format_size}</p>
                <p>Material: {product.material}</p>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Preis:</span>
                  <span className="text-2xl font-bold">{(product.base_price_cents / 100).toFixed(2)} €</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-12">Laden...</div>}>
      <CreateContent />
    </Suspense>
  )
}