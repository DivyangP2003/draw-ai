"use client"

import { useState } from "react"

export function NoteEditor() {
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  const handleAddNote = () => {
    if (title.trim() || content.trim()) {
      setNotes([
        ...notes,
        {
          id: Date.now(),
          title: title || "Untitled Note",
          content,
          createdAt: new Date().toLocaleDateString(),
        },
      ])
      setTitle("")
      setContent("")
    }
  }

  const handleDeleteNote = (id) => {
    setNotes(notes.filter((note) => note.id !== id))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Note Editor Form */}
      <div className="lg:col-span-1 bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold mb-4">Create Note</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your notes..."
              rows={6}
              className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground resize-none"
            />
          </div>
          <button
            onClick={handleAddNote}
            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
          >
            Add Note
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="lg:col-span-2">
        {notes.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <p className="text-muted-foreground">No notes yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <div key={note.id} className="bg-card rounded-lg border border-border p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{note.title}</h3>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-destructive hover:opacity-70 text-sm"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-muted-foreground text-sm mb-3">{note.createdAt}</p>
                <p className="text-foreground whitespace-pre-wrap wrap-words">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
