import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({
    apiKey : process.env.NEXT_PUBLIC_GEMINI_API_KEY
})

// Polyfill for base64 encoding in edge runtime
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('image') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 })
    }

    // Read the file as an ArrayBuffer and convert to base64
    const arrayBuffer = await file.arrayBuffer()
    const base64 = arrayBufferToBase64(arrayBuffer)

    const contents = [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64,
          },
        },
        {
          text: `
      You are the best visual meme analyst in the world.
      
      Your task is to:
      - Analyze the given meme image deeply.
      - Describe it in a single vivid sentence that captures what is happening visually and the humor or message behind it.
      - Identify and output exactly 10 relevant, context-aware, SEO-friendly tags.
      - Give Meaningfull Name to Image Template in 2-3 words
      
      Output format:
      {
        "description": [
          "Your single, rich, vivid sentence describing the meme."
        ],
        "relevant_tags": [
          "tag1",
          "tag2",
          "...up to tag10"
        ],
        "name" : "word1 word2 word3"
      }
      
      Guidelines:
      - Mention expressions, attire, body language, or emotions if visible.
      - Reflect the meme’s theme (e.g., sarcasm, modern life, irony, pop culture).
      - Tags should be lowercase, specific, and no more than 3 words each.
      - Avoid generic tags like 'meme' unless crucial to context.
      
      Return only the final JSON object. No additional explanation.
          `,
        },
      ];
      
      
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents
      });
    
     //@ts-ignore 
    const data = response && response?.candidates[0].content.parts[0].text
     //@ts-ignore 
    // console.log('description',data)
    const res = cleanLLMJsonBlock(data)
    console.log('res',res)
    
    return NextResponse.json({
      tags: res.relevant_tags,
      description: res.description,
      name : res.name
      // Optionally: base64Image: base64
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to classify image' }, { status: 500 })
  }
} 



function cleanLLMJsonBlock(rawString : any) {
    try {
      // Step 1: Remove triple backticks and "json" if present
      const cleanedRaw = rawString
        .replace(/^```json\s*/i, '')  // Remove starting ```json
        .replace(/```$/, '')          // Remove ending ```
        .trim();
  
      // Step 2: Parse the cleaned JSON string
      const data = JSON.parse(cleanedRaw);
     
      console.log('data----->>>',data)
      // Step 3: Initialize result object
      const result : any = {
       
      };
      
      // Step 4: Clean description array into single string
      result.description = Array.isArray(data.description)
        ? data.description.join(' ').replace(/\s+/g, ' ').trim()
        : '';
  
      // Step 5: Clean relevant_tags (remove duplicates, trim)
      const seen = new Set();
      result.relevant_tags = Array.isArray(data.relevant_tags)
        ? data.relevant_tags
            .map((tag: string) => tag.trim())
            .filter((tag: string) => {
              const key = tag.toLowerCase();
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            })
        : [];
      
        result.name = data.name ? data.name :  '';
  
      return result;
  
    } catch (err) {
      console.error("Error parsing or cleaning JSON:");
      return null;
    }
  }