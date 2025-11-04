// IndexedDB utilities for saving and managing notes
const DB_NAME = "DrawingNotesDB";
const STORE_NAME = "notes";
const DB_VERSION = 1;

let db = null;

// Initialize IndexedDB
export async function initDB() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("createdAt", "createdAt", { unique: false });
        store.createIndex("tags", "tags", { unique: false, multiEntry: true });
        store.createIndex("collection", "collection", { unique: false });
        store.createIndex("isArchived", "isArchived", { unique: false });
        store.createIndex("isFavorite", "isFavorite", { unique: false });
      }
    };
  });
}

// Save a new note
export async function saveNote(noteData) {
  const database = await initDB();
  const transaction = database.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  const now = new Date().toISOString();
  const note = {
    title: noteData.title || "Untitled",
    canvasImage: noteData.canvasImage,
    analysis: noteData.analysis || "",
    createdAt: noteData.createdAt || now,
    updatedAt: noteData.updatedAt || now, // ✅ added
    tags: noteData.tags || [],
    collection: noteData.collection || "Uncategorized",
    isFavorite: false,
    isArchived: false,
    stats: {
      strokeCount: noteData.strokeCount || 0,
      timeSpent: noteData.timeSpent || 0,
      colorsUsed: noteData.colorsUsed || [],
    },
  };
  return new Promise((resolve, reject) => {
    const request = store.add(note);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Get all notes
export async function getAllNotes() {
  const database = await initDB();
  const transaction = database.transaction([STORE_NAME], "readonly");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result.reverse());
  });
}

// Get recent notes
export async function getRecentNotes(limit = 10) {
  const notes = await getAllNotes();
  return notes.slice(0, limit);
}

// Search notes by title or tags
export async function searchNotes(query) {
  const notes = await getAllNotes();
  const lowerQuery = query.toLowerCase();
  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      (note.analysis && note.analysis.toLowerCase().includes(lowerQuery))
  );
}

// ✅ Update note (auto-updates updatedAt)
export async function updateNote(id, updates) {
  const database = await initDB();
  const transaction = database.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const note = getRequest.result;
      if (!note) {
        reject(new Error(`Note with id ${id} not found`));
        return;
      }

      const updatedNote = {
        ...note,
        ...updates,
        stats: {
          ...note.stats,
          ...(updates.stats || {}),
        },
        updatedAt: new Date().toISOString(), // ✅ always update timestamp
      };

      const putRequest = store.put(updatedNote);
      putRequest.onerror = () => reject(putRequest.error);
      putRequest.onsuccess = () => resolve(updatedNote);
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}


// Delete note
export async function deleteNote(id) {
  const database = await initDB();
  const transaction = database.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Get notes by collection
export async function getNotesByCollection(collection) {
  const notes = await getAllNotes();
  return notes.filter((note) => note.collection === collection);
}

// Get all collections
export async function getAllCollections() {
  const notes = await getAllNotes();
  const collections = new Set(notes.map((note) => note.collection));
  return Array.from(collections);
}

// Get favorite notes
export async function getFavoriteNotes() {
  const notes = await getAllNotes();
  return notes.filter((note) => note.isFavorite);
}

// Get archived notes
export async function getArchivedNotes() {
  const notes = await getAllNotes();
  return notes.filter((note) => note.isArchived);
}
