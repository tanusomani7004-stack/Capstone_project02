import { useMemo, useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';
import { useAIInsights } from '../hooks';
import { QuotesAPI, NumbersAPI } from '../services/api';
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, RefreshCw, Quote } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const GREETINGS = [
  'Good night','Good night','Good night','Good night','Good night','Good night',
  'Good morning','Good morning','Good morning','Good morning','Good morning','Good morning',
  'Good afternoon','Good afternoon','Good afternoon','Good afternoon','Good afternoon',
  'Good evening','Good evening','Good evening','Good evening','Good evening',
  'Good night','Good night',
];

// ── Circular Score Gauge ──────────────────────────────────────────────────────
function ScoreGauge({ score }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#f43f5e';
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" strokeWidth="8" stroke="var(--border)" />
          <circle cx="50" cy="50" r={r} fill="none" strokeWidth="8"
            stroke={color} strokeLinecap="round"
            strokeDasharray={`${(score / 100) * circ} ${circ}`}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dasharray 1s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold" style={{ color, fontFamily: 'Clash Display' }}>{score}%</span>
        </div>
      </div>
      <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>Productivity Score</p>
    </div>
  );
}

// ── Quote Widget — Real quotable.io API ───────────────────────────────────────
function QuoteWidget() {
  const [quote, setQuote]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadQuote = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const q = await QuotesAPI.getRandom();
      setQuote(q);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadQuote(); }, [loadQuote]);

  return (
    <div className="card p-5 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.05), rgba(139,92,246,0.04))' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(14,165,233,0.12)' }}>
            <Quote size={13} style={{ color: '#0ea5e9' }} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Daily Motivation
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
            style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
            🔴 Live API
          </span>
        </div>
        <button onClick={() => loadQuote(true)} disabled={refreshing}
          className="p-1.5 rounded-lg transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20"
          title="Get new quote" style={{ border: '1px solid var(--border)' }}>
          <RefreshCw size={13}
            style={{ color: 'var(--text-muted)', animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-2 py-1">
          <div className="skeleton h-3.5 rounded-md" style={{ width: '90%' }} />
          <div className="skeleton h-3.5 rounded-md" style={{ width: '75%' }} />
          <div className="skeleton h-3 rounded-md mt-3" style={{ width: '35%' }} />
        </div>
      ) : quote ? (
        <div>
          <p className="text-sm leading-relaxed italic mb-2" style={{ color: 'var(--text-primary)' }}>
            "{quote.text}"
          </p>
          <p className="text-xs font-semibold" style={{ color: '#0ea5e9' }}>
            — {quote.author}
          </p>
        </div>
      ) : (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Could not load quote.</p>
      )}

      {/* Decorative large quote mark */}
      <div style={{
        position: 'absolute', bottom: -8, right: 8,
        fontSize: 72, opacity: 0.04, lineHeight: 1,
        color: 'var(--text-primary)', fontFamily: 'Georgia, serif',
        pointerEvents: 'none',
      }}>"</div>
    </div>
  );
}

// ── Number Fact — Real numbersapi.com ─────────────────────────────────────────
function NumberFact({ count }) {
  const [fact, setFact]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!count) { setLoading(false); return; }
    setLoading(true);
    NumbersAPI.getMathFact(count)
      .then(f => setFact(f))
      .finally(() => setLoading(false));
  }, [count]);

  if (!count) return null;

  return (
    <div className="p-3 rounded-xl" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span>🔢</span>
        <span className="text-xs font-bold" style={{ color: '#8b5cf6' }}>Numbers API</span>
      </div>
      {loading
        ? <div className="skeleton h-3 rounded w-3/4" />
        : <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{fact?.fact}</p>
      }
    </div>
  );
}

// ── Main Dashboard Page ───────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, tasks, productivityScore, todayTasks, completedToday, productivityHistory, darkMode } = useApp();
  const hour     = new Date().getHours();
  const greeting = GREETINGS[hour] || 'Hello';
  const today    = format(new Date(), 'EEEE, MMMM d');
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const pending = todayTasks.filter(t => t.status === 'pending').length;
  const overdue = tasks.filter(t => t.dueDate < todayStr && t.status === 'pending').length;
  const total   = tasks.length;
  const allDone = tasks.filter(t => t.status === 'completed').length;

  const getInsights = useAIInsights(tasks, productivityScore);
  const insights    = useMemo(() => getInsights(), [getInsights]);

  const textColor = darkMode ? '#64748b' : '#94a3b8';
  const gridColor = darkMode ? '#1e293b' : '#f1f5f9';

  // Chart data
  const barData = {
    labels: productivityHistory.map(d => format(new Date(d.date), 'EEE')),
    datasets: [
      {
        label: 'Completed',
        data: productivityHistory.map(d => d.completed),
        backgroundColor: 'rgba(14,165,233,0.8)',
        borderRadius: 8, borderSkipped: false,
      },
      {
        label: 'Pending',
        data: productivityHistory.map(d => d.total - d.completed),
        backgroundColor: darkMode ? 'rgba(30,41,59,0.9)' : 'rgba(241,245,249,0.9)',
        borderRadius: 8, borderSkipped: false,
      },
    ],
  };
  const barOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { color: textColor, font: { size: 11 } } },
      y: { stacked: true, grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 } }, beginAtZero: true },
    },
  };

  const donutData = {
    labels: ['Completed', 'Remaining'],
    datasets: [{
      data: [allDone, total - allDone],
      backgroundColor: ['#10b981', darkMode ? '#1e293b' : '#f1f5f9'],
      borderWidth: 0, hoverOffset: 4,
    }],
  };
  const donutOpts = {
    responsive: true, maintainAspectRatio: false, cutout: '72%',
    plugins: { legend: { display: false } },
  };

  const insightStyle = {
    rose:    { bg: 'rgba(244,63,94,0.07)',   border: 'rgba(244,63,94,0.2)'   },
    amber:   { bg: 'rgba(245,158,11,0.07)',  border: 'rgba(245,158,11,0.2)'  },
    violet:  { bg: 'rgba(139,92,246,0.07)',  border: 'rgba(139,92,246,0.2)'  },
    emerald: { bg: 'rgba(16,185,129,0.07)',  border: 'rgba(16,185,129,0.2)'  },
    blue:    { bg: 'rgba(14,165,233,0.07)',  border: 'rgba(14,165,233,0.2)'  },
  };

  return (
    <div className="page-enter space-y-5">

      {/* ── Greeting ── */}
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Clash Display', color: 'var(--text-primary)' }}>
          {greeting}, {user?.name?.split(' ')[0] || 'Student'} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {today} — Let's make today count!
        </p>
      </div>

      {/* ── Live Quote (quotable.io API) ── */}
      <QuoteWidget />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Done Today',  value: completedToday,   sub: `of ${todayTasks.length} tasks`, icon: <CheckCircle2 size={15}/>, accent: 'blue',    bg: 'rgba(14,165,233,0.12)',  color: '#0ea5e9' },
          { label: 'Pending',     value: pending,          sub: 'due today',                     icon: <Clock size={15}/>,        accent: 'amber',   bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
          { label: 'Total Tasks', value: total,            sub: `${allDone} completed`,          icon: <TrendingUp size={15}/>,   accent: 'violet',  bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6' },
          { label: 'Overdue',     value: overdue,          sub: 'tasks overdue',                 icon: <AlertTriangle size={15}/>,accent: 'emerald', bg: 'rgba(244,63,94,0.12)',  color: overdue > 0 ? '#f43f5e' : '#10b981' },
        ].map(({ label, value, sub, icon, accent, bg, color }) => (
          <div key={label} className={`stat-card ${accent}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                <span style={{ color }}>{icon}</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                {label}
              </span>
            </div>
            <p className="text-3xl font-bold"
              style={{ fontFamily: 'Clash Display', color: label === 'Overdue' && value > 0 ? '#f43f5e' : 'var(--text-primary)' }}>
              {value}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-bold mb-4 text-xs uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            Weekly Task Activity
          </h3>
          <div style={{ height: 200 }}>
            <Bar data={barData} options={barOpts} />
          </div>
        </div>

        <div className="card p-5 flex flex-col items-center justify-center gap-4">
          <h3 className="font-bold text-xs uppercase tracking-wide self-start" style={{ color: 'var(--text-secondary)' }}>
            All Time
          </h3>
          <div className="relative" style={{ width: 130, height: 130 }}>
            <Doughnut data={donutData} options={donutOpts} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold" style={{ fontFamily: 'Clash Display', color: 'var(--text-primary)' }}>
                {total > 0 ? Math.round((allDone / total) * 100) : 0}%
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>done</span>
            </div>
          </div>
          <ScoreGauge score={productivityScore} />
          {/* Numbers API fact */}
          <div className="w-full">
            <NumberFact count={allDone} />
          </div>
        </div>
      </div>

      {/* ── AI Insights + Today's Tasks ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <span>🤖</span>
            <h3 className="font-bold" style={{ fontFamily: 'Clash Display', color: 'var(--text-primary)' }}>
              AI Insights
            </h3>
            <div className="w-2 h-2 rounded-full" style={{ background: '#10b981', animation: 'pulse 2s infinite' }} />
          </div>
          <div className="space-y-2">
            {insights.map(ins => {
              const s = insightStyle[ins.color] || insightStyle.blue;
              return (
                <div key={ins.id} className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: s.border, fontSize: 14 }}>
                    {ins.icon}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {ins.message}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-bold mb-4" style={{ fontFamily: 'Clash Display', color: 'var(--text-primary)' }}>
            Today's Tasks
          </h3>
          {todayTasks.length === 0 ? (
            <div className="empty-state">
              <span className="text-4xl">🎉</span>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>No tasks today!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {todayTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'var(--bg-tertiary)' }}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    task.priority === 'high' ? 'bg-red-400' : task.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} />
                  <span className={`flex-1 text-sm ${task.status === 'completed' ? 'line-through' : ''}`}
                    style={{ color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    {task.title}
                  </span>
                  {task.status === 'completed' && <CheckCircle2 size={14} style={{ color: '#10b981' }} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
