"use client";

import { useState } from "react";
import { updateNote } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { X, Plus, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { getTagStyle } from "@/utils/tagColors";

export default function NoteDetails({ note, onClose, onUpdate }) {
  const [title, setTitle] = useState(note?.title || "");
  const [tags, setTags] = useState(note?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [collection, setCollection] = useState(note?.collection || "");
  const [analysis, setAnalysis] = useState(note?.analysis || "");
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true); // ✅ toggle between Markdown view and edit mode

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateNote(note.id, {
        title,
        tags,
        collection,
        analysis,
      });
      onUpdate?.();
    } catch (error) {
      console.error("Error updating note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a note to view details
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4 p-4 overflow-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Note Details</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
        >
          <X size={20} />
        </button>
      </div>

      <Card className="p-4">
        {/* Title */}
        <label className="block text-sm font-semibold mb-2">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
        />

        {/* Collection */}
        <label className="block text-sm font-semibold mt-4 mb-2">
          Collection
        </label>
        <Input
          value={collection}
          onChange={(e) => setCollection(e.target.value)}
          placeholder="e.g., Math, Physics"
        />

        {/* Tags */}
        <label className="block text-sm font-semibold mt-4 mb-2">Tags</label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
            placeholder="Add a tag"
          />
          <Button onClick={handleAddTag} size="sm">
            <Plus size={16} />
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className={`px-2 py-1 text-xs rounded-md cursor-pointer select-none transition ${getTagStyle(
                tag
              )}`}
              onClick={() => handleRemoveTag(tag)}
            >
              {tag} <X size={12} className="ml-1" />
            </Badge>
          ))}
        </div>

        {/* AI Analysis / Notes */}
        <div className="flex justify-between items-center mt-4 mb-2">
          <label className="block text-sm font-semibold">AI Analysis</label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye size={16} className="mr-1" />
            {showPreview ? "Edit" : "Preview"}
          </Button>
        </div>

        {showPreview ? (
          // ✅ Markdown Preview (same style as ResultsPanel)
          <div className="p-3 rounded-lg bg-muted/50 border border-gray-300 dark:border-gray-700 text-sm overflow-auto max-h-[400px] prose dark:prose-invert">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {analysis || "No analysis available."}
            </ReactMarkdown>
          </div>
        ) : (
          // ✅ Edit Mode
          <Textarea
            value={analysis}
            onChange={(e) => setAnalysis(e.target.value)}
            placeholder="AI analysis or notes"
            rows={6}
          />
        )}

        {/* Stats Section */}
        {note.stats && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
            <h4 className="font-semibold text-sm mb-2">Stats</h4>
            <div className="text-sm space-y-1">
              <p>Strokes: {note.stats.strokeCount}</p>
              <p>Time Spent: {note.stats.timeSpent}s</p>
              <p>
                Colors Used:{" "}
                {note.stats.colorsUsed?.length
                  ? note.stats.colorsUsed.length
                  : 0}
              </p>
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex gap-2 mt-4">
          <Button onClick={handleSave} disabled={isSaving} className="flex-1">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 bg-transparent"
          >
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
