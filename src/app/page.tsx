import TodoList from '@/components/TodoList';

export default function Home() {
  return (
    <main className="container">
      <header className="header">
        <h1 className="header-title">📝 Todo App</h1>
        <p className="header-subtitle">Stay organized and get things done</p>
      </header>
      <TodoList />
    </main>
  );
}
