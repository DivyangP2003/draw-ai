"use client";

import { useState, useRef } from "react";
import DrawingCanvas from "@/components/drawing-canvas";
import ResultsPanel from "@/components/results-panel";
import Header from "@/components/header";
import NotesSidebar from "@/components/notes-sidebar";
import NoteDetails from "@/components/note-details";
import CalendarView from "@/components/calendar-view";
import AnalyticsDashboard from "@/components/analytics-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showNoteDetails, setShowNoteDetails] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [sidebarRefresh, setSidebarRefresh] = useState(0);
  const [currentView, setCurrentView] = useState("draw");
  const canvasRef = useRef(null);
  const [aiTags, setAiTags] = useState([]);

  const handleAnalyze = async (imageData) => {
    setIsAnalyzing(true);
    setError(null);
    setResult("");
    setShowNoteDetails(false);

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      setIsAnalyzing(false);
      setError("Analysis timed out. Please try again.");
      toast.error("Analysis timed out. Please try again.");
    }, 25000);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || "Failed to analyze image");

      const analysisText = data.analysis?.trim() || "";
      let smartTags = [];

      try {
        const tagResponse = await fetch("/api/smart-tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ analysisText }),
        });
        const tagData = await tagResponse.json();
        smartTags = tagData.tags || [];
      } catch {
        const { extractTagsFromAnalysis } = await import("@/utils/tagExtractor");
        smartTags = extractTagsFromAnalysis(analysisText);
      }

      setAiTags(smartTags);
      setResult("");
      let idx = 0;
      const interval = setInterval(() => {
        idx += 5;
        setResult(analysisText.slice(0, idx));
        if (idx >= analysisText.length) clearInterval(interval);
      }, 30);

      toast.success(
        `AI analysis complete! Tags: ${smartTags.join(", ") || "general"}`
      );
    } catch (err) {
      clearTimeout(timeout);
      setError(err.message);
      toast.error("Failed to analyze the drawing. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveNote = async () => {
    if (!canvasRef.current) return;
    setShowNoteDetails(false);

    try {
      const { saveNote, updateNote, getAllNotes } = await import(
        "@/utils/storage"
      );
      const imageData = canvasRef.current.toDataURL("image/png");
      const stats = canvasRef.current.getStats();

      if (selectedNote) {
        const updatedTags = Array.from(
          new Set([...(selectedNote.tags || []), ...aiTags])
        );

        await updateNote(selectedNote.id, {
          title: noteTitle || "Untitled",
          canvasImage: imageData,
          analysis: result,
          stats,
          tags: updatedTags,
        });

        const updatedNotes = await getAllNotes();
        const updatedNote = updatedNotes.find((n) => n.id === selectedNote.id);
        setSelectedNote(updatedNote);
        toast.success("Note updated successfully with Smart Tags!");
      } else {
        await saveNote({
          title: noteTitle || "Untitled",
          canvasImage: imageData,
          analysis: result,
          tags: aiTags,
          strokeCount: stats.strokeCount,
          timeSpent: stats.timeSpent,
          colorsUsed: stats.colorsUsed,
        });

        toast.success("Note saved successfully with Smart Tags!");
      }

      setNoteTitle("");
      setSidebarRefresh((p) => p + 1);
    } catch {
      toast.error("Failed to save note. Please try again.");
    }
  };

  const handleNoteSelect = (note) => {
    setSelectedNote(note);
    setResult(note.analysis || "");
    setNoteTitle(note.title || "");

    if (canvasRef.current && note.canvasImage) {
      canvasRef.current.drawImageFromData(note.canvasImage);
    }
  };

  return (
    <div className="h-screen flex bg-background text-foreground dark">
      {/* Sidebar */}
      {currentView === "draw" && (
        <NotesSidebar
          onNoteSelect={(note) => {
            handleNoteSelect(note);
            setShowNoteDetails(true);
          }}
          onNoteDelete={(deletedId) => {
            if (selectedNote && selectedNote.id === deletedId) {
              setShowNoteDetails(false);
              setSelectedNote(null);
            }
          }}
          onRefresh={sidebarRefresh}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />

        {/* Tabs */}
        <div className="border-b border-gray-300 dark:border-gray-700 px-4">
          <Tabs
            value={currentView}
            onValueChange={setCurrentView}
            className="bg-transparent"
          >
            <TabsList className="bg-transparent border-b-2 border-transparent">
              <TabsTrigger
                value="draw"
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
              >
                Draw & Analyze
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
              >
                <Calendar size={16} className="mr-2" /> Calendar
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
              >
                <BarChart3 size={16} className="mr-2" /> Analytics
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto">
          {currentView === "draw" && (
            <div className="h-full container mx-auto px-4 py-6 flex flex-col">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
                {/* Left section (Drawing + Save button) */}
                <div className="lg:col-span-2 flex flex-col h-full">
                  {/* <h2 className="text-2xl font-bold mb-4">Draw Something</h2> */}

                  {/* Canvas fills space */}
                  <div className="flex-1 overflow-auto border rounded-md">
                    <DrawingCanvas
                      ref={canvasRef}
                      onAnalyze={handleAnalyze}
                      isAnalyzing={isAnalyzing}
                      onNewDrawing={() => {
                        setResult("");
                        setNoteTitle("");
                        setSelectedNote(null);
                        setShowNoteDetails(false);
                      }}
                    />
                  </div>

                  {/* Sticky bottom save bar */}
                  <div className="mt-4 flex gap-2 sticky bottom-0 bg-background py-3 border-t border-gray-200 dark:border-gray-700">
                    <Input
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="Note title (optional)"
                    />
                    <Button onClick={handleSaveNote} className="bg-blue-500">
                      Save Note
                    </Button>
                  </div>
                </div>

                {/* Right section (AI Analysis) */}
                <div className="flex flex-col h-full overflow-y-auto">
                  <h2 className="text-2xl font-bold mb-4">AI Analysis</h2>
                  <ResultsPanel
                    result={result}
                    error={error}
                    isAnalyzing={isAnalyzing}
                  />
                </div>
              </div>
            </div>
          )}

          {currentView === "calendar" && (
            <div className="h-full container mx-auto px-4 py-8 overflow-y-auto">
              <CalendarView
                onNoteSelect={(note) => {
                  setSelectedNote(note);
                  setShowNoteDetails(true);
                }}
              />
            </div>
          )}

          {currentView === "analytics" && (
            <div className="h-full overflow-y-auto">
              <AnalyticsDashboard />
            </div>
          )}
        </main>
      </div>

      {/* Note Details */}
      {showNoteDetails && selectedNote && (
        <div className="w-96 border-l border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 h-full overflow-y-auto">
          <NoteDetails
            key={selectedNote.id}
            note={selectedNote}
            onClose={() => setShowNoteDetails(false)}
            onUpdate={() => setSidebarRefresh((prev) => prev + 1)}
          />
        </div>
      )}
    </div>
  );
}
