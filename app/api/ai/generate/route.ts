import { createClient } from '@/lib/supabase/server'
import { generateImage } from '@/lib/replicate/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { prompt, productId } = await request.json()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Check user's monthly generation limit
  const { data: monthlyGenerations } = await supabase
    .from('ai_generations')
    .select('id')
    .eq('user_id', user.id)
    .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
  
  if (monthlyGenerations && monthlyGenerations.length >= 15) {
    return NextResponse.json(
      { error: 'Monatliches Limit erreicht (15/15)' },
      { status: 429 }
    )
  }
  
  // Check session limit (last hour)
  const { data: recentGenerations } = await supabase
    .from('ai_generations')
    .select('id')
    .eq('user_id', user.id)
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
  
  if (recentGenerations && recentGenerations.length >= 5) {
    return NextResponse.json(
      { error: 'Stündliches Limit erreicht (5/5)' },
      { status: 429 }
    )
  }
  
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/replicate`
  
  try {
    // Get product aspect ratio
    const { data: product } = await supabase
      .from('products')
      .select('aspect_ratio')
      .eq('id', productId)
      .single()
    
    const aspectRatio = product?.aspect_ratio 
      ? `${Math.round(product.aspect_ratio * 10)}:${10}`
      : '3:2'
    
    const prediction = await generateImage(prompt, aspectRatio, webhookUrl)
    
    // Store generation in database
    const { data: generation, error } = await supabase.from('ai_generations').insert({
      user_id: user.id,
      prompt,
      replicate_prediction_id: prediction.id,
      status: 'pending',
    }).select().single()
    
    if (error) throw error
    
    return NextResponse.json({ 
      generationId: generation.id,
      predictionId: prediction.id,
      status: 'pending'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}