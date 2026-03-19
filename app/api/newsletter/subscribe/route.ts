import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { email, firstName } = await request.json()
  
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Ungültige E-Mail-Adresse' }, { status: 400 })
  }
  
  try {
    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, is_active')
      .eq('email', email.toLowerCase().trim())
      .single()
    
    if (existing?.is_active) {
      return NextResponse.json({ 
        success: true, 
        message: 'Sie sind bereits angemeldet' 
      })
    }
    
    // Reactivate if previously unsubscribed
    if (existing && !existing.is_active) {
      await supabase
        .from('newsletter_subscribers')
        .update({ 
          is_active: true, 
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null
        })
        .eq('id', existing.id)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Willkommen zurück! Sie wurden wieder angemeldet.' 
      })
    }
    
    // New subscriber
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: email.toLowerCase().trim(),
        first_name: firstName?.trim() || null,
        source: 'website',
      })
    
    if (error) throw error
    
    return NextResponse.json({ 
      success: true, 
      message: 'Vielen Dank für Ihre Anmeldung!' 
    })
  } catch (error: any) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es später erneut.' },
      { status: 500 }
    )
  }
}