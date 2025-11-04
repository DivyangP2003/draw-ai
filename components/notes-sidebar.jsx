"use client";

import { useState, useEffect } from "react";
import {
  getAllNotes,
  getRecentNotes,
  searchNotes,
  deleteNote,
  updateNote,
  getAllCollections,
  getFavoriteNotes,
  getNotesByCollection,
} from "@/utils/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Trash2,
  Heart,
  Folder,
  Trash,
  FolderPlus,
  FolderOpen,
  PanelRightOpen,
  PanelLeftOpen,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getTagStyle } from "@/utils/tagColors";

export default function NotesSidebar({
  onNoteSelect,
  onRefresh,
  onNoteDelete,
}) {
  const [allNotes, setAllNotes] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [favoriteNotes, setFavoriteNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionNotes, setCollectionNotes] = useState([]);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [collectionToDelete, setCollectionToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteType, setDeleteType] = useState("note");
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  const [noteToAdd, setNoteToAdd] = useState(null);
  const [availableCollections, setAvailableCollections] = useState([]);
  const [newCollection, setNewCollection] = useState("");

  // ✅ Multi-select states
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [showMoveDialog, setShowMoveDialog] = useState(false);

  const [collapsed, setCollapsed] = useState(false);

  // Load notes
  useEffect(() => {
    loadNotes();
  }, [onRefresh]);

  const loadNotes = async () => {
    try {
      const all = await getAllNotes();

      // 🧩 Sort all notes by updatedAt (or createdAt fallback) in descending order
      const sortedAll = all.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB - dateA; // latest first
      });

      const recent = sortedAll.slice(0, 10);
      const favorites = sortedAll.filter((n) => n.isFavorite);
      const cols = await getAllCollections();

      setAllNotes(sortedAll);
      setRecentNotes(recent);
      setFavoriteNotes(favorites);
      setCollections(cols);
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      searchNotes(searchQuery).then(setSearchResults);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Toggle select
  const toggleSelect = (id) => {
    setSelectedNotes((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    );
  };

  // Add to collection dialog
  const handleAddToCollectionClick = async (note, e) => {
    e.stopPropagation();
    setNoteToAdd(note);
    const cols = await getAllCollections();
    setAvailableCollections(cols);
    setShowCollectionDialog(true);
  };

  const confirmAddToCollection = async (collectionName) => {
    try {
      const targetCollection = collectionName || newCollection.trim();
      if (!targetCollection) {
        toast.error("Please choose or enter a collection name.");
        return;
      }

      await updateNote(noteToAdd.id, { collection: targetCollection });
      toast.success(`Note added to "${targetCollection}"!`);
      setShowCollectionDialog(false);
      setNoteToAdd(null);
      setNewCollection("");
      loadNotes();
    } catch (err) {
      toast.error("Failed to add note to collection.");
      console.error("Collection add error:", err);
    }
  };

  // Handle collection toggle
  // ✅ Corrected handleCollectionClick
  const handleCollectionClick = async (collection) => {
    if (selectedCollection === collection) {
      // Collapse the currently selected collection
      setSelectedCollection(null);
      setCollectionNotes([]);
      return;
    }

    // Expand and show sorted notes for the new collection
    setSelectedCollection(collection);
    const notes = await getNotesByCollection(collection);
    const sorted = notes.sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) -
        new Date(a.updatedAt || a.createdAt)
    );
    setCollectionNotes(sorted);
  };

  // Note click
  const handleNoteClick = (note) => {
    onNoteSelect(note);
  };

  // Delete note
  const handleDeleteClick = (note, e) => {
    e.stopPropagation();
    setNoteToDelete(note);
    setDeleteType("note");
    setShowDeleteDialog(true);
  };

  // Delete collection
  const handleDeleteCollectionClick = (collection, e) => {
    e.stopPropagation();
    setCollectionToDelete(collection);
    setDeleteType("collection");
    setShowDeleteDialog(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      if (deleteType === "note" && noteToDelete) {
        const deletedId = noteToDelete.id;
        await deleteNote(deletedId);
        toast.success("Note deleted successfully!");
        if (typeof onNoteDelete === "function") onNoteDelete(deletedId);
      } else if (deleteType === "collection" && collectionToDelete) {
        const notes = await getNotesByCollection(collectionToDelete);
        for (const n of notes) await deleteNote(n.id);
        toast.success(`Deleted "${collectionToDelete}" and its notes`);
        setSelectedCollection(null);
      } else if (multiSelectMode && selectedNotes.length > 0) {
        for (const id of selectedNotes) await deleteNote(id);
        toast.success(`Deleted ${selectedNotes.length} note(s)`);
        setSelectedNotes([]);
        setMultiSelectMode(false);
      }

      setShowDeleteDialog(false);
      setNoteToDelete(null);
      setCollectionToDelete(null);
      loadNotes();
    } catch (err) {
      toast.error("Failed to delete.");
      console.error("Delete error:", err);
    }
  };

  // Favorite toggle (single)
  const handleFavorite = async (id, isFavorite, e) => {
    e.stopPropagation();
    await updateNote(id, { isFavorite: !isFavorite });
    loadNotes();
  };

  // ✅ Multi-select favorite logic
  const selectedNotesData = allNotes.filter((n) =>
    selectedNotes.includes(n.id)
  );
  const allFav = selectedNotesData.every((n) => n.isFavorite);
  const noneFav = selectedNotesData.every((n) => !n.isFavorite);
  const mixedFav = !allFav && !noneFav;

  const formatRelativeTime = (dateStr) => {
    const date = new Date(dateStr);
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} day ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const NoteItem = ({ note }) => (
    <div
      onClick={() => {
        if (multiSelectMode) toggleSelect(note.id);
        else handleNoteClick(note);
      }}
      className={`p-3 border rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
        selectedNotes.includes(note.id) ? "bg-blue-100 dark:bg-blue-900/30" : ""
      }`}
    >
      {/* 📅 Date Info */}
      <p className="text-xs text-gray-500 dark:text-gray-400 my-1">
        {note.updatedAt && note.updatedAt !== note.createdAt
          ? `Updated ${formatRelativeTime(note.updatedAt)}`
          : `Created ${formatRelativeTime(note.createdAt)}`}
      </p>

      {/* ✅ Thumbnail preview */}
      {note.canvasImage && (
        <img
          src={note.canvasImage}
          alt={note.title || "Note preview"}
          className="w-full h-28 object-cover rounded-md mb-2 border border-gray-200 dark:border-gray-700"
        />
      )}

      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          {multiSelectMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSelect(note.id);
              }}
              className="text-blue-500"
            >
              {selectedNotes.includes(note.id) ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293A1 1 0 003.293 10.707l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" />
                </svg>
              ) : (
                <div className="w-4 h-4 border border-blue-400 rounded-sm"></div>
              )}
            </button>
          )}
          <h4 className="font-semibold text-sm truncate">{note.title}</h4>
        </div>

        {!multiSelectMode && (
          <div className="flex gap-1">
            <button
              onClick={(e) => handleFavorite(note.id, note.isFavorite, e)}
              className="p-1"
            >
              <Heart
                size={16}
                className={note.isFavorite ? "fill-red-500 text-red-500" : ""}
              />
            </button>

            <button
              onClick={(e) => handleDeleteClick(note, e)}
              className="p-1 text-red-600 hover:text-red-700"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={(e) => handleAddToCollectionClick(note, e)}
              className="p-1 text-blue-500 hover:text-blue-600"
              title="Add to Collection"
            >
              <FolderPlus size={16} />
            </button>
          </div>
        )}
      </div>

      {note.tags?.length > 0 && (
        <div className="flex gap-1 flex-wrap mt-1">
          {note.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className={`text-xs px-2 py-0.5 ${getTagStyle(tag)}`}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Sidebar */}
      <div
        className={`border-r border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col h-screen transition-all duration-300 ${
          collapsed ? "w-14" : "w-80"
        }`}
      >
        {/* Collapse / Expand Button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300 dark:border-gray-700 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm">
          {!collapsed && (
            <h2 className="text-lg font-semibold tracking-wide text-gray-800 dark:text-gray-200">
              Notes
            </h2>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? (
              <PanelRightOpen className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            ) : (
              <PanelLeftOpen className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            )}
          </button>
        </div>
        {!collapsed && (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-300 dark:border-gray-700 shrink-0">
              <div className="flex justify-between items-center mb-3 gap-2">
                {/* <h2 className="text-lg font-bold">Notes</h2> */}
                <Input
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
                <Button
                  size="sm"
                  variant={multiSelectMode ? "destructive" : "outline"}
                  onClick={() => {
                    setMultiSelectMode((p) => !p);
                    setSelectedNotes([]);
                  }}
                >
                  {multiSelectMode ? "Cancel" : "Select"}
                </Button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Floating toolbar */}
              {multiSelectMode && selectedNotes.length > 0 && (
                <TooltipProvider>
                  <div className="border-b border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex justify-between items-center px-3 py-2 sticky top-0 z-20">
                    <p className="text-sm">{selectedNotes.length} selected</p>
                    <div className="flex gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="outline"
                            className="bg-blue-600 text-white hover:bg-blue-700"
                            onClick={() => setShowMoveDialog(true)}
                          >
                            <FolderOpen size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Move to Collection</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="outline"
                            disabled={mixedFav}
                            className={`${
                              mixedFav
                                ? "opacity-50 cursor-not-allowed"
                                : allFav
                                ? "bg-gray-600 text-white hover:bg-gray-700"
                                : "bg-pink-600 text-white hover:bg-pink-700"
                            }`}
                            onClick={async () => {
                              for (const n of selectedNotesData) {
                                await updateNote(n.id, { isFavorite: !allFav });
                              }
                              toast.success(
                                allFav
                                  ? "Removed from favorites!"
                                  : "Added to favorites!"
                              );
                              setSelectedNotes([]);
                              setMultiSelectMode(false);
                              loadNotes();
                            }}
                          >
                            {allFav ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-4 h-4"
                              >
                                <path d="M19.5 12.5 12 20l-7.5-7.5a5 5 0 0 1 7-7l.5.5.5-.5a5 5 0 0 1 7 7Z" />
                                <line x1="4" y1="4" x2="20" y2="20" />
                              </svg>
                            ) : (
                              <Heart size={16} />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {mixedFav
                            ? "Mixed Selection"
                            : allFav
                            ? "Remove from Favorites"
                            : "Add to Favorites"}
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="outline"
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={() => setShowDeleteDialog(true)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete Selected</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </TooltipProvider>
              )}

              <Tabs defaultValue="recent" className="w-full">
                <TabsList className="w-full rounded-none border-b sticky top-0 z-10">
                  <TabsTrigger value="recent" className="flex-1">
                    Recent
                  </TabsTrigger>
                  <TabsTrigger value="favorites" className="flex-1">
                    Favorites
                  </TabsTrigger>
                  <TabsTrigger value="collections" className="flex-1">
                    Collections
                  </TabsTrigger>
                </TabsList>

                <div className="p-4">
                  {searchQuery.trim() ? (
                    <div>
                      <h3 className="font-semibold text-sm mb-3">
                        Search Results
                      </h3>
                      {searchResults.length > 0 ? (
                        <div className="space-y-2">
                          {searchResults.map((note) => (
                            <NoteItem key={note.id} note={note} />
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">
                          No results found
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      <TabsContent value="recent" className="space-y-2 mt-0">
                        {recentNotes.length ? (
                          recentNotes.map((n) => (
                            <NoteItem key={n.id} note={n} />
                          ))
                        ) : (
                          <p className="text-xs text-gray-500">
                            No recent notes
                          </p>
                        )}
                      </TabsContent>

                      <TabsContent value="favorites" className="space-y-2 mt-0">
                        {favoriteNotes.length ? (
                          favoriteNotes.map((n) => (
                            <NoteItem key={n.id} note={n} />
                          ))
                        ) : (
                          <p className="text-xs text-gray-500">
                            No favorite notes
                          </p>
                        )}
                      </TabsContent>

                      <TabsContent
                        value="collections"
                        className="space-y-3 mt-0"
                      >
                        {collections.length ? (
                          collections.map((collection) => (
                            <div key={collection}>
                              <div className="flex justify-between items-center">
                                <button
                                  onClick={() =>
                                    handleCollectionClick(collection)
                                  }
                                  className={`flex-1 text-left p-2 rounded text-sm font-semibold transition ${
                                    selectedCollection === collection
                                      ? "bg-blue-500 text-white"
                                      : "hover:bg-gray-200 dark:hover:bg-gray-800"
                                  }`}
                                >
                                  <Folder size={14} className="inline mr-2" />
                                  {collection}
                                </button>
                                <button
                                  onClick={(e) =>
                                    handleDeleteCollectionClick(collection, e)
                                  }
                                  className="ml-2 text-red-500 hover:text-red-700"
                                  title="Delete this collection"
                                >
                                  <Trash size={14} />
                                </button>
                              </div>

                              {selectedCollection === collection && (
                                <div className="pl-2 space-y-2 mt-2">
                                  {collectionNotes.map((n) => (
                                    <NoteItem key={n.id} note={n} />
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500">
                            No collections
                          </p>
                        )}
                      </TabsContent>
                    </>
                  )}
                </div>
              </Tabs>
            </div>
          </>
        )}
      </div>
      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteType === "note"
                ? "Delete this note?"
                : "Delete this collection?"}
            </DialogTitle>
            <DialogDescription>
              {deleteType === "note"
                ? "This action cannot be undone."
                : "All notes inside this collection will be deleted."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note to Collection Dialog */}
      <Dialog
        open={showCollectionDialog}
        onOpenChange={setShowCollectionDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note to Collection</DialogTitle>
            <DialogDescription>
              Choose an existing collection or create a new one.
            </DialogDescription>
          </DialogHeader>

          {/* ✅ Buttons if <=3, dropdown if >3 */}
          {availableCollections.length > 0 && (
            <>
              {availableCollections.length <= 3 ? (
                <div className="space-y-2">
                  {availableCollections.map((col) => (
                    <Button
                      key={col}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => confirmAddToCollection(col)}
                    >
                      <FolderPlus size={14} className="mr-2" /> {col}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="mt-2">
                  <label className="text-sm font-medium mb-1 block">
                    Select existing collection:
                  </label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground p-2"
                    onChange={(e) => confirmAddToCollection(e.target.value)}
                  >
                    <option value="">-- Choose Collection --</option>
                    {availableCollections.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* Create new collection input */}
          <div className="mt-4">
            <Input
              value={newCollection}
              onChange={(e) => setNewCollection(e.target.value)}
              placeholder="Or type new collection name..."
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCollectionDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => confirmAddToCollection()}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Selected Notes Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Selected Notes</DialogTitle>
            <DialogDescription>
              Choose a collection or create a new one to move these notes into.
            </DialogDescription>
          </DialogHeader>

          {collections.length > 0 ? (
            <>
              {/* ✅ Buttons if ≤3, dropdown if >3 */}
              {collections.length <= 3 ? (
                <div className="space-y-2 mt-2">
                  {collections.map((col) => (
                    <Button
                      key={col}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={async () => {
                        for (const id of selectedNotes) {
                          await updateNote(id, { collection: col });
                        }
                        toast.success(
                          `Moved ${selectedNotes.length} note(s) to "${col}"`
                        );
                        setShowMoveDialog(false);
                        setSelectedNotes([]);
                        setMultiSelectMode(false);
                        loadNotes();
                      }}
                    >
                      <Folder size={14} className="mr-2" /> {col}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="mt-2">
                  <label className="text-sm font-medium mb-1 block">
                    Select collection:
                  </label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground p-2"
                    onChange={async (e) => {
                      const col = e.target.value;
                      if (!col) return;
                      for (const id of selectedNotes) {
                        await updateNote(id, { collection: col });
                      }
                      toast.success(
                        `Moved ${selectedNotes.length} note(s) to "${col}"`
                      );
                      setShowMoveDialog(false);
                      setSelectedNotes([]);
                      setMultiSelectMode(false);
                      loadNotes();
                    }}
                  >
                    <option value="">-- Choose Collection --</option>
                    {collections.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 mt-2">
              No collections available
            </p>
          )}

          {/* Create new collection input directly in Move Dialog */}
          <div className="mt-4">
            <Input
              value={newCollection}
              onChange={(e) => setNewCollection(e.target.value)}
              placeholder="Or type new collection name..."
            />
            <Button
              className="mt-2 w-full"
              onClick={async () => {
                if (!newCollection.trim()) {
                  toast.error("Please enter a collection name.");
                  return;
                }
                for (const id of selectedNotes) {
                  await updateNote(id, { collection: newCollection.trim() });
                }
                toast.success(
                  `Moved ${
                    selectedNotes.length
                  } note(s) to "${newCollection.trim()}"`
                );
                setNewCollection("");
                setShowMoveDialog(false);
                setSelectedNotes([]);
                setMultiSelectMode(false);
                loadNotes();
              }}
            >
              <FolderPlus size={14} className="mr-2" /> Move to New Collection
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
