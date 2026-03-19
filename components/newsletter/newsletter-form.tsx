'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle } from 'lucide-react'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setStatus('loading')
    
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        setStatus('success')
        setMessage(data.message)
        setEmail('')
        setFirstName('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Ein Fehler ist aufgetreten')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später.')
    }
  }
  
  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="w-5 h-5" />
        <span>{message}</span>
      </div>
    )
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Vorname (optional)"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="max-w-[140px]"
        />
        <Input
          type="email"
          placeholder="Ihre E-Mail-Adresse"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        
        <Button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? '...' : 'Anmelden'}
        </Button>
      </div>
      
      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        Abmeldung jederzeit möglich. Wir geben Ihre Daten nicht weiter.
      </p>
    </form>
  )
}