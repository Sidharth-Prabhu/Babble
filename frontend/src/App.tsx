import { useEffect, useState } from 'react'
import { Plus, Edit3, Upload, X } from 'lucide-react'
import './App.css'
import Auth from './components/Auth'
import BottomNav from './components/BottomNav'
import UploadPage from './components/UploadPage'

function App() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUploadPage, setShowUploadPage] = useState(false);

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

  // Handle full-screen upload page
  if (showUploadPage) {
    return (
      <UploadPage 
        onClose={() => setShowUploadPage(false)} 
        onUploadSuccess={() => {
          setShowUploadPage(false);
          setActiveTab('home');
        }}
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <h1>Home Feed</h1>;
      case 'search':
        return <h1>Search</h1>;
      case 'messages':
        return <h1>Messages</h1>;
      case 'account':
        return (
          <div className="profile-page">
            <h1>Account Settings</h1>
            <p>Email: {user.email}</p>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        );
      default:
        return <h1>Home Feed</h1>;
    }
  };

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
        
        <div className="logo">SocialApp</div>
        <div className="top-nav-right"></div>
      </nav>
      
      <main className="content">
        {renderContent()}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}

export default App
