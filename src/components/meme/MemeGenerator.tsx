'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Download, Share2 } from 'lucide-react'
import MemeCanvas from './MemeCanvas'
import TemplateSelector from './TemplateSelector'
import { MemeTemplate, MemeGenerationRequest } from '@/types/meme'

export default function MemeGenerator() {
  const [prompt, setPrompt] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMemes, setGeneratedMemes] = useState<{ image: string, template: any }[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setIsGenerating(true)
    setErrorMsg(null)
    setGeneratedMemes([])
    try {
      // Call the API to get all matching templates
      const res = await fetch('/api/match-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      if (!res.ok) {
        const err = await res.json()
        setErrorMsg(err.error || 'Failed to find a matching template')
        setIsGenerating(false)
        return
      }
      const { templates } = await res.json()
      if (!Array.isArray(templates) || templates.length === 0) {
        setErrorMsg('No matching templates found')
        setIsGenerating(false)
        return
      }
      // For each template, generate a meme image
      const memeImages: { image: string, template: any }[] = []
      for (const template of templates) {
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        img.src = template.image_url
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
        })
        const canvas = document.createElement('canvas')
        canvas.width = 400
        canvas.height = 400
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        ctx.font = 'bold 28px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.lineWidth = 4
        ctx.strokeStyle = '#fff'
        ctx.fillStyle = '#000'
        const lines = wrapText(ctx, prompt, canvas.width - 40)
        const lineHeight = 36
        let y = canvas.height - 20 - (lines.length - 1) * lineHeight
        for (const line of lines) {
          ctx.strokeText(line, canvas.width / 2, y)
          ctx.fillText(line, canvas.width / 2, y)
          y += lineHeight
        }
        memeImages.push({ image: canvas.toDataURL('image/png'), template })
      }
      setGeneratedMemes(memeImages)
    } catch (error) {
      setErrorMsg('Error generating meme')
      console.error('Error generating meme:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Helper to wrap text into lines for the canvas
  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''
    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)
    return lines
  }

  const handleDownload = (image: string) => {
    const link = document.createElement('a')
    link.href = image
    link.download = 'generated-meme.png'
    link.click()
  }

  const handleShare = async (image: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Generated Meme',
          url: image
        })
      } catch (error) {
        console.error('Error sharing meme:', error)
      }
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Meme Generator</CardTitle>
          <CardDescription>
            Enter a prompt to generate a meme or select a template to customize
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium">
              Meme Prompt
            </label>
            <Textarea
              id="prompt"
              placeholder="Enter your meme idea... (e.g., 'When you realize it's Monday tomorrow')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* <TemplateSelector
            selectedTemplate={selectedTemplate}
            onTemplateSelect={setSelectedTemplate}
          /> */}

          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Meme...
              </>
            ) : (
              'Generate Meme'
            )}
          </Button>
          {errorMsg && (
            <div className="text-red-500 text-sm mt-2">{errorMsg}</div>
          )}
        </CardContent>
      </Card>

      {/* Render generated memes grid */}
      {generatedMemes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {generatedMemes.map(({ image, template }, idx) => (
            <div key={template.id || idx} className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center">
              <div className="mb-2 font-semibold text-center text-blue-700">{template.name}</div>
              <img src={image} alt="Generated Meme" className="rounded-lg shadow max-w-full max-h-80 mb-2" />
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleDownload(image)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded shadow text-sm">Download</button>
                <button onClick={() => handleShare(image)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded shadow text-sm">Share</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}