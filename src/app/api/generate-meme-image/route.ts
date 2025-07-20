import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY
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
    const { imageUrl, prompt } = await req.json()
    
    if (!imageUrl || !prompt) {
      return NextResponse.json({ error: 'Image URL and prompt are required' }, { status: 400 })
    }

    // Fetch the image and convert to base64
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch template image' }, { status: 400 })
    }
    
    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = arrayBufferToBase64(imageBuffer)

    const contents = [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
      {
        text: `
You are an expert meme creator. Your task is to create a meme by overlaying text on the given template image.

Template Image: The image above
Prompt: "${prompt}"

Instructions:
1. Analyze the template image to understand its context and visual elements
2. Determine the optimal placement for the text that will make the meme funny and visually appealing
3. Consider the meme's theme, expressions, and visual composition
4. Place the text in a way that enhances the humor and readability
5. Use appropriate text styling (size, color, position) that works well with the image

Return the final meme image with the text overlay as a base64-encoded PNG image.

If you cannot generate the image directly, return JSON with placement instructions:
{
  "instructions": {
    "text": "the text to display",
    "position": "top|bottom|center",
    "fontSize": 28,
    "color": "#000000",
    "strokeColor": "#ffffff",
    "strokeWidth": 4,
    "alignment": "center"
  }
}

Return only the final image or JSON instructions. No additional explanation.
        `,
      },
    ]

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: contents
    })

   
    console.log('response',response)
     //@ts-ignore 
    const data = response && response?.candidates[0].content.parts[0].text
    console.log('data---gmi',data)
    // Try to parse as JSON (instructions) first
    try {
      const jsonData = JSON.parse(data!)
      if (jsonData.instructions) {
        return NextResponse.json({
          type: 'instructions',
          instructions: jsonData.instructions
        })
      }
    } catch (e) {
      // Not JSON, assume it's base64 image data
    }

    // Check if the response contains base64 image data
    if (data && data.includes('data:image/')) {
      return NextResponse.json({
        type: 'image',
        imageData: data
      })
    }

    // If we can't determine the format, return instructions for frontend rendering
    return NextResponse.json({
      type: 'instructions',
      instructions: {
        text: prompt,
        position: 'bottom',
        fontSize: 28,
        color: '#000000',
        strokeColor: '#ffffff',
        strokeWidth: 4,
        alignment: 'center'
      }
    })

  } catch (error) {
    console.error('Error generating meme image:', error)
    return NextResponse.json({ error: 'Failed to generate meme image' }, { status: 500 })
  }
} 