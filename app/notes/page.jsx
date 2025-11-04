"use client"

import { NoteEditor } from "@/components/note-editor"

export default function NotesPage() {
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary">My Notes</h1>
          <p className="text-muted-foreground mt-1">Write, draw, and organize your math notes</p>
        </div>
        <NoteEditor />
      </div>
    </main>
  )
}
