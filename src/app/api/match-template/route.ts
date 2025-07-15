import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(req: NextRequest) {
  debugger
  const { prompt } = await req.json()
  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
  }

  // Fetch all meme templates
  const { data: templates, error } = await supabase
    .from('meme_templates')
    .select('*')

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }

  // Simple keyword matching: score by number of prompt words in description/tags
  const promptWords = prompt.toLowerCase().split(/\s+/)
  let bestScore = -1
  let bestTemplate = null

  console.log('promptWords',promptWords)
  console.log('templates',templates)
  for (const template of templates) {
    let score = 0
    const desc = (template.description || '').toLowerCase()
    const tags = (template.tags || []).map((t: string) => t.toLowerCase()).join(' ')
    for (const word of promptWords) {
      if (desc.includes(word) || tags.includes(word)) {
        score++
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestTemplate = template
    }
  }

  if (!bestTemplate) {
    return NextResponse.json({ error: 'No matching template found' }, { status: 404 })
  }

  return NextResponse.json({ template: bestTemplate })
} 