"use client";

import { useState, useEffect, useCallback } from 'react';
import TodoForm from './TodoForm';
import TodoItem, { TodoData } from './TodoItem';

type FilterType = 'all' | 'active' | 'completed';

export default function TodoList() {
  const [todos, setTodos] = useState<TodoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const fetchTodos = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch('/api/todos');
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || 'Failed to fetch todos');
      }
      const data = await res.json() as TodoData[];
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleAdd = async (title: string, description: string) => {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: description || undefined }),
    });
    if (!res.ok) {
      const data = await res.json() as { error?: string };
      throw new Error(data.error || 'Failed to create todo');
    }
    const newTodo = await res.json() as TodoData;
    setTodos((prev) => [newTodo, ...prev]);
  };

  const handleToggle = async (id: number, completed: boolean) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    if (!res.ok) {
      const data = await res.json() as { error?: string };
      throw new Error(data.error || 'Failed to update todo');
    }
    const updated = await res.json() as TodoData;
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const handleUpdate = async (id: number, title: string, description: string) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: description || null }),
    });
    if (!res.ok) {
      const data = await res.json() as { error?: string };
      throw new Error(data.error || 'Failed to update todo');
    }
    const updated = await res.json() as TodoData;
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json() as { error?: string };
      throw new Error(data.error || 'Failed to delete todo');
    }
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = totalCount - completedCount;

  return (
    <div>
      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-number">{totalCount}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{activeCount}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{completedCount}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {/* Add Form */}
      <TodoForm onAdd={handleAdd} />

      {/* Global error */}
      {error && (
        <div className="error-banner">
          <span>⚠️</span> {error}
          <button
            className="btn btn-secondary"
            style={{ marginLeft: 'auto', padding: '0.25rem 0.75rem', fontSize: '0.8125rem' }}
            onClick={fetchTodos}
          >
            Retry
          </button>
        </div>
      )}

      {/* List */}
      <div className="todo-list-header">
        <h2>My Todos</h2>
        <div className="filter-tabs">
          {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
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

      {isLoading ? (
        <div className="loading-state">
          <div className="spinner" />
          <div>Loading todos…</div>
        </div>
      ) : filteredTodos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            {filter === 'completed' ? '🎉' : filter === 'active' ? '✨' : '📝'}
          </div>
          <h3>
            {filter === 'completed'
              ? 'No completed todos yet'
              : filter === 'active'
              ? 'No active todos'
              : 'No todos yet'}
          </h3>
          <p>
            {filter === 'all'
              ? 'Add your first todo above to get started!'
              : filter === 'active'
              ? 'All caught up! Great work.'
              : 'Complete some todos to see them here.'}
          </p>
        </div>
      ) : (
        <div>
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
