import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 })
  }
  const { name, tags, description } = await req.json()
  if (!name || !tags || !description) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 })
  }
  const { data, error } = await supabase.from('meme_templates').update({ name, tags, description }).eq('id', id).select()
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
  return new Response(JSON.stringify({ meme: data[0] }), { status: 200 })
} 