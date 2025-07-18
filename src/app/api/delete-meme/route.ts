import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 })
  }
  const { error } = await supabase.from('meme_templates').delete().eq('id', id)
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 })
} 