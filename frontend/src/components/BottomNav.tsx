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
    { id: 'account', icon: User, label: 'Account' },
  ];

  const activeIndex = navItems.findIndex(item => item.id === activeTab);

  return (
    <nav className="bottom-nav">
      <div 
        className="nav-indicator" 
        style={{ 
          width: `${100 / navItems.length}%`,
          transform: `translateX(${activeIndex * 100}%)`
        }}
      >
        <div className="indicator-pill"></div>
      </div>
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => setActiveTab(item.id)}
          aria-label={item.label}
        >
          <div className="icon-wrapper">
            <item.icon 
              size={24} 
              strokeWidth={activeTab === item.id ? 2.5 : 2} 
            />
          </div>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
