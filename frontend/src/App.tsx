import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Plus, Edit3, Upload, X } from 'lucide-react'
import './App.css'
import Auth from './components/Auth'
import BottomNav from './components/BottomNav'
import UploadPage from './components/UploadPage'
import ProfilePage from './components/ProfilePage'
import HomePage from './components/HomePage'

function App() {
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUploadPage, setShowUploadPage] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/search') return 'search';
    if (path === '/messages') return 'messages';
    if (path.startsWith('/profile')) return 'account';
    return 'home';
  };

  if (!user) {
    return <Auth />;
  }

  if (showUploadPage) {
    return (
      <UploadPage 
        onClose={() => setShowUploadPage(false)} 
        onUploadSuccess={() => {
          setShowUploadPage(false);
          navigate(`/profile/${user.username}`);
        }}
      />
    );
  }

  return (
    <div className="app-main">
      <nav className="top-nav">
        <div className="top-nav-left">
          <button 
            className="plus-btn" 
            onClick={() => setShowDropdown(!showDropdown)}
            aria-label="Create new"
          >
            {showDropdown ? <X size={24} /> : <Plus size={24} />}
          </button>
          
          {showDropdown && (
            <div className="nav-dropdown animate-fade-in">
              <button className="dropdown-item" onClick={() => setShowDropdown(false)}>
                <Edit3 size={18} />
                <span>Make a Post</span>
              </button>
              <button className="dropdown-item" onClick={() => {
                setShowUploadPage(true);
                setShowDropdown(false);
              }}>
                <Upload size={18} />
                <span>Upload</span>
              </button>
            </div>
          )}
        </div>
        
        <div className="logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>Babble</div>
        <div className="top-nav-right">
          <button onClick={handleLogout} className="logout-mini-btn">Logout</button>
        </div>
      </nav>
      
      <main className="content">
        <Routes>
          <Route path="/" element={<HomePage currentUser={user} />} />
          <Route path="/search" element={<h1>Search</h1>} />
          <Route path="/messages" element={<h1>Messages</h1>} />
          <Route path="/profile/:username" element={<ProfilePage />} />
        </Routes>
      </main>

      <BottomNav 
        activeTab={getActiveTab()} 
        setActiveTab={(tab) => {
          if (tab === 'home') navigate('/');
          else if (tab === 'account') navigate(`/profile/${user.username}`);
          else navigate(`/${tab}`);
        }} 
      />
    </div>
  )
}

export default App

