"use client";

import { useState } from 'react';

export interface TodoData {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TodoItemProps {
  todo: TodoData;
  onToggle: (id: number, completed: boolean) => Promise<void>;
  onUpdate: (id: number, title: string, description: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TodoItem({ todo, onToggle, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleToggle = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      await onToggle(todo.id, !todo.completed);
    } finally {
      setToggling(false);
    }
  };

  const handleEditSave = async () => {
    setEditError(null);
    if (!editTitle.trim()) {
      setEditError('Title cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      await onUpdate(todo.id, editTitle.trim(), editDescription.trim());
      setIsEditing(false);
    } catch {
      setEditError('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditCancel = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setEditError(null);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    try {
      await onDelete(todo.id);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className={`todo-item${todo.completed ? ' completed' : ''}`}>
      <div className="todo-checkbox-wrapper">
        <input
          type="checkbox"
          className="todo-checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          disabled={toggling || deleting}
          aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
        />
      </div>

      {isEditing ? (
        <div className="todo-edit-form">
          {editError && (
            <div className="error-message">
              <span>⚠️</span> {editError}
            </div>
          )}
          <input
            type="text"
            className="form-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            disabled={saving}
            placeholder="Todo title"
            maxLength={500}
            autoFocus
          />
          <textarea
            className="form-textarea"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            disabled={saving}
            placeholder="Description (optional)"
          />
          <div className="todo-edit-actions">
            <button
              className="btn btn-primary"
              onClick={handleEditSave}
              disabled={saving || !editTitle.trim()}
            >
              {saving ? '⏳ Saving...' : '✓ Save'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleEditCancel}
              disabled={saving}
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="todo-content">
          <div className="todo-title">{todo.title}</div>
          {todo.description && (
            <div className="todo-description">{todo.description}</div>
          )}
          <div className="todo-meta">
            <span className={`todo-badge ${todo.completed ? 'done' : 'pending'}`}>
              {todo.completed ? '✓ Done' : '● Pending'}
            </span>
            <span className="todo-date">{formatDate(todo.createdAt)}</span>
          </div>
        </div>
      )}

      {!isEditing && (
        <div className="todo-actions">
          <button
            className="btn-icon edit"
            onClick={() => setIsEditing(true)}
            disabled={deleting}
            title="Edit todo"
            aria-label="Edit todo"
          >
            ✏️
          </button>
          <button
            className="btn-icon danger"
            onClick={handleDelete}
            disabled={deleting}
            title={confirmDelete ? 'Click again to confirm delete' : 'Delete todo'}
            aria-label={confirmDelete ? 'Confirm delete' : 'Delete todo'}
            style={confirmDelete ? { background: '#fee2e2', color: 'var(--danger)' } : {}}
          >
            {deleting ? '⏳' : confirmDelete ? '⁉️' : '🗑️'}
          </button>
        </div>
      )}
    </div>
  );
}
