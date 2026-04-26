import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User as UserIcon, Loader2 } from 'lucide-react';
import { searchUsers, toggleFollow, BASE_URL } from '../utils/api';
import './SearchPage.css';

interface UserResult {
  username: string;
  displayName: string;
  profilePictureUrl: string;
  following: boolean;
}

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await searchUsers(query);
      setResults(res.data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (e: React.MouseEvent, username: string) => {
    e.stopPropagation();
    try {
      const res = await toggleFollow(username);
      const isFollowing = res.data.following;
      setResults(results.map(u => 
        u.username === username ? { ...u, following: isFollowing } : u
      ));
    } catch (err) {
      console.error('Follow toggle failed:', err);
    }
  };

  return (
    <div className="search-container">
      <div className="search-bar-wrapper">
        <div className="search-input-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
            autoFocus
          />
          {loading && <Loader2 size={20} className="spinner search-loader" />}
        </div>
      </div>

      <div className="search-results">
        {results.map((user) => (
          <div 
            key={user.username} 
            className="search-result-item"
            onClick={() => navigate(`/profile/${user.username}`)}
          >
            <div className="result-avatar-wrapper">
              {user.profilePictureUrl ? (
                <img src={`${BASE_URL}${user.profilePictureUrl}`} alt={user.username} className="result-avatar" />
              ) : (
                <div className="result-avatar-placeholder">
                  <UserIcon size={20} />
                </div>
              )}
            </div>
            
            <div className="result-info">
              <span className="result-display-name">{user.displayName}</span>
              <span className="result-username">@{user.username}</span>
            </div>

            <button 
              className={`follow-btn-mini ${user.following ? 'following' : ''}`}
              onClick={(e) => handleFollowToggle(e, user.username)}
            >
              {user.following ? 'Following' : 'Follow'}
            </button>
          </div>
        ))}

        {query && !loading && results.length === 0 && (
          <div className="no-results">
            <p>No users found matching "{query}"</p>
          </div>
        )}

        {!query && (
          <div className="search-placeholder">
            <Search size={48} />
            <p>Search for friends and creators</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
