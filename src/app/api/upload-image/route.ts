import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export const runtime = 'nodejs' // Ensure this runs in Node.js, not edge

export async function POST(req: NextRequest) {
  try {
    // Parse multipart form data using the Web API
    const formData = await req.formData()
    const file = formData.get('image') as File | null
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 })
    }
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const path = `memes/${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage.from('memes').upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    })
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/memes/${data.path}`
    console.log('publicUrl',publicUrl)
    return new Response(JSON.stringify({ imageUrl: publicUrl }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500 })
  }
}
