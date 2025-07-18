"use client"
import { useEffect, useState } from "react"
import { Pencil, Trash2, Eye, X, Check, Loader2 } from "lucide-react"

function Toast({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
  return (
    <div className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-lg shadow-lg text-white font-semibold transition-all animate-fade-in ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
      role="alert">
      <div className="flex items-center gap-2">
        {type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
        <span>{message}</span>
        <button className="ml-4 text-white/70 hover:text-white" onClick={onClose}><X className="w-4 h-4" /></button>
      </div>
    </div>
  )
}

export default function DashboardTable() {
  const [memes, setMemes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [selectedMeme, setSelectedMeme] = useState<any | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editFields, setEditFields] = useState({ name: '', tags: '', description: '' })
  const [confirmType, setConfirmType] = useState<null | 'edit' | 'delete'>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    async function fetchMemes() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/get-memes")
        if (!res.ok) throw new Error("Failed to fetch memes")
        const data = await res.json()
        setMemes(data.memes)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchMemes()
  }, [])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const filteredMemes = memes.filter(meme => {
    const q = search.toLowerCase()
    return (
      meme.name.toLowerCase().includes(q) ||
      meme.tags.join(",").toLowerCase().includes(q)
    )
  })

  const openModal = (meme: any) => {
    setSelectedMeme(meme)
    setEditMode(false)
    setEditFields({
      name: meme.name,
      tags: meme.tags.join(", "),
      description: meme.description,
    })
    setModalOpen(true)
    setActionError(null)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditMode(false)
    setConfirmType(null)
    setActionError(null)
  }

  const handleEdit = () => {
    setEditMode(true)
    setConfirmType(null)
  }

  const handleEditFieldChange = (field: string, value: string) => {
    setEditFields(prev => ({ ...prev, [field]: value }))
  }

  const handleEditSave = async () => {
    setActionLoading(true)
    setActionError(null)
    try {
      const res = await fetch(`/api/update-meme?id=${selectedMeme.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editFields.name,
          tags: editFields.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
          description: editFields.description,
        })
      })
      if (!res.ok) throw new Error('Failed to update meme')
      setMemes(memes.map(m => m.id === selectedMeme.id ? { ...m, ...editFields, tags: editFields.tags.split(',').map((t: string) => t.trim()).filter(Boolean) } : m))
      setEditMode(false)
      setConfirmType(null)
      setModalOpen(false)
      setToast({ message: 'Meme updated successfully!', type: 'success' })
    } catch (err: any) {
      setActionError(err.message)
      setToast({ message: err.message || 'Failed to update meme', type: 'error' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    setActionLoading(true)
    setActionError(null)
    try {
      const res = await fetch(`/api/delete-meme?id=${selectedMeme.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete meme')
      setMemes(memes.filter(m => m.id !== selectedMeme.id))
      setModalOpen(false)
      setConfirmType(null)
      setToast({ message: 'Meme deleted successfully!', type: 'success' })
    } catch (err: any) {
      setActionError(err.message)
      setToast({ message: err.message || 'Failed to delete meme', type: 'error' })
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-blue-700">All Meme Templates</h2>
        <input
          type="text"
          placeholder="Search by name or tag..."
          className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="text-center py-8 text-blue-500">Loading...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-blue-50 text-blue-700">
                <th className="p-3 text-left">Thumbnail</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Tags</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Created At</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMemes.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No memes found.</td></tr>
              ) : (
                filteredMemes.map(meme => (
                  <tr key={meme.id} className="border-b hover:bg-blue-50 transition cursor-pointer" onClick={() => openModal(meme)}>
                    <td className="p-3">
                      <img src={meme.image_url} alt={meme.name} className="w-16 h-16 object-cover rounded shadow" />
                    </td>
                    <td className="p-3 font-semibold">{meme.name}</td>
                    <td className="p-3">
                      {meme.tags.map((tag: string) => (
                        <span key={tag} className="inline-block bg-blue-100 text-blue-700 rounded px-2 py-0.5 mr-1 text-xs font-medium">{tag}</span>
                      ))}
                    </td>
                    <td className="p-3 text-gray-600 max-w-xs truncate">{meme.description}</td>
                    <td className="p-3 text-gray-400">{new Date(meme.created_at).toLocaleDateString()}</td>
                    <td className="p-3 flex gap-2">
                      <button className="p-2 rounded hover:bg-blue-100" title="View" onClick={e => { e.stopPropagation(); openModal(meme); }}><Eye className="w-4 h-4 text-blue-600" /></button>
                      <button className="p-2 rounded hover:bg-green-100" title="Edit" onClick={e => { e.stopPropagation(); openModal(meme); setEditMode(true); }}><Pencil className="w-4 h-4 text-green-600" /></button>
                      <button className="p-2 rounded hover:bg-red-100" title="Delete" onClick={e => { e.stopPropagation(); openModal(meme); setConfirmType('delete'); }}><Trash2 className="w-4 h-4 text-red-600" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && selectedMeme && (
        <div className=" fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fade-in">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-blue-600" onClick={closeModal}><X className="w-6 h-6" /></button>
            <div className="flex gap-6 mb-6">
              <img src={selectedMeme.image_url} alt={selectedMeme.name} className="w-32 h-32 object-cover rounded shadow" />
              <div className="flex-1">
                {editMode ? (
                  <>
                    <div className="mb-3">
                      <label className="block text-blue-800 font-medium mb-1">Name:</label>
                      <input type="text" className="w-full border rounded px-3 py-2" value={editFields.name} onChange={e => handleEditFieldChange('name', e.target.value)} />
                    </div>
                    <div className="mb-3">
                      <label className="block text-blue-800 font-medium mb-1">Tags:</label>
                      <input type="text" className="w-full border rounded px-3 py-2" value={editFields.tags} onChange={e => handleEditFieldChange('tags', e.target.value)} placeholder="e.g. funny, reaction, drake" />
                    </div>
                    <div className="mb-3">
                      <label className="block text-blue-800 font-medium mb-1">Description:</label>
                      <textarea className="w-full border rounded px-3 py-2" value={editFields.description} onChange={e => handleEditFieldChange('description', e.target.value)} rows={3} />
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-blue-700 mb-2">{selectedMeme.name}</h3>
                    <div className="mb-2">
                      {selectedMeme.tags.map((tag: string) => (
                        <span key={tag} className="inline-block bg-blue-100 text-blue-700 rounded px-2 py-0.5 mr-1 text-xs font-medium">{tag}</span>
                      ))}
                    </div>
                    <div className="mb-2 text-gray-600">{selectedMeme.description}</div>
                    <div className="text-xs text-gray-400">Created: {new Date(selectedMeme.created_at).toLocaleString()}</div>
                  </>
                )}
              </div>
            </div>
            {actionError && <div className="text-red-500 mb-2">{actionError}</div>}
            <div className="flex gap-4 justify-end mt-4">
              {editMode ? (
                <>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded" onClick={() => setEditMode(false)} disabled={actionLoading}>Cancel</button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded flex items-center gap-2" onClick={() => setConfirmType('edit')} disabled={actionLoading}>
                    <Check className="w-4 h-4" /> Save
                  </button>
                </>
              ) : (
                <>
                  <button className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded flex items-center gap-2" onClick={handleEdit}><Pencil className="w-4 h-4" /> Edit</button>
                  <button className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded flex items-center gap-2" onClick={() => setConfirmType('delete')}><Trash2 className="w-4 h-4" /> Delete</button>
                </>
              )}
            </div>
            {/* Confirmation Popup */}
            {confirmType && (
              <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs flex flex-col items-center">
                  <div className="mb-4 text-lg font-bold text-blue-700">
                    {confirmType === 'edit' ? 'Confirm Edit' : 'Confirm Delete'}
                  </div>
                  <div className="mb-6 text-gray-600 text-center">
                    {confirmType === 'edit'
                      ? 'Are you sure you want to save these changes?'
                      : 'Are you sure you want to delete this meme template? This action cannot be undone.'}
                  </div>
                  <div className="flex gap-4">
                    <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded" onClick={() => setConfirmType(null)} disabled={actionLoading}>Cancel</button>
                    <button
                      className={`font-bold px-4 py-2 rounded flex items-center gap-2 ${confirmType === 'edit' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                      onClick={confirmType === 'edit' ? handleEditSave : handleDelete}
                      disabled={actionLoading}
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmType === 'edit' ? 'Save' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 