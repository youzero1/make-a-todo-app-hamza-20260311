"use client";

import { useState, FormEvent } from 'react';

interface TodoFormProps {
  onAdd: (title: string, description: string) => Promise<void>;
}

export default function TodoForm({ onAdd }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    setLoading(true);
    try {
      await onAdd(title.trim(), description.trim());
      setTitle('');
      setDescription('');
    } catch {
      setError('Failed to add todo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="form-title">✨ Add New Todo</h2>
      {error && (
        <div className="error-message">
          <span>⚠️</span> {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="todo-title" className="form-label">
            Title <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            id="todo-title"
            type="text"
            className="form-input"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            maxLength={500}
          />
        </div>
        <div className="form-group">
          <label htmlFor="todo-description" className="form-label">
            Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            id="todo-description"
            className="form-textarea"
            placeholder="Add more details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => { setTitle(''); setDescription(''); setError(null); }}
            disabled={loading || (!title && !description)}
          >
            Clear
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !title.trim()}
          >
            {loading ? '⏳ Adding...' : '+ Add Todo'}
          </button>
        </div>
      </form>
    </div>
  );
}
