'use client'

import { useEffect, useRef } from 'react'
import { MemeTemplate } from '@/types/meme'

interface MemeCanvasProps {
  template?: MemeTemplate | null
  text: string
  generatedImageUrl?: string | null
}

export default function MemeCanvas({ template, text, generatedImageUrl }: MemeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 400
    canvas.height = 400

    // Clear canvas
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (generatedImageUrl) {
      // Display generated meme
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      }
      img.src = generatedImageUrl
    } else if (template) {
      // Display template with text overlay
      drawTemplateWithText(ctx, template, text)
    } else {
      // Display placeholder
      drawPlaceholder(ctx, text)
    }
  }, [template, text, generatedImageUrl])

  const drawTemplateWithText = (ctx: CanvasRenderingContext2D, template: MemeTemplate, text: string) => {
    // For now, draw a placeholder until we implement actual image loading
    ctx.fillStyle = '#e5e7eb'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Draw template name
    ctx.fillStyle = '#6b7280'
    ctx.font = '16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(template.name, ctx.canvas.width / 2, ctx.canvas.height / 2 - 20)

    // Draw text overlay
    if (text.trim()) {
      ctx.fillStyle = '#000000'
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      
      // Split text into lines
      const lines = wrapText(ctx, text, ctx.canvas.width - 40)
      const lineHeight = 30
      const startY = ctx.canvas.height / 2 + 20
      
      lines.forEach((line, index) => {
        const y = startY + (index * lineHeight)
        ctx.strokeText(line, ctx.canvas.width / 2, y)
        ctx.fillText(line, ctx.canvas.width / 2, y)
      })
    }
  }

  const drawPlaceholder = (ctx: CanvasRenderingContext2D, text: string) => {
    // Draw background
    ctx.fillStyle = '#f9fafb'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Draw border
    ctx.strokeStyle = '#d1d5db'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Draw placeholder text
    ctx.fillStyle = '#6b7280'
    ctx.font = '16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Select a template or enter a prompt', ctx.canvas.width / 2, ctx.canvas.height / 2 - 20)
    
    if (text.trim()) {
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 18px Arial'
      ctx.fillText(`"${text}"`, ctx.canvas.width / 2, ctx.canvas.height / 2 + 20)
    }
  }

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word
      const metrics = ctx.measureText(testLine)
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    
    if (currentLine) {
      lines.push(currentLine)
    }
    
    return lines
  }

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        className="border border-gray-300 rounded-lg shadow-sm"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  )
}