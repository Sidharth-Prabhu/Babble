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

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => setActiveTab(item.id)}
          aria-label={item.label}
        >
          <item.icon 
            size={24} 
            strokeWidth={activeTab === item.id ? 2.5 : 2} 
            color={activeTab === item.id ? '#09E85E' : '#FFFFFF'}
          />
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
