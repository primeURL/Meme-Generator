export interface MemeTemplate {
  id: string
  name: string
  imageUrl: string
  description?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface GeneratedMeme {
  id: string
  prompt: string
  templateId: string
  imageUrl: string
  createdAt: string
}

export interface MemeGenerationRequest {
  prompt: string
  templateId?: string
}

export interface TextOverlay {
  text: string
  x: number
  y: number
  fontSize: number
  fontFamily: string
  color: string
  strokeColor: string
  strokeWidth: number
}