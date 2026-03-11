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

export default function TodoItem({ todo, onToggle, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const handleToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      await onToggle(todo.id, !todo.completed);
    } finally {
      setIsToggling(false);
    }
  };

  const handleEditSave = async () => {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      setEditError('Title cannot be empty');
      return;
    }
    setIsSaving(true);
    setEditError(null);
    try {
      await onUpdate(todo.id, trimmedTitle, editDescription.trim());
      setIsEditing(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCancel = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setEditError(null);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${todo.title}"?`)) return;
    setIsDeleting(true);
    try {
      await onDelete(todo.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = new Date(todo.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className={`todo-item${todo.completed ? ' completed' : ''}`}>
      {isEditing ? (
        <div className="todo-edit-form">
          {editError && (
            <div className="error-banner">
              <span>⚠️</span> {editError}
            </div>
          )}
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Title"
            disabled={isSaving}
            maxLength={200}
            autoFocus
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            disabled={isSaving}
            maxLength={1000}
          />
          <div className="todo-edit-actions">
            <button
              className="btn btn-secondary"
              onClick={handleEditCancel}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleEditSave}
              disabled={isSaving || !editTitle.trim()}
            >
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div className="todo-item-view">
          <button
            className={`todo-checkbox${todo.completed ? ' checked' : ''}`}
            onClick={handleToggle}
            disabled={isToggling}
            title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
            aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
          />
          <div className="todo-content">
            <div className="todo-title-row">
              <span className={`todo-title${todo.completed ? ' completed' : ''}`}>
                {todo.title}
              </span>
              {todo.completed && (
                <span className="badge badge-success">Done</span>
              )}
            </div>
            {todo.description && (
              <div className={`todo-description${todo.completed ? ' completed' : ''}`}>
                {todo.description}
              </div>
            )}
            <div className="todo-date">Created {formattedDate}</div>
          </div>
          <div className="todo-actions">
            <button
              className="btn btn-secondary btn-icon"
              onClick={() => { setIsEditing(true); setEditTitle(todo.title); setEditDescription(todo.description || ''); }}
              title="Edit"
              aria-label="Edit todo"
              disabled={isDeleting}
            >
              ✏️
            </button>
            <button
              className="btn btn-danger btn-icon"
              onClick={handleDelete}
              title="Delete"
              aria-label="Delete todo"
              disabled={isDeleting}
            >
              {isDeleting ? '…' : '🗑️'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
