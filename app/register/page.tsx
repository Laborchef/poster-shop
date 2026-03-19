'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    })
    
    if (error) {
      alert(error.message)
    } else {
      // Create profile
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
        })
      }
      alert('Registrierung erfolgreich! Bitte bestätigen Sie Ihre E-Mail.')
      window.location.href = '/login'
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Registrieren</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Vorname"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                placeholder="Nachname"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <Input
              type="email"
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Passwort (min. 6 Zeichen)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Wird registriert...' : 'Registrieren'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Bereits ein Konto?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Anmelden
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}