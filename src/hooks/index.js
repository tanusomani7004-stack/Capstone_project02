import { useState, useEffect, useCallback, useRef } from 'react';

// Debounced search hook
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// Local storage hook
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key]);

  return [storedValue, setValue];
}

// Intersection observer for lazy loading
export function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isIntersecting];
}

// Previous value hook (for comparison)
export function usePrevious(value) {
  const ref = useRef(undefined);
  useEffect(() => { ref.current = value; });
  return ref.current;
}

// AI Insights generator
export function useAIInsights(tasks, productivityScore) {
  return useCallback(() => {
    const insights = [];
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const todayTasks = tasks.filter(t => t.dueDate === today);
    const tomorrowTasks = tasks.filter(t => t.dueDate === tomorrow);
    const overdueTasks = tasks.filter(t => t.dueDate < today && t.status === 'pending');
    const highPriority = tasks.filter(t => t.priority === 'high' && t.status === 'pending');
    const completedToday = todayTasks.filter(t => t.status === 'completed');

    if (overdueTasks.length > 0) {
      insights.push({ id: 1, type: 'warning', icon: '⚠️', message: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Address them soon to stay on track.`, color: 'rose' });
    }

    if (tomorrowTasks.length >= 4) {
      insights.push({ id: 2, type: 'info', icon: '📅', message: `You have ${tomorrowTasks.length} tasks due tomorrow. Consider starting early today.`, color: 'amber' });
    }

    if (highPriority.length > 0) {
      insights.push({ id: 3, type: 'tip', icon: '🎯', message: `Focus on high-priority tasks first. You have ${highPriority.length} critical item${highPriority.length > 1 ? 's' : ''} pending.`, color: 'violet' });
    }

    if (productivityScore >= 80) {
      insights.push({ id: 4, type: 'success', icon: '🔥', message: `Outstanding! You're ${productivityScore}% productive today. Keep this momentum going!`, color: 'emerald' });
    } else if (productivityScore >= 50) {
      insights.push({ id: 5, type: 'info', icon: '📈', message: `Good progress! You've completed ${completedToday.length} tasks today. You're halfway there.`, color: 'blue' });
    } else if (productivityScore === 0 && todayTasks.length > 0) {
      insights.push({ id: 6, type: 'tip', icon: '💪', message: `Start your day strong! You have ${todayTasks.length} tasks to complete today.`, color: 'amber' });
    }

    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) {
      insights.push({ id: 7, type: 'wellness', icon: '😴', message: 'It\'s late! Make sure to get enough sleep. Rest is key to academic performance.', color: 'violet' });
    } else if (hour >= 14 && hour <= 16) {
      insights.push({ id: 8, type: 'wellness', icon: '☕', message: 'Afternoon slump? Take a short break, stretch, or grab some water to boost focus.', color: 'amber' });
    }

    if (insights.length === 0) {
      insights.push({ id: 9, type: 'info', icon: '✨', message: 'All caught up! Add tasks to track your daily productivity.', color: 'blue' });
    }

    return insights.slice(0, 4);
  }, [tasks, productivityScore]);
}
