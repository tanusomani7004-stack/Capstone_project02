import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, getDay, addMonths, subMonths } from 'date-fns';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PRIORITY_COLORS = {
  high: '#f43f5e',
  medium: '#f59e0b',
  low: '#10b981',
};

export default function CalendarPage() {
  const { tasks, setSelectedDate, selectedDate } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach(task => {
      if (!map[task.dueDate]) map[task.dueDate] = [];
      map[task.dueDate].push(task);
    });
    return map;
  }, [tasks]);

  const selectedDateStr = selectedDate || format(new Date(), 'yyyy-MM-dd');
  const selectedTasks = tasksByDate[selectedDateStr] || [];

  const handleDayClick = (day) => {
    setSelectedDate(format(day, 'yyyy-MM-dd'));
  };

  const completedSelected = selectedTasks.filter(t => t.status === 'completed').length;
  const pendingSelected = selectedTasks.filter(t => t.status === 'pending').length;

  return (
    <div className="page-enter space-y-5">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Clash Display', color: 'var(--text-primary)' }}>Calendar</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>View and manage your schedule</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar */}
        <div className="card p-5 lg:col-span-2">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => setCurrentMonth(m => subMonths(m, 1))}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ChevronLeft size={20} style={{ color: 'var(--text-secondary)' }} />
            </button>
            <h2 className="text-xl font-bold" style={{ fontFamily: 'Clash Display', color: 'var(--text-primary)' }}>
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button onClick={() => setCurrentMonth(m => addMonths(m, 1))}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ChevronRight size={20} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-xs font-bold py-2" style={{ color: 'var(--text-muted)' }}>{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startPadding }).map((_, i) => <div key={`pad-${i}`} />)}
            {daysInMonth.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayTasks = tasksByDate[dateStr] || [];
              const isSelected = selectedDateStr === dateStr;
              const today = isToday(day);

              return (
                <button key={dateStr} onClick={() => handleDayClick(day)}
                  className={`cal-day flex-col gap-0.5 p-1 ${today ? 'today' : ''} ${isSelected && !today ? 'selected' : ''} ${dayTasks.length > 0 ? 'has-tasks' : ''}`}>
                  <span className="text-sm">{format(day, 'd')}</span>
                  {dayTasks.length > 0 && !today && (
                    <div className="flex gap-0.5 justify-center flex-wrap">
                      {dayTasks.slice(0, 3).map(t => (
                        <div key={t.id} style={{ width: 4, height: 4, borderRadius: '50%', background: PRIORITY_COLORS[t.priority] }} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            {Object.entries(PRIORITY_COLORS).map(([p, c]) => (
              <div key={p} className="flex items-center gap-1.5">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Day Tasks */}
        <div className="card p-5">
          <h3 className="font-bold mb-1" style={{ fontFamily: 'Clash Display', color: 'var(--text-primary)' }}>
            {selectedDateStr === format(new Date(), 'yyyy-MM-dd') ? 'Today' : format(new Date(selectedDateStr + 'T00:00:00'), 'EEE, MMM d')}
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            {completedSelected} done · {pendingSelected} pending
          </p>

          {selectedTasks.length === 0 ? (
            <div className="empty-state py-8">
              <span className="text-4xl">🗓️</span>
              <p className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>No tasks this day</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {selectedTasks.map(task => (
                <div key={task.id} className="p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className="flex items-start gap-2">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: PRIORITY_COLORS[task.priority], marginTop: 4, flexShrink: 0 }} />
                    <div>
                      <p className={`text-sm font-medium leading-snug ${task.status === 'completed' ? 'line-through' : ''}`}
                        style={{ color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                        {task.title}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <span className={`badge text-xs ${task.status === 'completed' ? 'badge-completed' : 'badge-pending'}`}>
                          {task.status}
                        </span>
                        <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{task.priority}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Month Summary */}
      <div className="card p-5">
        <h3 className="font-bold mb-4" style={{ fontFamily: 'Clash Display', color: 'var(--text-primary)' }}>
          {format(currentMonth, 'MMMM')} Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(() => {
            const monthTasks = tasks.filter(t => t.dueDate.startsWith(format(currentMonth, 'yyyy-MM')));
            const done = monthTasks.filter(t => t.status === 'completed');
            const highP = monthTasks.filter(t => t.priority === 'high');
            const daysWithTasks = new Set(monthTasks.map(t => t.dueDate)).size;
            return [
              { label: 'Total Tasks', value: monthTasks.length, color: '#0ea5e9' },
              { label: 'Completed', value: done.length, color: '#10b981' },
              { label: 'High Priority', value: highP.length, color: '#f43f5e' },
              { label: 'Active Days', value: daysWithTasks, color: '#8b5cf6' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                <p className="text-3xl font-bold" style={{ fontFamily: 'Clash Display', color }}>{value}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
}
