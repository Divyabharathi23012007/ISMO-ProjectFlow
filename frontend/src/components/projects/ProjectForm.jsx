import { useState, useEffect } from 'react';
import { Modal } from '../ui';
import { Spinner } from '../ui';

export default function ProjectForm({ isOpen, onClose, onSubmit, initial, loading }) {
  const [form, setForm] = useState({ name: '', description: '', status: 'Not Started', startDate: '', endDate: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        description: initial.description || '',
        status: initial.status || 'Not Started',
        startDate: initial.startDate ? initial.startDate.slice(0, 10) : '',
        endDate: initial.endDate ? initial.endDate.slice(0, 10) : '',
      });
    } else {
      setForm({ name: '', description: '', status: 'Not Started', startDate: '', endDate: '' });
    }
    setErrors({});
  }, [initial, isOpen]);

  const set = (f) => (e) => {
    setForm(p => ({ ...p, [f]: e.target.value }));
    setErrors(p => ({ ...p, [f]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Project name is required';
    if (Object.keys(errs).length) return setErrors(errs);
    const payload = { ...form };
    if (!payload.startDate) delete payload.startDate;
    if (!payload.endDate) delete payload.endDate;
    onSubmit(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Edit Project' : 'New Project'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="t-label">Project Name <span style={{ color: '#f87171' }}>*</span></label>
          <input className="t-input" style={errors.name ? { borderColor: '#f87171' } : {}}
            placeholder="e.g. Website Redesign" value={form.name} onChange={set('name')} />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="t-label">Description</label>
          <textarea className="t-input resize-none" rows={3}
            placeholder="What is this project about?" value={form.description} onChange={set('description')} />
        </div>
        <div>
          <label className="t-label">Status</label>
          <select className="t-input" value={form.status} onChange={set('status')}>
            <option>Not Started</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="t-label">Start Date</label>
            <input type="date" className="t-input" value={form.startDate} onChange={set('startDate')} />
          </div>
          <div>
            <label className="t-label">End Date</label>
            <input type="date" className="t-input" value={form.endDate} onChange={set('endDate')} />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="t-btn-secondary flex-1 justify-center">Cancel</button>
          <button type="submit" disabled={loading} className="t-btn-primary flex-1 justify-center">
            {loading && <Spinner size="sm" />}
            {initial ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
