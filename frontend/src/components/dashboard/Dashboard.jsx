import { useEffect, useState } from 'react';
import { FolderKanban, CheckCircle2, Clock, Play, ListTodo, AlertCircle, TrendingUp, Activity } from 'lucide-react';
import { dashboardAPI } from '../../api/services';
import { StatCard, LoadingPage, ProgressBar } from '../ui';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.get()
      .then(({ data }) => setStats(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage />;

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.fullName?.split(' ')[0];
  const projectCompletion = stats?.projects.total
    ? Math.round((stats.projects.completed / stats.projects.total) * 100) : 0;
  const taskCompletion = stats?.tasks.total
    ? Math.round((stats.tasks.completed / stats.tasks.total) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
          {greet()}, {firstName}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Here's an overview of your workspace activity.
        </p>
      </div>

      {/* Quick overview bar */}
      {stats && (
        <div className="t-card-plain animate-fade-in" style={{ padding: '1rem 1.25rem' }}>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Activity size={14} style={{ color: 'var(--accent)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Workspace Health</span>
            </div>
            <div className="flex-1 min-w-32">
              <div className="flex items-center gap-3">
                <div className="t-progress flex-1" style={{ height: 4 }}>
                  <div className="t-progress-bar" style={{ width: `${Math.max(projectCompletion, taskCompletion)}%` }} />
                </div>
                <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>
                  {Math.max(projectCompletion, taskCompletion)}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1"><span style={{ color: '#22c55e' }}>●</span> {stats.projects.completed} done</span>
              <span className="flex items-center gap-1"><span style={{ color: 'var(--accent)' }}>●</span> {stats.projects.inProgress} active</span>
            </div>
          </div>
        </div>
      )}

      {/* Project Stats */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <FolderKanban size={14} style={{ color: 'var(--accent)' }} />
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Projects</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total" value={stats?.projects.total ?? 0} icon={FolderKanban} />
          <StatCard label="In Progress" value={stats?.projects.inProgress ?? 0} icon={Play} />
          <StatCard label="Completed" value={stats?.projects.completed ?? 0} icon={CheckCircle2} />
          <StatCard label="Not Started" value={stats?.projects.notStarted ?? 0} icon={Clock} />
        </div>
      </section>

      {/* Task Stats */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <ListTodo size={14} style={{ color: 'var(--accent)' }} />
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Tasks</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total" value={stats?.tasks.total ?? 0} icon={ListTodo} />
          <StatCard label="In Progress" value={stats?.tasks.inProgress ?? 0} icon={Play} />
          <StatCard label="Completed" value={stats?.tasks.completed ?? 0} icon={CheckCircle2} />
          <StatCard label="Pending" value={stats?.tasks.pending ?? 0} icon={AlertCircle} />
        </div>
      </section>

      {/* Progress Overview */}
      {stats && (stats.projects.total > 0 || stats.tasks.total > 0) && (
        <section className="t-card-plain animate-fade-in">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={14} style={{ color: 'var(--accent)' }} />
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Progress</h2>
          </div>
          <div className="space-y-5">
            {stats.projects.total > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>Project Completion</span>
                  <span className="font-bold text-sm" style={{ color: 'var(--accent)' }}>{projectCompletion}%</span>
                </div>
                <ProgressBar value={stats.projects.completed} max={stats.projects.total} showLabel />
              </div>
            )}
            {stats.tasks.total > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>Task Completion</span>
                  <span className="font-bold text-sm" style={{ color: 'var(--accent)' }}>{taskCompletion}%</span>
                </div>
                <ProgressBar value={stats.tasks.completed} max={stats.tasks.total} showLabel />
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
