'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle>Zahlung abgebrochen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Die Zahlung wurde abgebrochen. Ihr Warenkorb wurde gespeichert.
          </p>
          
          <div className="pt-4 space-y-2">
            <Link href="/">
              <Button className="w-full">Zurück zum Shop</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}