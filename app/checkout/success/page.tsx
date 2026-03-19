'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Verify payment status
    if (sessionId) {
      setTimeout(() => setLoading(false), 1500)
    }
  }, [sessionId])
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Zahlung wird verarbeitet...</p>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle>Zahlung erfolgreich!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Vielen Dank für Ihre Bestellung. Sie erhalten eine Bestätigung per E-Mail.
          </p>
          
          <div className="pt-4 space-y-2">
            <Link href="/">
              <Button className="w-full">Weiter shoppen</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}