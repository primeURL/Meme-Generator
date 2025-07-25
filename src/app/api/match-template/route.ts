import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenAI } from "@google/genai"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const ai = new GoogleGenAI({ apiKey: geminiKey })

async function extractKeywordsAndDescriptionWithGemini(prompt: string): Promise<{ tags: string[], description: string ,number_of_text :number}> {
  const contents = [
    {
      text: `You are an expert meme prompt analyst.
        Given the following meme prompt, extract:
         - A single vivid scene description (1 sentence)
         - 15 relevant, context-aware, SEO-friendly tags (comma separated, lowercase, no more than 3 words each)
         - Analyze the promt to determine how many distinct text overlays (e.g., characters, labels, speech/thought bubbles) can fit naturally in the image. Return an exact number (default is 2).
            Prompt: ${prompt}
            Output format:
                {
                  "description": \"...\",\n 
                  "relevant_tags": [\"tag1\", \"tag2\", ...],
                  "number_of_text" "2"
                }

        Return only the final JSON object. No additional explanation.`
    }
  ];
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents
  });
  //@ts-ignore
  const data = response && response?.candidates[0].content.parts[0].text
  // console.log('LLM Response - ',data)
  const res = cleanLLMJsonBlock(data)
  // console.log('cleaned res',res)
  return {
    tags: res.relevant_tags || [],
    description: res.description || '',
    number_of_text : Number(res.number_of_text) || 2
  }
}

function cleanLLMJsonBlock(rawString: any) {
  try {
    const cleanedRaw = rawString
      .replace(/^```json\s*/i, '')
      .replace(/```$/, '')
      .trim();
    const data = JSON.parse(cleanedRaw);
    const result: any = {};
    result.description = typeof data.description === 'string' ? data.description.trim() : '';
    const seen = new Set();
    result.relevant_tags = Array.isArray(data.relevant_tags)
      ? data.relevant_tags.map((tag: string) => tag.trim()).filter((tag: string) => {
        const key = tag.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      : [];
    return result;
  } catch (err) {
    return { description: '', relevant_tags: [] }
  }
}

export async function POST(req: NextRequest) {
  const { prompt } = await req.json()
  if (!prompt || typeof prompt !== 'string') {
    return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 })
  }

  // 1. Extract number_of_text from Gemini (already done)
  let tags: string[] = []
  let description = ''
  let number_of_text : any = null
  try {
    const result = await extractKeywordsAndDescriptionWithGemini(prompt)
    console.log('result----------1',result)
    tags = result.tags
    description = result.description
    number_of_text = result.number_of_text // Make sure Gemini returns this!
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to extract keywords from Gemini' }), { status: 500 })
  }

  // 2. Fetch all meme templates (make sure to select number_of_text)
  const { data: templates, error } = await supabase.from('meme_templates').select('*')
  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch templates' }), { status: 500 })
  }

  // 3. Score each template
  function scoreTemplate(template: any) {
    const desc = (template.description || '').toLowerCase()
    const templateTags = (template.tags || []).map((t: string) => t.toLowerCase())
    let score = 0

    // Tag and description overlap
    for (const tag of tags) {
      if (desc.includes(tag) || templateTags.some((t: string) => t.includes(tag))) {
        score++
      }
    }
    if (description) {
      const descWords = description.toLowerCase().split(/\W+/)
      for (const word of descWords) {
        if (word && desc.includes(word)) score += 0.5
      }
    }
    // console.log('inside scoreTemplate',number_of_text)
    // --- New: number_of_text matching ---
    // if (number_of_text !== null && template.number_of_text !== undefined) {
    //   if (template.number_of_text === number_of_text) {
    //     score += 2 // Strong bonus for exact match
    //   } else {
    //     // Penalize by difference (optional)
    //     score -= Math.abs(template.number_of_text - number_of_text) * 0.5
    //   }
    // }

    return score
  }

  // 4. Filter templates with score > 0 (at least one match)
  const scored = templates.map(t => ({ ...t, _score: scoreTemplate(t) }))
  // console.log('scored',scored)
  const matches = scored.filter(t => t._score > 0)
  matches.sort((a, b) => b._score - a._score)

  // Limit to top 5 matches
  const topMatches = matches.slice(0, 5)

  // console.log('matches', topMatches)
  if (topMatches.length === 0) {
    return new Response(JSON.stringify({ error: 'No matching templates found' }), { status: 404 })
  }

  return new Response(JSON.stringify({ templates: topMatches }), { status: 200 })
} 