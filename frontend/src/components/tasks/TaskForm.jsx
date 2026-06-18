import { useState, useEffect } from 'react';
import { Modal, Spinner } from '../ui';

const empty = { name: '', description: '', priority: 'Medium', status: 'Pending', dueDate: '' };

export default function TaskForm({ isOpen, onClose, onSubmit, initial, loading, hideProject }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) setForm({
      name: initial.name || '',
      description: initial.description || '',
      priority: initial.priority || 'Medium',
      status: initial.status || 'Pending',
      dueDate: initial.dueDate ? initial.dueDate.slice(0, 10) : '',
    });
    else setForm(empty);
    setErrors({});
  }, [initial, isOpen]);

  const set = (f) => (e) => {
    setForm(p => ({ ...p, [f]: e.target.value }));
    setErrors(p => ({ ...p, [f]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Task name is required';
    if (Object.keys(errs).length) return setErrors(errs);
    const payload = { ...form };
    if (!payload.dueDate) delete payload.dueDate;
    onSubmit(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Edit Task' : 'New Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="t-label">Task Name <span style={{ color: '#f87171' }}>*</span></label>
          <input className="t-input" style={errors.name ? { borderColor: '#f87171' } : {}}
            placeholder="e.g. Design wireframes" value={form.name} onChange={set('name')} />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="t-label">Description</label>
          <textarea className="t-input resize-none" rows={3}
            placeholder="Optional description…" value={form.description} onChange={set('description')} />
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

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="t-btn-secondary flex-1 justify-center">Cancel</button>
          <button type="submit" disabled={loading} className="t-btn-primary flex-1 justify-center">
            {loading && <Spinner size="sm" />}
            {initial ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
