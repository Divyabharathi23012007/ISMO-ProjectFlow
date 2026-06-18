import { useState, useEffect, useCallback } from 'react';
import { Plus, ListTodo, Pencil, Trash2, CheckCircle2, Circle, Calendar } from 'lucide-react';
import { taskAPI, projectAPI } from '../../api/services';
import { StatusBadge, PriorityBadge, LoadingPage, EmptyState, ConfirmDialog, SearchInput, Select, Spinner } from '../ui';
import TaskForm from './TaskForm';
import toast from 'react-hot-toast';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    projectAPI.getAll({ limit: 100 }).then(({ data }) => setProjects(data.data.projects)).catch(() => {});
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (projectFilter) params.projectId = projectFilter;
      const { data } = await taskAPI.getAll(params);
      setTasks(data.data.tasks);
      setPagination(data.data.pagination);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  }, [search, statusFilter, priorityFilter, projectFilter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleCreate = async (payload) => {
    setSaving(true);
    try { await taskAPI.create(payload); toast.success('Task created!'); setFormOpen(false); fetchTasks(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (payload) => {
    setSaving(true);
    try { await taskAPI.update(editTask.id, payload); toast.success('Task updated!'); setEditTask(null); fetchTasks(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await taskAPI.delete(deleteTarget.id); toast.success('Task deleted'); setDeleteTarget(null); fetchTasks(); }
    catch { toast.error('Failed'); }
    finally { setDeleting(false); }
  };

  const toggleComplete = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try { await taskAPI.update(task.id, { status: newStatus }); fetchTasks(); }
    catch { toast.error('Failed'); }
  };

  const hasFilters = search || statusFilter || priorityFilter || projectFilter;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Tasks</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {pagination.total ?? 0} total task{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setFormOpen(true)} className="t-btn-primary">
          <Plus size={15} /> New Task
        </button>
      </div>

      <div className="flex flex-wrap gap-2 animate-fade-in">
        <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…" />
        <Select style={{ width: 148 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option>Pending</option><option>In Progress</option><option>Completed</option>
        </Select>
        <Select style={{ width: 140 }} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="">All Priorities</option>
          <option>Low</option><option>Medium</option><option>High</option>
        </Select>
        <Select style={{ width: 160 }} value={projectFilter} onChange={e => setProjectFilter(e.target.value)}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
        {hasFilters && (
          <button onClick={() => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); setProjectFilter(''); }}
            className="t-btn-secondary text-xs px-3">Clear</button>
        )}
      </div>

      {loading ? <LoadingPage /> : tasks.length === 0 ? (
        <EmptyState icon={ListTodo} title="No tasks found"
          description={hasFilters ? 'Try adjusting your filters' : 'Create a task to start tracking work'}
          action={!hasFilters && (
            <button onClick={() => setFormOpen(true)} className="t-btn-primary"><Plus size={14} /> New Task</button>
          )} />
      ) : (
        <div className="space-y-2">
          {tasks.map((task, i) => (
            <div key={task.id}
              className={`t-card group flex items-start gap-3 animate-fade-in ${task.status === 'Completed' ? 'opacity-50' : ''}`}
              style={{ padding: '0.875rem 1.25rem', animationDelay: `${i * 0.03}s` }}>
              <button onClick={() => toggleComplete(task)} className="mt-0.5 shrink-0">
                {task.status === 'Completed'
                  ? <CheckCircle2 size={18} style={{ color: '#22c55e' }} />
                  : <Circle size={18} style={{ color: 'var(--text-muted)' }} />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-medium text-sm ${task.status === 'Completed' ? 'line-through' : ''}`}
                    style={{ color: 'var(--text)' }}>{task.name}</span>
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                </div>
                {task.description && (
                  <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{task.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {task.project && <span className="flex items-center gap-1"><span style={{ color: 'var(--accent)' }}>◆</span> {task.project.name}</span>}
                  {task.dueDate && <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => setEditTask(task)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--input-bg)'; e.currentTarget.style.color = 'var(--text)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                  <Pencil size={12} />
                </button>
                <button onClick={() => setDeleteTarget(task)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#f87171'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskCreateModal isOpen={formOpen} onClose={() => setFormOpen(false)}
        onSubmit={handleCreate} projects={projects} loading={saving} />
      <TaskForm isOpen={!!editTask} onClose={() => setEditTask(null)}
        onSubmit={handleUpdate} initial={editTask} loading={saving} />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} loading={deleting} title="Delete Task"
        message={`Delete "${deleteTarget?.name}"?`} />
    </div>
  );
}

function TaskCreateModal({ isOpen, onClose, onSubmit, projects, loading }) {
  const [form, setForm] = useState({ name: '', description: '', priority: 'Medium', status: 'Pending', dueDate: '', projectId: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) { setForm({ name: '', description: '', priority: 'Medium', status: 'Pending', dueDate: '', projectId: '' }); setErrors({}); }
  }, [isOpen]);

  const set = (f) => (e) => { setForm(p => ({ ...p, [f]: e.target.value })); setErrors(p => ({ ...p, [f]: '' })); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Task name is required';
    if (!form.projectId) errs.projectId = 'Project is required';
    if (Object.keys(errs).length) return setErrors(errs);
    const payload = { ...form };
    if (!payload.dueDate) delete payload.dueDate;
    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose} />
      <div className="relative w-full max-w-lg shadow-2xl rounded-2xl animate-fade-in"
        style={{ background: 'var(--card)', border: '1px solid var(--card-border)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
          <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>New Task</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
            style={{ color: 'var(--text-muted)' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="t-label">Task Name <span style={{ color: '#f87171' }}>*</span></label>
            <input className="t-input" style={errors.name ? { borderColor: '#f87171' } : {}}
              placeholder="e.g. Design wireframes" value={form.name} onChange={set('name')} />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="t-label">Project <span style={{ color: '#f87171' }}>*</span></label>
            <select className="t-input" style={errors.projectId ? { borderColor: '#f87171' } : {}}
              value={form.projectId} onChange={set('projectId')}>
              <option value="">Select a project…</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {errors.projectId && <p className="text-red-400 text-xs mt-1">{errors.projectId}</p>}
          </div>
          <div>
            <label className="t-label">Description</label>
            <textarea className="t-input resize-none" rows={2} placeholder="Optional…" value={form.description} onChange={set('description')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="t-label">Priority</label>
              <select className="t-input" value={form.priority} onChange={set('priority')}>
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
            <div>
              <label className="t-label">Status</label>
              <select className="t-input" value={form.status} onChange={set('status')}>
                <option>Pending</option><option>In Progress</option><option>Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="t-label">Due Date</label>
            <input type="date" className="t-input" value={form.dueDate} onChange={set('dueDate')} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="t-btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="t-btn-primary flex-1 justify-center">
              {loading && <Spinner size="sm" />} Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
