import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, MessageCircle, UserPlus, Edit3, Calendar, Clock, X } from 'lucide-react';
import { getUserProfile, getCurrentUser, BASE_URL } from '../utils/api';
import EditProfileModal from './EditProfileModal';
import PostCard from './PostCard';
import type { Post as IPost } from './PostCard';
import './ProfilePage.css';

interface Post {
  id: number;
  mediaUrl: string;
  mediaType: string;
  title: string;
  description: string;
  createdAt: string;
  user: any;
  likesCount: number;
  commentsCount: number;
  likedByCurrentUser: boolean;
}

interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  profilePictureUrl: string;
  bannerUrl: string;
  createdAt: string;
  posts: Post[];
  totalPosts: number;
  followers: number;
  likes: number;
}

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isMe, setIsMe] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<IPost | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await getUserProfile(username || '');
      setProfile(res.data);
      
      const meRes = await getCurrentUser();
      if (meRes.data.username === res.data.username) {
        setIsMe(true);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  if (loading) return <div className="loading">Loading Profile...</div>;
  if (!profile) return <div className="error">Profile not found.</div>;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="profile-container">
      {/* Banner Section */}
      <div className="banner-section">
        {profile.bannerUrl ? (
          <img src={`${BASE_URL}${profile.bannerUrl}`} alt="Banner" className="banner-img" />
        ) : (
          <div className="banner-placeholder" />
        )}
        <div className="banner-overlay" />
      </div>

      {/* Profile Info Header */}
      <div className="profile-header">
        <div className="profile-pic-container">
          {profile.profilePictureUrl ? (
            <img src={`${BASE_URL}${profile.profilePictureUrl}`} alt="Profile" className="profile-pic" />
          ) : (
            <div className="profile-pic-placeholder">{profile.username[0].toUpperCase()}</div>
          )}
        </div>

        <div className="badge-container">
          <span className="premium-badge">✨ sandow plus</span>
        </div>

        <div className="member-since">
          <Calendar size={14} /> Member since {formatDate(profile.createdAt)}
        </div>

        <h1 className="profile-name">{profile.displayName}</h1>
        <p className="profile-bio">{profile.bio || "No bio yet."}</p>

        {/* Stats Section */}
        <div className="stats-row">
          <div className="stat-item">
            <Grid size={20} />
            <span className="stat-value">{profile.totalPosts}</span>
            <span className="stat-label">Total Posts</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <UserPlus size={20} />
            <span className="stat-value">{(profile.followers / 1000).toFixed(1)}k</span>
            <span className="stat-label">Followers</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <MessageCircle size={20} />
            <span className="stat-value">{profile.likes}</span>
            <span className="stat-label">Likes</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          {isMe ? (
            <button className="btn-primary edit-btn" onClick={() => setShowEditModal(true)}>
              Edit Profile <Edit3 size={18} />
            </button>
          ) : (
            <>
              <button className="btn-primary follow-btn">Follow +</button>
              <button className="btn-secondary chat-btn">Chat <MessageCircle size={18} /></button>
            </>
          )}
        </div>
      </div>

      {/* Posts Section */}
      <div className="posts-section">
        <div className="section-header">
          <h2>All Posts</h2>
          <div className="filter-dropdown">
            <Clock size={16} /> Newest
          </div>
        </div>

        <div className="posts-grid">
          {profile.posts.map((post) => (
            <div key={post.id} className="grid-item" onClick={() => setSelectedPost(post as any)}>
              {post.mediaType === 'video' ? (
                <video src={`${BASE_URL}${post.mediaUrl}`} />
              ) : (
                <img src={`${BASE_URL}${post.mediaUrl}`} alt={post.title} />
              )}
            </div>
          ))}
          {profile.posts.length === 0 && (
            <div className="no-posts">No posts to show.</div>
          )}
        </div>
      </div>

      {showEditModal && (
        <EditProfileModal 
          profile={profile} 
          onClose={() => setShowEditModal(false)} 
          onUpdate={fetchProfile}
        />
      )}

      {selectedPost && (
        <div className="post-detail-overlay" onClick={() => setSelectedPost(null)}>
          <button className="post-detail-close" onClick={() => setSelectedPost(null)}><X size={32} /></button>
          <div className="post-detail-content" onClick={(e) => e.stopPropagation()}>
            <PostCard post={selectedPost} onUpdate={fetchProfile} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
