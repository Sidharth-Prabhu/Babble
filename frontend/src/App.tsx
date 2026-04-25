import { useEffect, useState } from 'react'
import './App.css'
import Auth from './components/Auth'

function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="app-main">
      <nav className="top-nav">
        <div className="logo">SocialApp</div>
        <div className="user-profile">
          <span>Welcome, {user.username}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>
      <main className="content">
        <h1>Dashboard Coming Soon</h1>
        <p>You are logged in as {user.email}</p>
      </main>
    </div>
  )
}

export default App
