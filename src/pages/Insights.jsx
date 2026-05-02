import { useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { useApp } from '../context/AppContext';
import { useAIInsights } from '../hooks';

const INSIGHT_COLORS = {
  rose: { bg: 'rgba(244,63,94,0.08)', icon: 'rgba(244,63,94,0.15)', text: '#f43f5e', border: 'rgba(244,63,94,0.2)' },
  amber: { bg: 'rgba(245,158,11,0.08)', icon: 'rgba(245,158,11,0.15)', text: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
  violet: { bg: 'rgba(139,92,246,0.08)', icon: 'rgba(139,92,246,0.15)', text: '#8b5cf6', border: 'rgba(139,92,246,0.2)' },
  emerald: { bg: 'rgba(16,185,129,0.08)', icon: 'rgba(16,185,129,0.15)', text: '#10b981', border: 'rgba(16,185,129,0.2)' },
  blue: { bg: 'rgba(14,165,233,0.08)', icon: 'rgba(14,165,233,0.15)', text: '#0ea5e9', border: 'rgba(14,165,233,0.2)' },
};

const TYPE_LABELS = {
  warning: { label: 'Warning', emoji: '⚠️' },
  success: { label: 'Achievement', emoji: '🏆' },
  tip: { label: 'Tip', emoji: '💡' },
  info: { label: 'Info', emoji: 'ℹ️' },
  wellness: { label: 'Wellness', emoji: '🌿' },
};

const PRODUCTIVITY_TIPS = [
  { icon: '🍅', title: 'Pomodoro Technique', tip: 'Work for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer 15-30 minute break. This prevents burnout and maintains focus.' },
  { icon: '📋', title: 'Eat the Frog', tip: 'Start your day with the most challenging or important task. Once it\'s done, everything else feels easier and you build momentum.' },
  { icon: '📵', title: 'Digital Detox Blocks', tip: 'Schedule phone-free hours during your peak study time. Notifications are the #1 destroyer of deep work sessions.' },
  { icon: '💤', title: 'Sleep Optimization', tip: 'Aim for 7-9 hours of sleep. Memory consolidation happens during sleep — pulling an all-nighter before an exam actually hurts performance.' },
  { icon: '🧠', title: 'Spaced Repetition', tip: 'Review material at increasing intervals: 1 day, 3 days, 7 days, 14 days. This is proven to be 2-5x more effective than massed practice.' },
  { icon: '✍️', title: 'Active Recall', tip: 'Instead of re-reading notes, close them and try to recall key concepts. Testing yourself is far more effective for long-term retention.' },
];

export default function Insights() {
  const { tasks, productivityScore, productivityHistory } = useApp();
  const getInsights = useAIInsights(tasks, productivityScore);
  const insights = useMemo(() => getInsights(), [getInsights]);

  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  const todayCompleted = tasks.filter(t => t.dueDate === today && t.status === 'completed').length;
  const yesterdayCompleted = tasks.filter(t => t.dueDate === yesterday && t.status === 'completed').length;
  const trend = todayCompleted > yesterdayCompleted ? 'up' : todayCompleted < yesterdayCompleted ? 'down' : 'same';

  const overdueTasks = tasks.filter(t => t.dueDate < today && t.status === 'pending');
  const highPriorityPending = tasks.filter(t => t.priority === 'high' && t.status === 'pending');
  const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');
  const tomorrowTasks = tasks.filter(t => t.dueDate === tomorrow);

  const weekScore = productivityHistory.slice(-7).reduce((sum, d) => sum + d.score, 0) / 7;

  return (
    <div className="page-enter space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Clash Display', color: 'var(--text-primary)' }}>
          🤖 AI Insights
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Personalized recommendations based on your activity
        </p>
      </div>

      {/* Live Insights */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="font-bold" style={{ fontFamily: 'Clash Display', color: 'var(--text-primary)' }}>Live Analysis</h2>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>Updated now</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map(insight => {
            const c = INSIGHT_COLORS[insight.color];
            const typeInfo = TYPE_LABELS[insight.type];
            return (
              <div key={insight.id} className="p-4 rounded-xl border" style={{ background: c.bg, borderColor: c.border }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: c.icon }}>
                    {insight.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wide" style={{ color: c.text }}>{typeInfo.label}</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{insight.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 text-center">
          <div className="text-4xl mb-2">{trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️'}</div>
          <p className="text-xl font-bold" style={{ fontFamily: 'Clash Display', color: trend === 'up' ? '#10b981' : trend === 'down' ? '#f43f5e' : '#f59e0b' }}>
            {trend === 'up' ? 'Improving!' : trend === 'down' ? 'Slowing Down' : 'Consistent'}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {todayCompleted} done today vs {yesterdayCompleted} yesterday
          </p>
        </div>

        <div className="card p-5 text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-xl font-bold" style={{ fontFamily: 'Clash Display', color: weekScore >= 70 ? '#10b981' : weekScore >= 40 ? '#f59e0b' : '#f43f5e' }}>
            {Math.round(weekScore)}%
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Average weekly score</p>
        </div>

        <div className="card p-5 text-center">
          <div className="text-4xl mb-2">{overdueTasks.length === 0 ? '✅' : '⚠️'}</div>
          <p className="text-xl font-bold" style={{ fontFamily: 'Clash Display', color: overdueTasks.length === 0 ? '#10b981' : '#f43f5e' }}>
            {overdueTasks.length === 0 ? 'All Clear!' : `${overdueTasks.length} Overdue`}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {overdueTasks.length === 0 ? 'No overdue tasks' : 'Tasks need attention'}
          </p>
        </div>
      </div>

      {/* Action Items */}
      {(overdueTasks.length > 0 || highPriorityPending.length > 0 || tomorrowTasks.length >= 3) && (
        <div className="card p-5">
          <h2 className="font-bold mb-4" style={{ fontFamily: 'Clash Display', color: 'var(--text-primary)' }}>📌 Action Items</h2>
          <div className="space-y-3">
            {overdueTasks.slice(0, 3).map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.15)' }}>
                <span>🔴</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                  <p className="text-xs" style={{ color: '#f43f5e' }}>Overdue since {task.dueDate}</p>
                </div>
              </div>
            ))}
            {highPriorityPending.slice(0, 2).map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <span>🎯</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                  <p className="text-xs" style={{ color: '#f59e0b' }}>High priority — due {task.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Productivity Tips */}
      <div className="card p-5">
        <h2 className="font-bold mb-4" style={{ fontFamily: 'Clash Display', color: 'var(--text-primary)' }}>💡 Productivity Playbook</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRODUCTIVITY_TIPS.map(({ icon, title, tip }) => (
            <div key={title} className="p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
              <div className="text-2xl mb-2">{icon}</div>
              <h4 className="font-bold text-sm mb-1.5" style={{ color: 'var(--text-primary)' }}>{title}</h4>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
