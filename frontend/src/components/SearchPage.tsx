import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User as UserIcon, Loader2, Users, FileText, X } from 'lucide-react';
import { globalSearch, toggleFollow, BASE_URL } from '../utils/api';
import PostCard from './PostCard';
import type { Post } from './PostCard';
import './SearchPage.css';

interface UserResult {
  username: string;
  displayName: string;
  profilePictureUrl: string;
  following: boolean;
}

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<UserResult[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else {
        setUsers([]);
        setPosts([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await globalSearch(query);
      setUsers(res.data.users);
      setPosts(res.data.posts);
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
      setUsers(users.map(u => 
        u.username === username ? { ...u, following: isFollowing } : u
      ));
    } catch (err) {
      console.error('Follow toggle failed:', err);
    }
  };

  return (
    <div className="search-container">
      <div className="search-header-unified">
        <div className="search-input-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search accounts or posts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
            autoFocus
          />
          {loading && <Loader2 size={20} className="spinner search-loader" />}
        </div>
      </div>

      <div className="search-content-unified">
        {query && !loading && users.length === 0 && posts.length === 0 && (
          <div className="no-results">
            <p>No results found for "{query}"</p>
          </div>
        )}

        {users.length > 0 && (
          <section className="search-section">
            <div className="section-header-mini">
              <Users size={16} /> <span>Accounts</span>
            </div>
            <div className="search-results-users">
              {users.map((user) => (
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
            </div>
          </section>
        )}

        {posts.length > 0 && (
          <section className="search-section">
            <div className="section-header-mini">
              <FileText size={16} /> <span>Posts</span>
            </div>
            <div className="search-posts-grid">
              {posts.map((post) => (
                <div 
                  key={post.id} 
                  className="search-grid-item"
                  onClick={() => setSelectedPost(post)}
                >
                  {post.mediaType === 'video' ? (
                    <video src={`${BASE_URL}${post.mediaUrl}`} className="grid-media" />
                  ) : (
                    <img src={`${BASE_URL}${post.mediaUrl}`} alt={post.title} className="grid-media" />
                  )}
                  {post.mediaType === 'video' && <div className="video-indicator">▶</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {!query && (
          <div className="search-placeholder">
            <Search size={48} />
            <p>Search for friends and creators</p>
          </div>
        )}
      </div>

      {selectedPost && (
        <div className="post-detail-overlay" onClick={() => setSelectedPost(null)}>
          <button className="post-detail-close" onClick={() => setSelectedPost(null)}><X size={32} /></button>
          <div className="post-detail-content" onClick={(e) => e.stopPropagation()}>
            <PostCard post={selectedPost} onUpdate={handleSearch} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
