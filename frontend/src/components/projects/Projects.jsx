import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderKanban, Pencil, Trash2, Eye, Calendar, ArrowRight } from 'lucide-react';
import { projectAPI } from '../../api/services';
import { StatusBadge, LoadingPage, EmptyState, ConfirmDialog, SearchInput, Select, ProgressBar } from '../ui';
import ProjectForm from './ProjectForm';
import toast from 'react-hot-toast';

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await projectAPI.getAll(params);
      setProjects(data.data.projects);
      setPagination(data.data.pagination);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleCreate = async (payload) => {
    setSaving(true);
    try {
      await projectAPI.create(payload);
      toast.success('Project created!');
      setFormOpen(false);
      fetchProjects();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (payload) => {
    setSaving(true);
    try {
      await projectAPI.update(editProject.id, payload);
      toast.success('Project updated!');
      setEditProject(null);
      fetchProjects();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await projectAPI.delete(deleteTarget.id);
      toast.success('Project deleted');
      setDeleteTarget(null);
      fetchProjects();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const statusColors = {
    'Not Started': { dot: '#64748b', bg: 'rgba(100,116,139,0.08)' },
    'In Progress': { dot: 'var(--accent)', bg: 'var(--accent-bg)' },
    'Completed': { dot: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Projects</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {pagination.total ?? 0} total project{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setFormOpen(true)} className="t-btn-primary">
          <Plus size={15} /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 animate-fade-in">
        <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects…" />
        <Select style={{ width: 168 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option>Not Started</option>
          <option>In Progress</option>
          <option>Completed</option>
        </Select>
      </div>

      {/* List */}
      {loading ? <LoadingPage /> : projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects found"
          description={search || statusFilter ? 'Try adjusting your filters' : 'Create your first project to get started'}
          action={!search && !statusFilter && (
            <button onClick={() => setFormOpen(true)} className="t-btn-primary">
              <Plus size={15} /> New Project
            </button>
          )} />
      ) : (
        <div className="grid gap-3">
          {projects.map((p, i) => {
            const tasksCount = p.tasks?.length ?? 0;
            const done = p.tasks?.filter(t => t.status === 'Completed').length ?? 0;
            const sc = statusColors[p.status] || statusColors['Not Started'];
            return (
              <div key={p.id}
                className="t-card group cursor-pointer animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s`, padding: '1.25rem 1.5rem' }}
                onClick={() => navigate(`/projects/${p.id}`)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Status dot + name */}
                    <div className="flex items-center gap-2.5 mb-1">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: sc.dot }} />
                      <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{p.name}</h3>
                      <StatusBadge status={p.status} />
                    </div>

                    {p.description && (
                      <p className="text-xs line-clamp-1 mb-3 ml-4.5" style={{ color: 'var(--text-muted)', marginLeft: '1.5rem' }}>
                        {p.description}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs ml-0" style={{ color: 'var(--text-muted)' }}>
                      {(p.startDate || p.endDate) && (
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {p.startDate && new Date(p.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {p.startDate && p.endDate && ' – '}
                          {p.endDate && new Date(p.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                      <span>{tasksCount} task{tasksCount !== 1 ? 's' : ''}</span>
                      <span style={{ color: '#22c55e' }}>{done} completed</span>
                    </div>

                    {/* Progress */}
                    {tasksCount > 0 && (
                      <div className="mt-3 max-w-xs">
                        <ProgressBar value={done} max={tasksCount} />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={e => e.stopPropagation()}>
                    <button onClick={() => navigate(`/projects/${p.id}`)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--input-bg)'; e.currentTarget.style.color = 'var(--text)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                      <Eye size={14} />
                    </button>
                    <button onClick={() => setEditProject(p)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--input-bg)'; e.currentTarget.style.color = 'var(--text)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteTarget(p)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#f87171'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ProjectForm isOpen={formOpen || !!editProject}
        onClose={() => { setFormOpen(false); setEditProject(null); }}
        onSubmit={editProject ? handleUpdate : handleCreate}
        initial={editProject} loading={saving} />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} loading={deleting} title="Delete Project"
        message={`Delete "${deleteTarget?.name}"? All tasks inside will also be deleted.`} />
    </div>
  );
}
