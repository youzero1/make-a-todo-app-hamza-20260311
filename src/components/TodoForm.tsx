"use client";

import { useState, FormEvent } from 'react';

interface TodoFormProps {
  onAdd: (title: string, description: string) => Promise<void>;
}

export default function TodoForm({ onAdd }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onAdd(trimmedTitle, description.trim());
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add todo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-card">
      <h2>Add New Todo</h2>
      {error && (
        <div className="error-banner">
          <span>⚠️</span> {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            disabled={isSubmitting}
            maxLength={200}
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(optional)</span></label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details..."
            rows={2}
            disabled={isSubmitting}
            maxLength={1000}
          />
        </div>
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => { setTitle(''); setDescription(''); setError(null); }}
            disabled={isSubmitting || (!title && !description)}
          >
            Clear
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !title.trim()}
          >
            {isSubmitting ? 'Adding…' : '+ Add Todo'}
          </button>
        </div>
      </form>
    </div>
  );
}
