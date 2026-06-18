import { Loader2, X } from 'lucide-react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return <Loader2 className={`animate-spin ${sizes[size]} ${className}`} style={{ color: 'var(--accent)' }} />;
};

export const LoadingPage = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-3">
      <Spinner size="lg" />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</p>
    </div>
  </div>
);

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    yellow: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    red: 'bg-red-500/10 text-red-400 border border-red-500/20',
    slate: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  };
  return (
    <span className={`t-badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const map = { 'Not Started': 'slate', 'In Progress': 'blue', 'Completed': 'green', 'Pending': 'yellow' };
  const dots = { 'Not Started': '⬜', 'In Progress': '🔵', 'Completed': '✅', 'Pending': '🟡' };
  return <Badge variant={map[status] || 'default'}>{status}</Badge>;
};

export const PriorityBadge = ({ priority }) => {
  const map = { Low: 'slate', Medium: 'orange', High: 'red' };
  const icons = { Low: '▽', Medium: '▲', High: '▲▲' };
  return <Badge variant={map[priority] || 'default'}>{icons[priority]} {priority}</Badge>;
};

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const maxW = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose} />
      <div className={`relative w-full ${maxW[size]} shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto animate-fade-in`}
        style={{ background: 'var(--card)', border: '1px solid var(--card-border)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
          <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--input-bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, loading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>
    <div className="flex gap-3 justify-end">
      <button onClick={onClose} className="t-btn-secondary">Cancel</button>
      <button onClick={onConfirm} disabled={loading} className="t-btn-danger flex items-center gap-2">
        {loading && <Spinner size="sm" />} Delete
      </button>
    </div>
  </Modal>
);

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    {Icon && (
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'var(--accent-bg)', border: '1px solid var(--card-border)' }}>
        <Icon size={28} style={{ color: 'var(--accent)' }} />
      </div>
    )}
    <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text)' }}>{title}</h3>
    <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--text-muted)' }}>{description}</p>
    {action}
  </div>
);

export const StatCard = ({ label, value, icon: Icon, color = 'accent', trend, sub }) => (
  <div className="t-card stat-glow animate-fade-in">
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: 'var(--accent-bg)' }}>
        <Icon size={18} style={{ color: 'var(--accent)' }} />
      </div>
      {trend !== undefined && (
        <span className="text-xs font-medium" style={{ color: trend >= 0 ? '#22c55e' : '#f87171' }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>{value}</p>
    <p className="text-xs font-medium mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
    {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
  </div>
);

export const Select = ({ className = '', children, ...props }) => (
  <select className={`t-input ${className}`} {...props}>{children}</select>
);

export const SearchInput = ({ value, onChange, placeholder = 'Search...' }) => (
  <div className="relative">
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
      style={{ color: 'var(--text-muted)' }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input type="text" value={value} onChange={onChange} placeholder={placeholder}
      className="t-input pl-9" style={{ width: 220 }} />
  </div>
);

export const ProgressBar = ({ value, max, showLabel = false }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      {showLabel && (
        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
          <span>{value}/{max} completed</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className="t-progress">
        <div className="t-progress-bar" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};
