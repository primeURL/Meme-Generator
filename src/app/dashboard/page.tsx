'use client'

import { useState } from 'react'

export default function Dashboard() {
  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [description, setDescription] = useState<string>('')
  const [imageName, setImageName] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImage(file)
    setResult(null)
    setError(null)
    setTags([])
    setDescription('')
    setSaveMsg(null)
    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setPreviewUrl(null)
    }
  }

  const handleUpload = async () => {
    if (!image) return
    setUploading(true)
    setError(null)
    setResult(null)
    setTags([])
    setDescription('')
    setSaveMsg(null)
    try {
      const formData = new FormData()
      formData.append('image', image)
      const res = await fetch('/api/classify-upload', {
        method: 'POST',
        body: formData
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || 'Upload failed')
        setUploading(false)
        return
      }
      const data = await res.json()
      setResult(data)
      setTags(data.tags || [])
      setDescription(data.description || '')
      setImageName(data.name || '')
    } catch (err) {
      setError('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!image || !tags.length || !description) {
      setSaveMsg('Image, tags, and description are required.')
      return
    }
    setSaving(true)
    setSaveMsg(null)
    try {
      // 1. Upload image to Supabase Storage
      const formData = new FormData()
      formData.append('image', image)
      const uploadRes = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      })
      if (!uploadRes.ok) {
        const err = await uploadRes.json()
        setSaveMsg(err.error || 'Image upload failed')
        setSaving(false)
        return
      }
      const { imageUrl } = await uploadRes.json()
      console.log('imageUrl',imageUrl)
      // 2. Insert into meme_templates
      const insertRes = await fetch('/api/insert-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: imageName || 'Uploaded Meme',
          imageUrl,
          description,
          tags
        })
      })
      if (!insertRes.ok) {
        const err = await insertRes.json()
        setSaveMsg(err.error || 'Failed to save template')
        setSaving(false)
        return
      }
      setSaveMsg('Template saved successfully!')
    } catch (err) {
      setSaveMsg('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Meme Template Dashboard</h1>
      <div className="mb-4">
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>
      {previewUrl && (
        <div className="mb-4">
          <img src={previewUrl} alt="Preview" className="max-h-64 rounded shadow" />
        </div>
      )}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={handleUpload}
        disabled={!image || uploading}
      >
        {uploading ? 'Uploading...' : 'Upload & Classify'}
      </button>
      {error && <div className="text-red-500 mt-4">{error}</div>}
      {result && (
        <div className="mt-4 p-4 bg-green-100 rounded">
          <h2 className="font-semibold mb-2">Classification Result</h2>
          <div className="mb-2">
            <label className="block font-medium mb-1">Tags (comma separated):</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1"
              value={tags.join(', ')}
              onChange={e => setTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
            />
          </div>
          <div className="mb-2">
            <label className="block font-medium mb-1">Description:</label>
            <textarea
              className="w-full border rounded px-2 py-1"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <label className="block font-medium mb-1">Image Name:</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={imageName}
              onChange={e => setImageName(e.target.value)}
            />
          </div>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save to Templates'}
          </button>
          {saveMsg && <div className="mt-2 text-sm text-blue-700">{saveMsg}</div>}
        </div>
      )}
    </div>
  )
} 