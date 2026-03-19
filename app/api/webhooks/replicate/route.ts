import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const payload = await request.json()
  
  // Verify webhook is from Replicate
  // In production, verify signature here
  
  const supabase = await createClient()
  
  // Handle prediction completion
  if (payload.status === 'succeeded' && payload.output) {
    const { data: generation, error: findError } = await supabase
      .from('ai_generations')
      .select('*')
      .eq('replicate_prediction_id', payload.id)
      .single()
    
    if (findError || !generation) {
      return NextResponse.json({ error: 'Generation not found' }, { status: 404 })
    }
    
    // Update generation with result
    await supabase
      .from('ai_generations')
      .update({
        status: 'completed',
        output_url: payload.output,
        cost_cents: Math.round((payload.metrics?.predict_time || 0) * 3), // ~$0.03 per image
        completed_at: new Date().toISOString(),
      })
      .eq('id', generation.id)
  }
  
  // Handle failure
  if (payload.status === 'failed') {
    await supabase
      .from('ai_generations')
      .update({
        status: 'failed',
      })
      .eq('replicate_prediction_id', payload.id)
  }
  
  return NextResponse.json({ received: true })
}