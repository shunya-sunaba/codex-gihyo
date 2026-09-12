import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const storageKey = 'simple-todo.tasks.v1';
const initialTasks = [
  { id: '1', title: 'メールを確認する', completed: false },
  { id: '2', title: '企画書をまとめる', completed: false },
  { id: '3', title: '買い物に行く', completed: false },
  { id: '4', title: '朝のストレッチ', completed: true },
];
const filters = [ ['all', 'すべて'], ['active', '未完了'], ['completed', '完了'] ];

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(saved) && saved.every(task => task && typeof task.id === 'string' && typeof task.title === 'string' && typeof task.completed === 'boolean')) return saved;
  } catch { /* 保存データが読めない場合は初期表示を使用する。 */ }
  return initialTasks;
}

function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState('all');
  const [storageError, setStorageError] = useState(false);
  const remaining = tasks.filter(task => !task.completed).length;
  const visibleTasks = tasks.filter(task => filter === 'all' || (filter === 'completed' ? task.completed : !task.completed));

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(tasks));
      setStorageError(false);
    } catch { setStorageError(true); }
  }, [tasks]);

  function addTask(event) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    setTasks(current => [...current, { id: crypto.randomUUID(), title: trimmedTitle, completed: false }]);
    setTitle('');
    if (filter === 'completed') setFilter('all');
  }

  return (
    <div className="app-shell">
      <header className="app-header"><span className="wordmark">Todo</span></header>
      <main>
        <h1>今日のタスク</h1>
        <form className="add-form" onSubmit={addTask}>
          <label className="sr-only" htmlFor="new-task">新しいタスク</label>
          <input id="new-task" value={title} onChange={event => setTitle(event.target.value)} placeholder="新しいタスクを入力" autoComplete="off" maxLength={300} />
          <button className="add-button" type="submit" disabled={!title.trim()}>追加</button>
        </form>
        <div className="filters" role="group" aria-label="タスクの絞り込み">
          {filters.map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}
        </div>
        <ul className="task-list" aria-label="タスク一覧">
          {visibleTasks.map(task => (
            <li className={task.completed ? 'task completed' : 'task'} key={task.id}>
              <label>
                <input type="checkbox" checked={task.completed} onChange={() => setTasks(current => current.map(item => item.id === task.id ? { ...item, completed: !item.completed } : item))} />
                <span className="checkbox" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /></svg></span>
                <span className="task-title">{task.title}</span>
              </label>
            </li>
          ))}
        </ul>
        {visibleTasks.length === 0 && <p className="empty-state">{filter === 'completed' ? '完了したタスクはまだありません' : filter === 'active' ? 'すべてのタスクが完了しました' : 'タスクを追加して、はじめましょう'}</p>}
        <footer><span role="status">残り{remaining}件</span></footer>
        {storageError && <p className="storage-warning" role="alert">ブラウザに保存できませんでした。この画面を閉じると変更が失われる場合があります。</p>}
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
