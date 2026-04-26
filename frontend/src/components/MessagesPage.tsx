import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User as UserIcon, MessageCircle, Send, Plus, Loader2 } from 'lucide-react';
import { getConversations, globalSearch, toggleFollow, BASE_URL } from '../utils/api';
import './MessagesPage.css';

interface Conversation {
  username: string;
  displayName: string;
  profilePictureUrl: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageFromMe: boolean;
}

interface UserSearchResult {
  username: string;
  displayName: string;
  profilePictureUrl: string;
  following: boolean;
}

const MessagesPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000); // Poll every 10s for list
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchConversations = async () => {
    try {
      const res = await getConversations();
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await globalSearch(searchQuery);
      setSearchResults(res.data.users);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowAndChat = async (user: UserSearchResult) => {
    if (!user.following) {
      try {
        await toggleFollow(user.username);
      } catch (err) {
        console.error('Follow failed:', err);
      }
    }
    navigate(`/messages/${user.username}`);
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 86400000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="messages-container">
      <div className="messages-header">
        <h1>Messages</h1>
        <button className="new-message-btn" onClick={() => setIsSearching(!isSearching)}>
          {isSearching ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      <div className="messages-search-bar">
        <div className="msg-search-input-wrapper">
          <Search size={18} className="msg-search-icon" />
          <input 
            type="text" 
            placeholder="Search for people..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!isSearching) setIsSearching(true);
            }}
            onFocus={() => setIsSearching(true)}
          />
          {loading && <Loader2 size={18} className="spinner" />}
        </div>
      </div>

      <div className="messages-content">
        {isSearching ? (
          <div className="msg-search-results">
            {searchResults.map((user) => (
              <div 
                key={user.username} 
                className="msg-search-item"
                onClick={() => handleFollowAndChat(user)}
              >
                <div className="msg-avatar-wrapper">
                  {user.profilePictureUrl ? (
                    <img src={`${BASE_URL}${user.profilePictureUrl}`} alt={user.username} />
                  ) : (
                    <div className="msg-avatar-placeholder"><UserIcon size={20} /></div>
                  )}
                </div>
                <div className="msg-info">
                  <span className="msg-display-name">{user.displayName}</span>
                  <span className="msg-username">@{user.username}</span>
                </div>
                {!user.following && <span className="follow-badge">Follow & Chat</span>}
                <Send size={18} className="msg-send-icon" />
              </div>
            ))}
            {searchQuery && !loading && searchResults.length === 0 && (
              <div className="no-msg-results">No people found.</div>
            )}
            {!searchQuery && <div className="no-msg-results">Search for someone to start chatting.</div>}
          </div>
        ) : (
          <div className="conversations-list">
            {conversations.map((conv) => (
              <div 
                key={conv.username} 
                className="conversation-item"
                onClick={() => navigate(`/messages/${conv.username}`)}
              >
                <div className="msg-avatar-wrapper">
                  {conv.profilePictureUrl ? (
                    <img src={`${BASE_URL}${conv.profilePictureUrl}`} alt={conv.username} />
                  ) : (
                    <div className="msg-avatar-placeholder"><UserIcon size={20} /></div>
                  )}
                </div>
                <div className="msg-info">
                  <div className="msg-info-top">
                    <span className="msg-display-name">{conv.displayName}</span>
                    <span className="msg-time">{formatTime(conv.lastMessageTime)}</span>
                  </div>
                  <p className="msg-last">
                    {conv.lastMessageFromMe && <span className="me-label">You: </span>}
                    {conv.lastMessage}
                  </p>
                </div>
              </div>
            ))}
            {conversations.length === 0 && (
              <div className="empty-messages">
                <MessageCircle size={48} />
                <p>No messages yet.</p>
                <button className="btn-primary" onClick={() => setIsSearching(true)}>Send a message</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;

const X = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
