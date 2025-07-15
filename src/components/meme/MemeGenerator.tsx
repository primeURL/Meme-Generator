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
  const [generatedMeme, setGeneratedMeme] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setIsGenerating(true)
    setErrorMsg(null)
    try {
      // Call the API to get the best-matching template
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
      const { template } = await res.json()
      // Draw the template image and overlay the prompt
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
      setGeneratedMeme(canvas.toDataURL('image/png'))
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

  const handleDownload = () => {
    if (generatedMeme) {
      const link = document.createElement('a')
      link.href = generatedMeme
      link.download = 'generated-meme.png'
      link.click()
    }
  }

  const handleShare = async () => {
    if (generatedMeme && navigator.share) {
      try {
        await navigator.share({
          title: 'Generated Meme',
          text: prompt,
          url: generatedMeme
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

      {generatedMeme && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Meme</CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button onClick={handleShare} variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <MemeCanvas
              template={selectedTemplate}
              text={prompt}
              generatedImageUrl={generatedMeme}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}