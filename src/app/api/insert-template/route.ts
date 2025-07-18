import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(req: NextRequest) {
  try {
    const { name, imageUrl, description, tags } = await req.json()
    if (!name || !imageUrl || !description || !tags) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
    }
    const { data, error } = await supabase.from('meme_templates').insert([
      {
        name,
        image_url: imageUrl,
        description,
        tags,
      },
    ]).select()
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
    return new Response(JSON.stringify({ template: data[0] }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to insert template' }), { status: 500 })
  }
} 