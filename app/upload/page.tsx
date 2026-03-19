'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ImageUploader } from '@/components/upload/image-uploader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function UploadContent() {
  const searchParams = useSearchParams()
  const productId = searchParams.get('product')
  const [product, setProduct] = useState<any>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
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
  
  const handleImageSelect = (file: File | null, previewUrl: string) => {
    setSelectedFile(file)
    setPreview(previewUrl)
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
      
      <h1 className="text-3xl font-bold mb-2">Eigenes Bild hochladen</h1>
      <p className="text-muted-foreground mb-8">
        Laden Sie Ihr Bild hoch. Wir passen es automatisch an das Format an.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <ImageUploader
            aspectRatio={product.aspect_ratio || 1.5}
            onImageSelect={handleImageSelect}
          />
        </div>
        
        <div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Format: {product.format_size}</p>
                <p>Material: {product.material}</p>
                <p>Seitenverhältnis: {product.aspect_ratio}:1</p>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Preis:</span>
                  <span className="text-2xl font-bold">{(product.base_price_cents / 100).toFixed(2)} €</span>
                </div>
              </div>
              
              <Button
                className="w-full"
                size="lg"
                disabled={!selectedFile}
                onClick={() => {/* TODO: Continue to checkout */}}
              >
                {selectedFile ? 'Weiter zur Vorschau' : 'Bitte Bild auswählen'}
              </Button>
              
              {!selectedFile && (
                <p className="text-xs text-muted-foreground text-center">
                  Wählen Sie ein Bild aus, um fortzufahren
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-12">Laden...</div>}>
      <UploadContent />
    </Suspense>
  )
}