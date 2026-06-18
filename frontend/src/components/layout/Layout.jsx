import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, ListTodo, LogOut, Menu, X, User, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme, themes } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
];

function ThemeSwitcher() {
  const { themeKey, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="theme-pill"
        style={{ background: 'var(--accent-bg)', border: '1px solid var(--card-border)' }}
        title="Change theme"
      >
        {themes[themeKey]?.icon || '🎨'}
      </button>
      {open && (
        <div className="absolute bottom-10 left-0 p-3 rounded-2xl shadow-2xl z-50 animate-fade-in"
          style={{ background: 'var(--card)', border: '1px solid var(--card-border)', width: 200 }}>
          <p className="text-xs font-semibold mb-2 px-1" style={{ color: 'var(--text-muted)' }}>THEME</p>
          <div className="space-y-1">
            {Object.values(themes).map(t => (
              <button key={t.key}
                onClick={() => { setTheme(t.key); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left"
                style={{
                  background: themeKey === t.key ? 'var(--accent-bg)' : 'transparent',
                  color: themeKey === t.key ? 'var(--accent)' : 'var(--text-muted)',
                }}>
                <span>{t.icon}</span>
                <span>{t.name}</span>
                {themeKey === t.key && <span className="ml-auto text-xs">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const Sidebar = ({ mobile }) => (
    <aside className="flex flex-col h-full" style={{
      background: 'var(--sidebar)',
      borderRight: '1px solid var(--card-border)',
      width: mobile ? '100%' : 256
    }}>
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--card-border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--accent)', boxShadow: '0 4px 14px var(--accent-bg)' }}>
            <Zap size={16} color="white" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--text)' }}>ProjectFlow</span>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Pro Workspace</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-xs font-semibold px-3 mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>NAVIGATION</p>
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = location.pathname.startsWith(to);
          return (
            <Link key={to} to={to}
              onClick={() => setSidebarOpen(false)}
              className={`nav-item ${active ? 'nav-active' : ''}`}>
              <Icon size={16} />
              {label}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid var(--card-border)' }}>
        {/* Theme */}
        <div className="flex items-center gap-2 px-3 py-2 mb-1">
          <span className="text-xs font-medium flex-1" style={{ color: 'var(--text-muted)' }}>Theme</span>
          <ThemeSwitcher />
        </div>

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-1"
          style={{ background: 'var(--accent-bg)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: 'var(--accent)' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>{user?.fullName}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          </div>
        </div>

        <button onClick={handleLogout}
          className="nav-item w-full" style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 z-50 animate-slide-in">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3"
          style={{ background: 'var(--sidebar)', borderBottom: '1px solid var(--card-border)' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ color: 'var(--text-muted)' }}>
            <Menu size={20} />
          </button>
          <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>ProjectFlow</span>
          <div className="w-5" />
        </div>

        <main className="flex-1 overflow-y-auto p-6" style={{ background: 'var(--bg)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
