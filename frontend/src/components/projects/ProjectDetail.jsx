import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, Calendar, CheckCircle2, ListTodo, Circle } from 'lucide-react';
import { projectAPI, taskAPI } from '../../api/services';
import { StatusBadge, PriorityBadge, LoadingPage, EmptyState, ConfirmDialog, ProgressBar } from '../ui';
import ProjectForm from './ProjectForm';
import TaskForm from '../tasks/TaskForm';
import toast from 'react-hot-toast';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState('All');

  const fetchProject = () => {
    setLoading(true);
    projectAPI.getById(id)
      .then(({ data }) => setProject(data.data.project))
      .catch(() => { toast.error('Project not found'); navigate('/projects'); })
      .finally(() => setLoading(false));
  };

  useEffect(fetchProject, [id]);

  const handleUpdateProject = async (payload) => {
    setSaving(true);
    try { await projectAPI.update(id, payload); toast.success('Project updated!'); setEditOpen(false); fetchProject(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleCreateTask = async (payload) => {
    setSaving(true);
    try { await taskAPI.create({ ...payload, projectId: parseInt(id) }); toast.success('Task created!'); setTaskFormOpen(false); fetchProject(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleUpdateTask = async (payload) => {
    setSaving(true);
    try { await taskAPI.update(editTask.id, payload); toast.success('Task updated!'); setEditTask(null); fetchProject(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDeleteTask = async () => {
    setDeleting(true);
    try { await taskAPI.delete(deleteTarget.id); toast.success('Task deleted'); setDeleteTarget(null); fetchProject(); }
    catch { toast.error('Failed'); }
    finally { setDeleting(false); }
  };

  const toggleComplete = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try { await taskAPI.update(task.id, { status: newStatus }); fetchProject(); }
    catch { toast.error('Failed to update task'); }
  };

  if (loading) return <LoadingPage />;
  if (!project) return null;

  const allTasks = project.tasks || [];
  const doneTasks = allTasks.filter(t => t.status === 'Completed').length;
  const filterOptions = ['All', 'Pending', 'In Progress', 'Completed'];
  const tasks = filter === 'All' ? allTasks : allTasks.filter(t => t.status === filter);

  const priorityOrder = { High: 0, Medium: 1, Low: 2 };
  const sortedTasks = [...tasks].sort((a, b) =>
    (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <button onClick={() => navigate('/projects')}
        className="flex items-center gap-2 text-sm transition-colors animate-fade-in"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
        <ArrowLeft size={15} /> Back to Projects
      </button>

      {/* Project Header */}
      <div className="t-card-plain animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            {project.description && (
              <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{project.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: 'var(--text-muted)' }}>
              {(project.startDate || project.endDate) && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  {project.startDate && new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {project.startDate && project.endDate && ' – '}
                  {project.endDate && new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
              <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
            {allTasks.length > 0 && (
              <div className="mt-4 max-w-sm">
                <ProgressBar value={doneTasks} max={allTasks.length} showLabel />
              </div>
            )}
          </div>
          <button onClick={() => setEditOpen(true)} className="t-btn-secondary shrink-0">
            <Pencil size={13} /> Edit
          </button>
        </div>
      </div>

      {/* Tasks */}
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
              Tasks
              <span className="ml-2 text-sm font-normal" style={{ color: 'var(--text-muted)' }}>({allTasks.length})</span>
            </h2>
            {/* Filter tabs */}
            <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--input-bg)' }}>
              {filterOptions.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                  style={{
                    background: filter === f ? 'var(--accent)' : 'transparent',
                    color: filter === f ? 'white' : 'var(--text-muted)',
                  }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setTaskFormOpen(true)} className="t-btn-primary" style={{ fontSize: 13 }}>
            <Plus size={13} /> Add Task
          </button>
        </div>

        {sortedTasks.length === 0 ? (
          <EmptyState icon={ListTodo} title={filter === 'All' ? 'No tasks yet' : `No ${filter} tasks`}
            description={filter === 'All' ? 'Add tasks to track work within this project' : 'Try a different filter'}
            action={filter === 'All' && (
              <button onClick={() => setTaskFormOpen(true)} className="t-btn-primary"><Plus size={14} /> Add Task</button>
            )} />
        ) : (
          <div className="space-y-2">
            {sortedTasks.map((task, i) => (
              <div key={task.id}
                className={`t-card group flex items-start gap-3 animate-fade-in ${task.status === 'Completed' ? 'opacity-50' : ''}`}
                style={{ padding: '0.875rem 1.25rem', animationDelay: `${i * 0.04}s` }}>
                <button onClick={() => toggleComplete(task)} className="mt-0.5 shrink-0">
                  {task.status === 'Completed'
                    ? <CheckCircle2 size={18} style={{ color: '#22c55e' }} />
                    : <Circle size={18} style={{ color: 'var(--text-muted)' }} />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-medium text-sm ${task.status === 'Completed' ? 'line-through' : ''}`}
                      style={{ color: 'var(--text)' }}>
                      {task.name}
                    </span>
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                  </div>
                  {task.description && (
                    <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{task.description}</p>
                  )}
                  {task.dueDate && (
                    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <Calendar size={10} /> Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
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
      </div>

      <ProjectForm isOpen={editOpen} onClose={() => setEditOpen(false)}
        onSubmit={handleUpdateProject} initial={project} loading={saving} />
      <TaskForm isOpen={taskFormOpen || !!editTask}
        onClose={() => { setTaskFormOpen(false); setEditTask(null); }}
        onSubmit={editTask ? handleUpdateTask : handleCreateTask}
        initial={editTask} loading={saving} hideProject />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteTask} loading={deleting} title="Delete Task"
        message={`Delete "${deleteTarget?.name}"?`} />
    </div>
  );
}
