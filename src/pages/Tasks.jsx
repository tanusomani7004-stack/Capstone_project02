import { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';
import { useDebounce } from '../hooks';
import { Plus, Search, Trash2, Edit3, Check, X, ChevronDown, SlidersHorizontal } from 'lucide-react';

const PRIORITY_OPTIONS = ['all', 'high', 'medium', 'low'];
const STATUS_OPTIONS = ['all', 'pending', 'completed'];
const SORT_OPTIONS = [
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'createdAt', label: 'Created' },
  { value: 'title', label: 'Title' },
];
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate || format(new Date(), 'yyyy-MM-dd'),
    category: task?.category || 'study',
    status: task?.status || 'pending',
  });
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!form.title.trim()) { setError('Task title is required'); return; }
    onSave({ ...task, ...form, title: form.title.trim() });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Clash Display', color: 'var(--text-primary)' }}>
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Task Title *</label>
            <input className="input-field" placeholder="What needs to be done?" value={form.title}
              onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} autoFocus />
            {error && <p className="text-xs mt-1" style={{ color: '#f43f5e' }}>{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Priority</label>
              <select className="input-field" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Category</label>
              <select className="input-field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="study">📚 Study</option>
                <option value="project">🚀 Project</option>
                <option value="personal">👤 Personal</option>
                <option value="exam">📝 Exam</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Due Date</label>
            <input type="date" className="input-field" value={form.dueDate}
              onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
          </div>

          {task && (
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Status</label>
              <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="pending">⏳ Pending</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary flex-1">{task ? 'Save Changes' : 'Add Task'}</button>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const isOverdue = task.dueDate < today && task.status === 'pending';

  const priorityColors = { high: { bg: 'rgba(244,63,94,0.08)', text: '#f43f5e', dot: '#f43f5e' }, medium: { bg: 'rgba(245,158,11,0.08)', text: '#f59e0b', dot: '#f59e0b' }, low: { bg: 'rgba(16,185,129,0.08)', text: '#10b981', dot: '#10b981' } };
  const p = priorityColors[task.priority];

  const categoryEmoji = { study: '📚', project: '🚀', personal: '👤', exam: '📝' };

  return (
    <div className={`card p-4 flex items-start gap-3 group transition-all ${task.status === 'completed' ? 'opacity-60' : ''}`}>
      <button onClick={() => onToggle(task.id)}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${task.status === 'completed' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 hover:border-brand-500'}`}>
        {task.status === 'completed' && <Check size={12} className="text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <span className={`font-medium text-sm flex-1 ${task.status === 'completed' ? 'line-through' : ''}`}
            style={{ color: 'var(--text-primary)' }}>
            {task.title}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="badge text-xs" style={{ background: p.bg, color: p.text }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.dot, display: 'inline-block' }} />
            {task.priority}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {categoryEmoji[task.category] || '📌'} {task.category}
          </span>
          <span className={`text-xs font-medium ${isOverdue ? 'text-red-400' : ''}`}
            style={{ color: isOverdue ? '#f43f5e' : 'var(--text-muted)' }}>
            {isOverdue ? '⚠️ ' : '📅 '}
            {task.dueDate === today ? 'Today' : task.dueDate === format(new Date(Date.now() + 86400000), 'yyyy-MM-dd') ? 'Tomorrow' : format(new Date(task.dueDate + 'T00:00:00'), 'MMM d')}
          </span>
        </div>
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(task)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
          <Edit3 size={14} style={{ color: '#0ea5e9' }} />
        </button>
        <button onClick={() => onDelete(task.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <Trash2 size={14} style={{ color: '#f43f5e' }} />
        </button>
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

export default function Tasks() {
  const { tasks, addTask, updateTask, deleteTask, toggleTask } = useApp();
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('dueDate');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | 'add' | task object
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const filtered = useMemo(() => {
    let result = [...tasks];
    if (debouncedSearch) result = result.filter(t => t.title.toLowerCase().includes(debouncedSearch.toLowerCase()));
    if (priority !== 'all') result = result.filter(t => t.priority === priority);
    if (status !== 'all') result = result.filter(t => t.status === status);

    result.sort((a, b) => {
      let cmp = 0;
      if (sort === 'priority') cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      else if (sort === 'dueDate') cmp = a.dueDate.localeCompare(b.dueDate);
      else if (sort === 'title') cmp = a.title.localeCompare(b.title);
      else cmp = new Date(b.createdAt) - new Date(a.createdAt);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [tasks, debouncedSearch, priority, status, sort, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSave = useCallback((task) => {
    if (task.id) updateTask(task);
    else addTask(task);
    setPage(1);
  }, [addTask, updateTask]);

  const handleDelete = useCallback((id) => {
    if (confirm('Delete this task?')) deleteTask(id);
  }, [deleteTask]);

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;

  return (
    <div className="page-enter space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Clash Display', color: 'var(--text-primary)' }}>Tasks</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {completedCount} completed · {pendingCount} pending
          </p>
        </div>
        <button onClick={() => setModal('add')} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Search + Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input className="input-field pl-9" placeholder="Search tasks..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`btn-ghost flex items-center gap-2 ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : ''}`}>
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Priority</label>
              <select className="input-field text-xs" value={priority} onChange={e => { setPriority(e.target.value); setPage(1); }}>
                {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p === 'all' ? 'All priorities' : p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Status</label>
              <select className="input-field text-xs" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'all' ? 'All status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Sort By</label>
              <select className="input-field text-xs" value={sort} onChange={e => setSort(e.target.value)}>
                {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Direction</label>
              <select className="input-field text-xs" value={sortDir} onChange={e => setSortDir(e.target.value)}>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Task List */}
      <div>
        {filtered.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <span className="text-5xl">📋</span>
              <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>No tasks found</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try adjusting filters or add a new task</p>
              <button onClick={() => setModal('add')} className="btn-primary mt-2">Add Task</button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {paginated.map(task => (
              <TaskCard key={task.id} task={task}
                onToggle={toggleTask} onEdit={(t) => setModal(t)} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <button className="btn-ghost px-3 py-2 text-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${p === page ? 'btn-primary' : 'btn-ghost'}`}>
                {p}
              </button>
            ))}
            <button className="btn-ghost px-3 py-2 text-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <TaskModal task={modal === 'add' ? null : modal}
          onSave={handleSave} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
