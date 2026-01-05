'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  StickyNote,
  Plus,
  X,
  Loader2,
  Edit2,
  Trash2,
  Check,
  AlertTriangle,
  Lock,
  Unlock,
} from 'lucide-react'
import { useDashboardLabels } from '@/lib/hooks/use-dashboard-labels'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/Toast'

interface Note {
  id: string
  content: string
  is_private: boolean
  created_by: string
  created_by_name?: string
  created_at: string
  updated_at: string
}

interface ClientNotesProps {
  clientId: string
  clinic: string
  currentUserId: string
  initialNotes?: Note[]
}

export function ClientNotes({
  clientId,
  clinic,
  currentUserId,
  initialNotes = [],
}: ClientNotesProps): React.ReactElement {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [isLoading, setIsLoading] = useState(initialNotes.length === 0)
  const [isAdding, setIsAdding] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const labels = useDashboardLabels()
  const { showToast } = useToast()

  useEffect(() => {
    if (initialNotes.length > 0) {
      setIsLoading(false)
      return
    }

    const fetchNotes = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/clients/${clientId}/notes?clinic=${clinic}`)
        if (response.ok) {
          const data = await response.json()
          setNotes(data.notes || [])
        }
      } catch (error) {
        // UX-011: Show toast on network error
        showToast('Error al cargar notas')
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching notes:', error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotes()
  }, [clientId, clinic, initialNotes.length])

  const handleAddNote = async (): Promise<void> => {
    if (!newNote.trim()) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/clients/${clientId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinic,
          content: newNote,
          is_private: isPrivate,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setNotes((prev) => [data.note, ...prev])
        setNewNote('')
        setIsPrivate(false)
        setIsAdding(false)
      }
    } catch (error) {
      // UX-011: Show toast on network error
      showToast('Error al guardar nota')
      if (process.env.NODE_ENV === 'development') {
        console.error('Error adding note:', error)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditNote = async (noteId: string): Promise<void> => {
    if (!editContent.trim()) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/clients/${clientId}/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinic,
          content: editContent,
        }),
      })

      if (response.ok) {
        setNotes((prev) =>
          prev.map((note) =>
            note.id === noteId
              ? { ...note, content: editContent, updated_at: new Date().toISOString() }
              : note
          )
        )
        setEditingId(null)
        setEditContent('')
      }
    } catch (error) {
      // UX-011: Show toast on network error
      showToast('Error al editar nota')
      if (process.env.NODE_ENV === 'development') {
        console.error('Error editing note:', error)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteNote = async (noteId: string): Promise<void> => {
    setDeletingId(noteId)
    try {
      const response = await fetch(`/api/clients/${clientId}/notes/${noteId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinic }),
      })

      if (response.ok) {
        setNotes((prev) => prev.filter((note) => note.id !== noteId))
      }
    } catch (error) {
      // UX-011: Show toast on network error
      showToast('Error al eliminar nota')
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting note:', error)
      }
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (date: string): string => {
    const d = new Date(date)
    const now = new Date()
    const diffHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60)

    if (diffHours < 1) {
      const minutes = Math.floor(diffHours * 60)
      return `hace ${minutes} min`
    }
    if (diffHours < 24) {
      return `hace ${Math.floor(diffHours)} h`
    }
    if (diffHours < 48) {
      return 'ayer'
    }
    return d.toLocaleDateString('es-PY', {
      day: 'numeric',
      month: 'short',
    })
  }

  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-3">
        <div className="flex items-center gap-2">
          <StickyNote className="h-5 w-5 text-[var(--primary)]" />
          <h3 className="font-semibold text-[var(--text-primary)]">{labels.notes.title}</h3>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            {notes.length}
          </span>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary)] hover:bg-opacity-10"
          >
            <Plus className="h-4 w-4" />
            {labels.notes.add}
          </button>
        )}
      </div>

      {/* Add Note Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-[var(--border-color)]"
          >
            <div className="space-y-3 p-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={labels.notes.placeholder}
                rows={3}
                className="w-full resize-none rounded-lg border border-[var(--border-color)] px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                autoFocus
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    isPrivate
                      ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning)]'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isPrivate ? (
                    <>
                      <Lock className="h-4 w-4" />
                      {labels.notes.private}
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4" />
                      {labels.notes.public}
                    </>
                  )}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsAdding(false)
                      setNewNote('')
                      setIsPrivate(false)
                    }}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                    disabled={isSaving}
                  >
                    {labels.common.cancel}
                  </button>
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || isSaving}
                    className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    {labels.common.save}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes List */}
      <div className="divide-y divide-[var(--border-color)]">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
          </div>
        ) : notes.length > 0 ? (
          notes.map((note) => (
            <div key={note.id} className="p-4 transition-colors hover:bg-gray-50">
              {editingId === note.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-[var(--border-color)] px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingId(null)
                        setEditContent('')
                      }}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                    >
                      {labels.common.cancel}
                    </button>
                    <button
                      onClick={() => handleEditNote(note.id)}
                      disabled={isSaving}
                      className="flex items-center gap-1 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      {labels.common.save}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="whitespace-pre-wrap text-sm text-[var(--text-primary)]">
                        {note.content}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                        <span>{note.created_by_name || 'Usuario'}</span>
                        <span>•</span>
                        <span>{formatDate(note.created_at)}</span>
                        {note.is_private && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-[var(--status-warning)]">
                              <Lock className="h-3 w-3" />
                              Privada
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {note.created_by === currentUserId && (
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => {
                            setEditingId(note.id)
                            setEditContent(note.content)
                          }}
                          className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[var(--primary)]"
                          title={labels.common.edit}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {/* UX-007: Confirmation dialog for delete */}
                        <ConfirmDialog
                          trigger={
                            <button
                              className="rounded p-1.5 text-gray-400 transition-colors hover:bg-[var(--status-error-bg)] hover:text-[var(--status-error)]"
                              title={labels.common.delete}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          }
                          title="¿Eliminar nota?"
                          description="Esta acción no se puede deshacer."
                          confirmLabel="Eliminar"
                          cancelLabel="Cancelar"
                          variant="danger"
                          onConfirm={() => handleDeleteNote(note.id)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-8 text-center">
            <StickyNote className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-sm text-[var(--text-secondary)]">{labels.notes.no_notes}</p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-2 text-sm text-[var(--primary)] hover:underline"
            >
              {labels.notes.add_first}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
