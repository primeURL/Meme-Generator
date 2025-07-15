import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MemeTemplate } from '@/types/meme'

export function useTemplates() {
  const [templates, setTemplates] = useState<MemeTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('meme_templates')
        .select('*')
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Error fetching templates:', error)
        setError('Failed to load templates')
        return
      }
      
      // Transform data to match our interface
      const transformedTemplates: MemeTemplate[] = data.map((template: any) => ({
        id: template.id,
        name: template.name,
        imageUrl: template.image_url,
        description: template.description || '',
        tags: template.tags || [],
        createdAt: template.created_at,
        updatedAt: template.updated_at
      }))
      
      setTemplates(transformedTemplates)
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates
  }
}