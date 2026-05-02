import { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';
import { useDebounce } from '../hooks';
import { BooksAPI } from '../services/api';
import { Plus, Search, Trash2, X, BookOpen, Star, ExternalLink, Loader2 } from 'lucide-react';

// ─── Available quick tags ─────────────────────────────────────────────────────
const QUICK_TAGS = ['#study', '#project', '#exam', '#ideas', '#react', '#algorithms', '#math', '#science'];

// ─── Note Modal ───────────────────────────────────────────────────────────────
function NoteModal({ note, onSave, onClose }) {
  const [form, setForm] = useState({
    title:   note?.title   || '',
    content: note?.content || '',
    tags:    note?.tags    || [],
  });
  const [tagInput, setTagInput] = useState('');
  const [error, setError]       = useState('');

  const addTag = (tag) => {
    const t = tag.startsWith('#') ? tag : `#${tag}`;
    if (t && !form.tags.includes(t)) setForm(f => ({ ...f, tags: [...f.tags, t] }));
    setTagInput('');
  };
  const removeTag = (tag) => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));

  const handleSave = () => {
    if (!form.title.trim()) { setError('Note title is required'); return; }
    onSave({ ...note, ...form, title: form.title.trim(), content: form.content.trim() });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal p-6" style={{ maxWidth: 560 }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Clash Display', color: 'var(--text-primary)' }}>
            {note ? 'Edit Note' : 'New Note'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <div className="space-y-4">
          <input className="input-field text-base font-semibold" placeholder="Note title..."
            value={form.title} autoFocus
            onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setError(''); }} />
          {error && <p className="text-xs" style={{ color: '#f43f5e' }}>{error}</p>}

          <textarea className="input-field resize-none font-mono text-sm leading-relaxed"
            rows={9} placeholder="Start writing your notes here..."
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2 min-h-[24px]">
              {form.tags.map(tag => (
                <span key={tag} className="tag flex items-center gap-1 cursor-pointer"
                  onClick={() => removeTag(tag)}>
                  {tag} <X size={9} />
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="input-field flex-1" placeholder="Add tag e.g. #study"
                value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && tagInput.trim()) addTag(tagInput.trim()); }} />
              <button onClick={() => tagInput.trim() && addTag(tagInput.trim())} className="btn-ghost px-3">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_TAGS.filter(t => !form.tags.includes(t)).slice(0, 6).map(tag => (
                <button key={tag} onClick={() => addTag(tag)}
                  className="text-xs px-2 py-1 rounded-md transition-colors"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={handleSave} className="btn-primary flex-1">
            {note ? 'Save Changes' : 'Create Note'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Note Card ────────────────────────────────────────────────────────────────
function NoteCard({ note, onEdit, onDelete }) {
  const preview = note.content.split('\n').slice(0, 3).join('\n');
  return (
    <div className="card p-4 group cursor-pointer hover:scale-[1.01] transition-transform"
      onClick={() => onEdit(note)}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-sm flex-1 mr-2 leading-snug" style={{ color: 'var(--text-primary)' }}>
          {note.title}
        </h3>
        <button onClick={e => { e.stopPropagation(); onDelete(note.id); }}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0">
          <Trash2 size={13} style={{ color: '#f43f5e' }} />
        </button>
      </div>
      {preview && (
        <p className="text-xs leading-relaxed mb-3 line-clamp-3 font-mono whitespace-pre-line"
          style={{ color: 'var(--text-secondary)' }}>{preview}</p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {note.tags.slice(0, 3).map(tag => <span key={tag} className="tag text-xs">{tag}</span>)}
          {note.tags.length > 3 && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>+{note.tags.length - 3}</span>}
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {format(new Date(note.updatedAt), 'MMM d')}
        </span>
      </div>
    </div>
  );
}

// ─── Book Search Panel — Open Library API ────────────────────────────────────
function BookSearch() {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [searched, setSearched] = useState(false);
  const [savedBooks, setSavedBooks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('studyos_saved_books') || '[]'); } catch { return []; }
  });

  const debouncedQuery = useDebounce(query, 500);

  const doSearch = useCallback(async (q) => {
    if (!q?.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true); setError(''); setSearched(true);
    try {
      const { books } = await BooksAPI.search(q, 8);
      setResults(books);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-search on debounced input
  useMemo(() => { if (debouncedQuery) doSearch(debouncedQuery); }, [debouncedQuery, doSearch]);

  const toggleSave = (book) => {
    const updated = savedBooks.find(b => b.id === book.id)
      ? savedBooks.filter(b => b.id !== book.id)
      : [...savedBooks, book];
    setSavedBooks(updated);
    localStorage.setItem('studyos_saved_books', JSON.stringify(updated));
  };

  const isSaved = (id) => savedBooks.some(b => b.id === id);

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.12)' }}>
          <BookOpen size={15} style={{ color: '#10b981' }} />
        </div>
        <div>
          <h3 className="font-bold text-sm" style={{ fontFamily: 'Clash Display', color: 'var(--text-primary)' }}>
            Book Search
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Powered by Open Library API</p>
        </div>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
          style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
          🔴 Live API
        </span>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input className="input-field pl-9" placeholder="Search books e.g. React, Python, Data Structures..."
          value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSearch(query)} />
        {loading && (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)', animation: 'spin 1s linear infinite' }} />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg mb-4 text-xs" style={{ background: 'rgba(244,63,94,0.08)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {results.map(book => (
            <div key={book.id} className="flex items-start gap-3 p-3 rounded-xl transition-all"
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
              {/* Cover */}
              <div className="flex-shrink-0 w-10 h-14 rounded-lg overflow-hidden"
                style={{ background: 'var(--border)' }}>
                {book.cover
                  ? <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-lg">📚</div>}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                  {book.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{book.author}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {book.year && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{book.year}</span>}
                  {book.rating && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#f59e0b' }}>
                      <Star size={10} fill="#f59e0b" /> {book.rating}
                    </span>
                  )}
                  {book.pages && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{book.pages}p</span>}
                </div>
              </div>
              {/* Actions */}
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <button onClick={() => toggleSave(book)}
                  className={`p-1.5 rounded-lg transition-all text-xs font-bold ${isSaved(book.id) ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: 10, padding: '4px 8px' }}
                  title={isSaved(book.id) ? 'Remove from saved' : 'Save book'}>
                  {isSaved(book.id) ? '✓ Saved' : '+ Save'}
                </button>
                <a href={`https://openlibrary.org${book.id}`} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <ExternalLink size={11} style={{ color: 'var(--text-muted)' }} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && searched && results.length === 0 && !error && (
        <div className="empty-state py-6">
          <span className="text-3xl">📭</span>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>No books found</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Try a different search term</p>
        </div>
      )}

      {!searched && (
        <div className="text-center py-4">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            🔍 Type to search millions of books from Open Library
          </p>
        </div>
      )}

      {/* Saved Books */}
      {savedBooks.length > 0 && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
            📌 Saved Books ({savedBooks.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {savedBooks.map(b => (
              <div key={b.id} className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                {b.cover ? <img src={b.cover} alt="" className="w-4 h-4 rounded object-cover" /> : '📚'}
                <span className="max-w-[100px] truncate">{b.title}</span>
                <button onClick={() => toggleSave(b)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Notes Page ──────────────────────────────────────────────────────────
export default function Notes() {
  const { notes, addNote, updateNote, deleteNote } = useApp();
  const [search, setSearch]       = useState('');
  const [activeTag, setActiveTag] = useState('all');
  const [modal, setModal]         = useState(null); // null | 'new' | note object
  const [view, setView]           = useState('notes'); // 'notes' | 'books'

  const debouncedSearch = useDebounce(search, 300);

  const allTags = useMemo(() => {
    const set = new Set();
    notes.forEach(n => n.tags.forEach(t => set.add(t)));
    return ['all', ...Array.from(set)];
  }, [notes]);

  const filtered = useMemo(() => {
    let result = [...notes];
    if (debouncedSearch) result = result.filter(n =>
      n.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      n.content.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      n.tags.some(t => t.toLowerCase().includes(debouncedSearch.toLowerCase()))
    );
    if (activeTag !== 'all') result = result.filter(n => n.tags.includes(activeTag));
    return result;
  }, [notes, debouncedSearch, activeTag]);

  const handleSave = useCallback((note) => {
    if (note.id) updateNote(note); else addNote(note);
  }, [addNote, updateNote]);

  const handleDelete = useCallback((id) => {
    if (confirm('Delete this note?')) deleteNote(id);
  }, [deleteNote]);

  return (
    <div className="page-enter space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Clash Display', color: 'var(--text-primary)' }}>
            Notes
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{notes.length} notes saved</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <button onClick={() => setView('notes')}
              className={`px-3 py-2 text-xs font-semibold transition-all ${view === 'notes' ? 'btn-primary rounded-none' : ''}`}
              style={{ background: view === 'notes' ? undefined : 'var(--bg-tertiary)', color: view === 'notes' ? undefined : 'var(--text-secondary)' }}>
              📝 Notes
            </button>
            <button onClick={() => setView('books')}
              className={`px-3 py-2 text-xs font-semibold transition-all flex items-center gap-1 ${view === 'books' ? 'btn-primary rounded-none' : ''}`}
              style={{ background: view === 'books' ? undefined : 'var(--bg-tertiary)', color: view === 'books' ? undefined : 'var(--text-secondary)' }}>
              📚 Books
              <span className="text-xs px-1 py-0.5 rounded font-bold"
                style={{ background: 'rgba(14,165,233,0.15)', color: '#0ea5e9', fontSize: 9 }}>API</span>
            </button>
          </div>
          {view === 'notes' && (
            <button onClick={() => setModal('new')} className="btn-primary flex items-center gap-2">
              <Plus size={15} /> New Note
            </button>
          )}
        </div>
      </div>

      {/* Book Search View */}
      {view === 'books' && <BookSearch />}

      {/* Notes View */}
      {view === 'notes' && (
        <>
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input className="input-field pl-9" placeholder="Search notes, content, tags..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Tag Filter */}
          <div className="flex gap-2 flex-wrap">
            {allTags.map(tag => (
              <button key={tag} onClick={() => setActiveTag(tag)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${activeTag === tag ? 'btn-primary' : 'btn-ghost'}`}>
                {tag === 'all' ? '🗂 All' : tag}
              </button>
            ))}
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <span className="text-5xl">📝</span>
                <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>No notes found</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Create your first note to get started</p>
                <button onClick={() => setModal('new')} className="btn-primary mt-2">New Note</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(note => (
                <NoteCard key={note.id} note={note}
                  onEdit={n => setModal(n)} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {modal && (
        <NoteModal note={modal === 'new' ? null : modal}
          onSave={handleSave} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
