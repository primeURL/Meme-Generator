import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(req: NextRequest) {
  const { data, error } = await supabase.from('meme_templates').select('*').order('created_at', { ascending: false })
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
  return new Response(JSON.stringify({ memes: data }), { status: 200 })
} 