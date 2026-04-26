import React from 'react';
import { Home, Search, MessageCircle, User } from 'lucide-react';
import './BottomNav.css';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'messages', icon: MessageCircle, label: 'Messages' },
    { id: 'account', icon: User, label: 'Profile' },
  ];

  return (
    <div className="bottom-nav-container">
      <nav className="bottom-nav-capsule">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-pill-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
            aria-label={item.label}
          >
            <div className="pill-content">
              <item.icon 
                size={22} 
                className="nav-icon"
                strokeWidth={activeTab === item.id ? 2.5 : 2} 
              />
              {activeTab === item.id && (
                <span className="nav-label-pill">{item.label}</span>
              )}
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default BottomNav;
