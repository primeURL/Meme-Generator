'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Loader2 } from 'lucide-react'
import { MemeTemplate } from '@/types/meme'
import { supabase } from '@/lib/supabase'

interface TemplateSelectorProps {
  selectedTemplate: MemeTemplate | null
  onTemplateSelect: (template: MemeTemplate) => void
}

export default function TemplateSelector({ selectedTemplate, onTemplateSelect }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<MemeTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredTemplates, setFilteredTemplates] = useState<MemeTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

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
      setFilteredTemplates(transformedTemplates)
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = templates.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredTemplates(filtered)
    } else {
      setFilteredTemplates(templates)
    }
  }, [searchQuery, templates])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="template-search" className="text-sm font-medium">
          Choose Template (Optional)
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="template-search"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-muted-foreground">Loading templates...</span>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={fetchTemplates}
            className="text-blue-500 hover:underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onTemplateSelect(template)}
            >
              <CardContent className="p-3">
                <div className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                  {template.imageUrl && template.imageUrl.startsWith('http') ? (
                    <img
                      src={template.imageUrl}
                      alt={template.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : null}
                  <span className="text-xs text-gray-500 text-center px-2">
                    {template.name}
                  </span>
                </div>
                <h3 className="font-medium text-sm truncate">{template.name}</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {template.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No templates found matching your search.
        </div>
      )}
    </div>
  )
}