import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { subDays, format } from 'date-fns';

// ─── Initial Data ────────────────────────────────────────────────────────────
const today = format(new Date(), 'yyyy-MM-dd');
const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');
const nextWeek = format(new Date(Date.now() + 7 * 86400000), 'yyyy-MM-dd');

const INITIAL_TASKS = [
  { id: uuid(), title: 'Complete React assignment', priority: 'high', dueDate: today, status: 'completed', createdAt: new Date(Date.now() - 3600000).toISOString(), category: 'study' },
  { id: uuid(), title: 'Review chapter 5 notes', priority: 'medium', dueDate: today, status: 'completed', createdAt: new Date(Date.now() - 7200000).toISOString(), category: 'study' },
  { id: uuid(), title: 'Submit lab report', priority: 'high', dueDate: today, status: 'pending', createdAt: new Date().toISOString(), category: 'project' },
  { id: uuid(), title: 'Group project meeting', priority: 'high', dueDate: tomorrow, status: 'pending', createdAt: new Date().toISOString(), category: 'project' },
  { id: uuid(), title: 'Watch lecture recordings', priority: 'medium', dueDate: tomorrow, status: 'pending', createdAt: new Date().toISOString(), category: 'study' },
  { id: uuid(), title: 'Practice coding problems', priority: 'medium', dueDate: tomorrow, status: 'pending', createdAt: new Date().toISOString(), category: 'study' },
  { id: uuid(), title: 'Read research paper', priority: 'low', dueDate: nextWeek, status: 'pending', createdAt: new Date().toISOString(), category: 'study' },
  { id: uuid(), title: 'Prepare presentation slides', priority: 'high', dueDate: nextWeek, status: 'pending', createdAt: new Date().toISOString(), category: 'project' },
  { id: uuid(), title: 'Complete yesterday\'s homework', priority: 'medium', dueDate: yesterday, status: 'completed', createdAt: new Date(Date.now() - 86400000).toISOString(), category: 'study' },
  { id: uuid(), title: 'Attend tutorial session', priority: 'low', dueDate: yesterday, status: 'completed', createdAt: new Date(Date.now() - 86400000).toISOString(), category: 'study' },
];

const INITIAL_NOTES = [
  { id: uuid(), title: 'React Hooks Summary', content: 'useState: Local state management\nuseEffect: Side effects & lifecycle\nuseCallback: Memoized callbacks\nuseMemo: Memoized values\nuseRef: DOM refs & mutable values', tags: ['#react', '#study'], createdAt: new Date(Date.now() - 3600000).toISOString(), updatedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: uuid(), title: 'Algorithm Notes - Sorting', content: 'Bubble Sort: O(n²)\nMerge Sort: O(n log n)\nQuick Sort: O(n log n) avg\nHeap Sort: O(n log n)\n\nRemember: stability matters for equal elements!', tags: ['#algorithms', '#study'], createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: uuid(), title: 'Project Ideas', content: '1. Student expense tracker app\n2. Study timer with Pomodoro\n3. Note-taking with AI summaries\n4. Campus map navigator', tags: ['#project', '#ideas'], createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date(Date.now() - 172800000).toISOString() },
];

const PRODUCTIVITY_HISTORY = Array.from({ length: 7 }, (_, i) => {
  const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
  const completed = Math.floor(Math.random() * 5) + 1;
  const total = completed + Math.floor(Math.random() * 3);
  return { date, completed, total, score: Math.round((completed / total) * 100) };
});

// ─── Reducer ────────────────────────────────────────────────────────────────
const initialState = {
  user: null,
  tasks: INITIAL_TASKS,
  notes: INITIAL_NOTES,
  darkMode: false,
  productivityHistory: PRODUCTIVITY_HISTORY,
  selectedDate: today,
  isLoading: false,
  error: null,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'LOGIN': return { ...state, user: action.payload };
    case 'LOGOUT': return { ...state, user: null };
    case 'TOGGLE_DARK': return { ...state, darkMode: !state.darkMode };
    case 'SET_DARK': return { ...state, darkMode: action.payload };

    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload
          ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
          : t)
      };

    case 'ADD_NOTE':
      return { ...state, notes: [action.payload, ...state.notes] };
    case 'UPDATE_NOTE':
      return { ...state, notes: state.notes.map(n => n.id === action.payload.id ? action.payload : n) };
    case 'DELETE_NOTE':
      return { ...state, notes: state.notes.filter(n => n.id !== action.payload) };

    case 'SET_DATE': return { ...state, selectedDate: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload };
    case 'CLEAR_ERROR': return { ...state, error: null };

    default: return state;
  }
}

// ─── Context ────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState, (init) => {
    try {
      const saved = localStorage.getItem('studyos_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...init, ...parsed, isLoading: false, error: null };
      }
    } catch {}
    return init;
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('studyos_state', JSON.stringify({
        user: state.user,
        tasks: state.tasks,
        notes: state.notes,
        darkMode: state.darkMode,
        productivityHistory: state.productivityHistory,
      }));
    } catch {}
  }, [state.user, state.tasks, state.notes, state.darkMode, state.productivityHistory]);

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.darkMode);
  }, [state.darkMode]);

  // Actions
  const login = useCallback((credentials) => {
    if (credentials.email && credentials.password) {
      dispatch({ type: 'LOGIN', payload: { name: credentials.name || 'Alex Chen', email: credentials.email, avatar: credentials.email[0].toUpperCase() } });
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), []);
  const toggleDark = useCallback(() => dispatch({ type: 'TOGGLE_DARK' }), []);

  const addTask = useCallback((task) => {
    dispatch({ type: 'ADD_TASK', payload: { id: uuid(), ...task, status: 'pending', createdAt: new Date().toISOString() } });
  }, []);

  const updateTask = useCallback((task) => dispatch({ type: 'UPDATE_TASK', payload: task }), []);
  const deleteTask = useCallback((id) => dispatch({ type: 'DELETE_TASK', payload: id }), []);
  const toggleTask = useCallback((id) => dispatch({ type: 'TOGGLE_TASK', payload: id }), []);

  const addNote = useCallback((note) => {
    dispatch({ type: 'ADD_NOTE', payload: { id: uuid(), ...note, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } });
  }, []);
  const updateNote = useCallback((note) => dispatch({ type: 'UPDATE_NOTE', payload: { ...note, updatedAt: new Date().toISOString() } }), []);
  const deleteNote = useCallback((id) => dispatch({ type: 'DELETE_NOTE', payload: id }), []);
  const setSelectedDate = useCallback((date) => dispatch({ type: 'SET_DATE', payload: date }), []);

  // Computed
  const todayTasks = state.tasks.filter(t => t.dueDate === today);
  const completedToday = todayTasks.filter(t => t.status === 'completed').length;
  const productivityScore = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 0;

  const value = {
    ...state,
    login, logout, toggleDark,
    addTask, updateTask, deleteTask, toggleTask,
    addNote, updateNote, deleteNote,
    setSelectedDate,
    todayTasks, completedToday, productivityScore,
    today,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
