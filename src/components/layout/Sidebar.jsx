import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard, CheckSquare, FileText, Calendar,
  BarChart3, Lightbulb, LogOut, Moon, Sun, Zap
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/notes', icon: FileText, label: 'Notes' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/insights', icon: Lightbulb, label: 'AI Insights' },
];

export default function Sidebar() {
  const { user, darkMode, toggleDark, logout, productivityScore } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{ width: 'var(--sidebar-width)', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}
      className="fixed left-0 top-0 h-screen flex flex-col z-50 shrink-0">

      {/* Logo */}
      <div className="p-5 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight" style={{ fontFamily: 'Clash Display', color: 'var(--text-primary)' }}>StudyOS</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>AI Dashboard</p>
          </div>
        </div>
      </div>

      {/* Score Badge */}
      <div className="mx-4 mt-4 p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Today's Score</span>
          <span className="text-xs font-bold" style={{ color: productivityScore >= 70 ? '#10b981' : productivityScore >= 40 ? '#f59e0b' : '#f43f5e' }}>
            {productivityScore}%
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${productivityScore}%`,
              background: productivityScore >= 70 ? 'linear-gradient(90deg, #10b981, #34d399)'
                : productivityScore >= 40 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                : 'linear-gradient(90deg, #f43f5e, #fb7185)'
            }} />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
        <button onClick={toggleDark} className="sidebar-item w-full">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {user && (
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Logout">
              <LogOut size={15} style={{ color: '#f43f5e' }} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
