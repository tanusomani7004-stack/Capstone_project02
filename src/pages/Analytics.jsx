import { useMemo } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { useApp } from '../context/AppContext';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, RadialLinearScale, Filler, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Filler, Tooltip, Legend);

export default function Analytics() {
  const { tasks, darkMode } = useApp();

  const textColor = darkMode ? '#64748b' : '#94a3b8';
  const gridColor = darkMode ? 'rgba(30,41,59,0.8)' : 'rgba(241,245,249,1)';

  const last7Days = useMemo(() => {
    return eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() })
      .map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayTasks = tasks.filter(t => t.dueDate === dateStr);
        const completed = dayTasks.filter(t => t.status === 'completed').length;
        return { date: format(day, 'EEE'), dateStr, total: dayTasks.length, completed, score: dayTasks.length ? Math.round((completed / dayTasks.length) * 100) : 0 };
      });
  }, [tasks]);

  const priorityBreakdown = useMemo(() => {
    const high = tasks.filter(t => t.priority === 'high').length;
    const medium = tasks.filter(t => t.priority === 'medium').length;
    const low = tasks.filter(t => t.priority === 'low').length;
    return { high, medium, low };
  }, [tasks]);

  const categoryBreakdown = useMemo(() => {
    const cats = {};
    tasks.forEach(t => { cats[t.category] = (cats[t.category] || 0) + 1; });
    return cats;
  }, [tasks]);

  const completionRate = tasks.length ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0;
  const avgDaily = (last7Days.reduce((sum, d) => sum + d.completed, 0) / 7).toFixed(1);
  const peakDay = last7Days.reduce((max, d) => d.completed > max.completed ? d : max, last7Days[0]);
  const streak = (() => {
    let s = 0;
    for (let i = last7Days.length - 1; i >= 0; i--) {
      if (last7Days[i].completed > 0) s++;
      else break;
    }
    return s;
  })();

  const lineData = {
    labels: last7Days.map(d => d.date),
    datasets: [{
      label: 'Productivity Score',
      data: last7Days.map(d => d.score),
      borderColor: '#0ea5e9',
      backgroundColor: 'rgba(14,165,233,0.08)',
      borderWidth: 2.5,
      pointBackgroundColor: '#0ea5e9',
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.4,
      fill: true,
    }]
  };

  const barData = {
    labels: last7Days.map(d => d.date),
    datasets: [
      {
        label: 'Completed',
        data: last7Days.map(d => d.completed),
        backgroundColor: 'rgba(16,185,129,0.8)',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Pending',
        data: last7Days.map(d => d.total - d.completed),
        backgroundColor: darkMode ? 'rgba(30,41,59,0.9)' : 'rgba(241,245,249,0.9)',
        borderRadius: 6,
        borderSkipped: false,
      }
    ]
  };

  const doughnutData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [{
      data: [priorityBreakdown.high, priorityBreakdown.medium, priorityBreakdown.low],
      backgroundColor: ['#f43f5e', '#f59e0b', '#10b981'],
      borderWidth: 0,
      hoverOffset: 6,
    }]
  };

  const categoryData = {
    labels: Object.keys(categoryBreakdown).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
    datasets: [{
      label: 'Tasks',
      data: Object.values(categoryBreakdown),
      backgroundColor: ['rgba(14,165,233,0.8)', 'rgba(139,92,246,0.8)', 'rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)'],
      borderRadius: 6,
      borderSkipped: false,
    }]
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: darkMode ? '#1e293b' : 'white', titleColor: darkMode ? '#f1f5f9' : '#0f172a', bodyColor: darkMode ? '#94a3b8' : '#475569', borderColor: darkMode ? '#334155' : '#e2e8f0', borderWidth: 1, padding: 10, cornerRadius: 10 },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: textColor, font: { size: 11 } } },
      y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 } }, beginAtZero: true },
    }
  };

  return (
    <div className="page-enter space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Clash Display', color: 'var(--text-primary)' }}>Analytics</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Track your performance trends</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Completion Rate', value: `${completionRate}%`, sub: 'all time', color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
          { label: 'Daily Average', value: avgDaily, sub: 'tasks completed', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Peak Day', value: peakDay?.date || '—', sub: `${peakDay?.completed || 0} tasks`, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
          { label: 'Day Streak', value: `${streak}d`, sub: 'consecutive active days', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        ].map(({ label, value, sub, color, bg }) => (
          <div key={label} className="card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <p className="text-3xl font-bold" style={{ fontFamily: 'Clash Display', color }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="font-bold text-sm uppercase tracking-wide mb-4" style={{ color: 'var(--text-secondary)' }}>Productivity Trend (7 Days)</h3>
          <div style={{ height: 220 }}>
            <Line data={lineData} options={{ ...commonOptions }} />
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-sm uppercase tracking-wide mb-4" style={{ color: 'var(--text-secondary)' }}>Daily Task Completion</h3>
          <div style={{ height: 220 }}>
            <Bar data={barData} options={{ ...commonOptions, plugins: { ...commonOptions.plugins, legend: { display: true, position: 'top', labels: { color: textColor, font: { size: 11 }, boxWidth: 12, padding: 16 } } }, scales: { x: { stacked: true, grid: { display: false }, ticks: { color: textColor, font: { size: 11 } } }, y: { stacked: true, grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 } }, beginAtZero: true } } }} />
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-sm uppercase tracking-wide mb-4" style={{ color: 'var(--text-secondary)' }}>Priority Breakdown</h3>
          <div className="flex items-center justify-center gap-8">
            <div style={{ width: 180, height: 180 }}>
              <Doughnut data={doughnutData} options={{ ...commonOptions, cutout: '65%', scales: undefined }} />
            </div>
            <div className="space-y-3">
              {[{ label: 'High', count: priorityBreakdown.high, color: '#f43f5e' }, { label: 'Medium', count: priorityBreakdown.medium, color: '#f59e0b' }, { label: 'Low', count: priorityBreakdown.low, color: '#10b981' }].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{count} tasks</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-sm uppercase tracking-wide mb-4" style={{ color: 'var(--text-secondary)' }}>Tasks by Category</h3>
          <div style={{ height: 220 }}>
            <Bar data={categoryData} options={commonOptions} />
          </div>
        </div>
      </div>

      {/* Weekly Summary Table */}
      <div className="card p-5">
        <h3 className="font-bold mb-4" style={{ fontFamily: 'Clash Display', color: 'var(--text-primary)' }}>Weekly Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid var(--border)` }}>
                {['Day', 'Total Tasks', 'Completed', 'Pending', 'Score'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {last7Days.map((d, i) => (
                <tr key={d.dateStr} style={{ borderBottom: i < 6 ? `1px solid var(--border)` : 'none' }}>
                  <td className="py-3 px-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{d.date}</td>
                  <td className="py-3 px-3" style={{ color: 'var(--text-secondary)' }}>{d.total}</td>
                  <td className="py-3 px-3"><span className="badge badge-completed">{d.completed}</span></td>
                  <td className="py-3 px-3"><span className="badge badge-pending">{d.total - d.completed}</span></td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)', minWidth: 60 }}>
                        <div className="h-full rounded-full" style={{ width: `${d.score}%`, background: d.score >= 70 ? '#10b981' : d.score >= 40 ? '#f59e0b' : '#f43f5e' }} />
                      </div>
                      <span className="text-xs font-bold" style={{ color: d.score >= 70 ? '#10b981' : d.score >= 40 ? '#f59e0b' : '#f43f5e' }}>{d.score}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
