import TodoList from '@/components/TodoList';

export default function Home() {
  return (
    <main className="container">
      <div className="header">
        <h1>✅ Todo App</h1>
        <p>Stay organised and get things done</p>
      </div>
      <TodoList />
    </main>
  );
}
