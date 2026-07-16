"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PageTransition } from "@/components/features/page-transition"
import { useNotes, createNote, updateNote, deleteNote } from "@/hooks/use-notes"
import { Notebook, Plus, Pin, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export default function NotesPage() {
  const { notes, isLoading, mutate } = useNotes()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [subject, setSubject] = useState("")

  const pinned = notes.filter((n) => n.pinned)
  const unpinned = notes.filter((n) => !n.pinned)

  const handleCreate = async () => {
    if (!title.trim()) return
    await createNote({
      title: title.trim(),
      content: content.trim() || null,
      subject: subject.trim() || null,
      pinned: false,
      tags: "[]",
    })
    setTitle("")
    setContent("")
    setSubject("")
    setIsCreating(false)
    mutate()
  }

  const handleUpdate = async (id: string) => {
    await updateNote(id, {
      title: title.trim(),
      content: content.trim() || null,
      subject: subject.trim() || null,
    })
    setEditingId(null)
    setTitle("")
    setContent("")
    setSubject("")
    mutate()
  }

  const startEdit = (note: (typeof notes)[0]) => {
    setEditingId(note.id)
    setTitle(note.title)
    setContent(note.content || "")
    setSubject(note.subject || "")
    setIsCreating(false)
  }

  const togglePin = async (note: (typeof notes)[0]) => {
    await updateNote(note.id, { pinned: !note.pinned })
    mutate()
  }

  const reset = () => {
    setIsCreating(false)
    setEditingId(null)
    setTitle("")
    setContent("")
    setSubject("")
  }

  const showEditor = isCreating || editingId !== null

  return (
    <PageTransition>
      <div className="px-10 pt-20 pb-28">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7D39EB] to-[#C6FF33]">
              <Notebook className="h-5 w-5 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Notes</h1>
              <p className="text-sm text-text-tertiary">Your notes, organized by subject</p>
            </div>
          </div>
          {!showEditor && (
            <Button variant="primary" size="sm" onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-1" />
              New Note
            </Button>
          )}
        </div>

        <AnimatePresence>
          {showEditor && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="rounded-2xl border border-border bg-surface-1 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    {editingId ? "Edit Note" : "New Note"}
                  </span>
                  <button
                    onClick={reset}
                    className="flex h-6 w-6 items-center justify-center rounded-lg text-text-tertiary hover:text-foreground hover:bg-surface-2 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note title..."
                  autoFocus
                  className="border-0 bg-surface-2"
                />
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject (optional)"
                  className="border-0 bg-surface-2 w-48"
                />
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your notes here..."
                  rows={6}
                  className="w-full resize-none rounded-xl bg-surface-2 border-0 p-3 text-sm placeholder:text-text-tertiary focus:outline-none"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => editingId ? handleUpdate(editingId) : handleCreate}
                  className="w-full"
                >
                  {editingId ? "Save Changes" : "Create Note"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-surface-1 border border-border animate-pulse" />
            ))}
          </div>
        ) : notes.length === 0 && !showEditor ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center max-w-3xl">
            <p className="text-sm text-text-tertiary">
              No notes yet. Click &quot;New Note&quot; to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-6 max-w-5xl">
            {pinned.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-text-tertiary mb-3">Pinned</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {pinned.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={() => startEdit(note)}
                      onTogglePin={() => togglePin(note)}
                      onDelete={async () => {
                        await deleteNote(note.id)
                        mutate()
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            {unpinned.length > 0 && (
              <div>
                {pinned.length > 0 && (
                  <h2 className="text-sm font-medium text-text-tertiary mb-3">All Notes</h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {unpinned.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={() => startEdit(note)}
                      onTogglePin={() => togglePin(note)}
                      onDelete={async () => {
                        await deleteNote(note.id)
                        mutate()
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  )
}

interface NoteCardProps {
  note: {
    id: string
    title: string
    content: string | null
    subject: string | null
    pinned: boolean
    createdAt: string
    updatedAt: string
  }
  onEdit: () => void
  onTogglePin: () => void
  onDelete: () => void
}

function NoteCard({ note, onEdit, onTogglePin, onDelete }: NoteCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group relative rounded-2xl bg-surface-1 border border-border p-4 cursor-pointer transition-all duration-200 hover:border-primary-100 hover:shadow-card-hover hover:-translate-y-px",
        note.pinned && "border-primary-100"
      )}
      onClick={onEdit}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold truncate flex-1">{note.title}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onTogglePin()
          }}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-text-tertiary hover:text-primary transition-colors"
        >
          <Pin className={cn("h-3.5 w-3.5", note.pinned && "fill-primary text-primary")} />
        </button>
      </div>
      {note.content && (
        <p className="text-xs text-text-secondary line-clamp-4 mb-3">{note.content}</p>
      )}
      <div className="flex items-center justify-between">
        {note.subject ? (
          <span className="rounded-md bg-primary-100 px-2 py-0.5 text-[10px] font-medium text-primary">
            {note.subject}
          </span>
        ) : (
          <span />
        )}
        <span className="text-[10px] text-text-tertiary">
          {format(new Date(note.updatedAt), "d MMM")}
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="absolute top-2 right-9 opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center rounded-lg text-text-tertiary hover:text-destructive hover:bg-destructive/10 transition-all"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  )
}
