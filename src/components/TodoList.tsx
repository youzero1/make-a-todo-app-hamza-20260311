"use client";

import { useState, useEffect, useCallback } from 'react';
import TodoForm from './TodoForm';
import TodoItem, { TodoData } from './TodoItem';

type FilterType = 'all' | 'pending' | 'completed';

export default function TodoList() {
  const [todos, setTodos] = useState<TodoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const fetchTodos = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/todos');
      if (!res.ok) throw new Error('Failed to fetch todos');
      const data: TodoData[] = await res.json() as TodoData[];
      setTodos(data);
    } catch {
      setError('Failed to load todos. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTodos();
  }, [fetchTodos]);

  const handleAdd = async (title: string, description: string) => {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: description || undefined }),
    });
    if (!res.ok) {
      const err = await res.json() as { error?: string };
      throw new Error(err.error || 'Failed to create todo');
    }
    const newTodo: TodoData = await res.json() as TodoData;
    setTodos((prev) => [newTodo, ...prev]);
  };

  const handleToggle = async (id: number, completed: boolean) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    if (!res.ok) throw new Error('Failed to update todo');
    const updated: TodoData = await res.json() as TodoData;
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const handleUpdate = async (id: number, title: string, description: string) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: description || null }),
    });
    if (!res.ok) throw new Error('Failed to update todo');
    const updated: TodoData = await res.json() as TodoData;
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete todo');
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;

  return (
    <div>
      <TodoForm onAdd={handleAdd} />

      {error && (
        <div className="error-message">
          <span>⚠️</span> {error}
          <button
            className="btn btn-ghost"
            onClick={() => void fetchTodos()}
            style={{ marginLeft: 'auto', padding: '0.125rem 0.5rem', fontSize: '0.8125rem' }}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && (
        <div className="stats-bar">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="stats-item">
              <span>Total</span>
              <span className="stats-badge">{totalCount}</span>
            </div>
            <div className="stats-item">
              <span>Completed</span>
              <span className="stats-badge done">{completedCount}</span>
            </div>
            <div className="stats-item">
              <span>Pending</span>
              <span className="stats-badge">{pendingCount}</span>
            </div>
          </div>
          <div className="filter-tabs">
            {(['all', 'pending', 'completed'] as FilterType[]).map((f) => (
              <button
                key={f}
                className={`filter-tab${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">
          <div className="loading-spinner" />
          <div>Loading todos...</div>
        </div>
      ) : filteredTodos.length === 0 ? (
        <div className="todo-empty">
          <span className="todo-empty-icon">
            {filter === 'completed' ? '🎉' : filter === 'pending' ? '🎯' : '📋'}
          </span>
          <div className="todo-empty-text">
            {filter === 'completed'
              ? 'No completed todos yet'
              : filter === 'pending'
              ? 'No pending todos'
              : 'No todos yet'}
          </div>
          <div className="todo-empty-sub">
            {filter === 'all'
              ? 'Add your first todo above to get started!'
              : `Switch to "All" to see all todos.`}
          </div>
        </div>
      ) : (
        <div className="todo-list">
          {filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
