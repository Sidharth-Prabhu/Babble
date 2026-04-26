import React, { useState } from 'react';
import { Heart, MessageCircle, Send, MoreHorizontal, Bookmark } from 'lucide-react';
import { toggleLike, BASE_URL } from '../utils/api';
import CommentDrawer from './CommentDrawer';

export interface Post {
  id: number;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: string;
  createdAt: string;
  user: {
    username: string;
    displayName: string;
    profilePictureUrl: string;
  };
  likesCount: number;
  commentsCount: number;
  likedByCurrentUser: boolean;
}

interface PostCardProps {
  post: Post;
  onUpdate?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post: initialPost, onUpdate }) => {
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [animateHeart, setAnimateHeart] = useState(false);

  const handleLike = async () => {
    try {
      const res = await toggleLike(post.id);
      const isLiked = res.data;
      setPost({
        ...post,
        likedByCurrentUser: isLiked,
        likesCount: isLiked ? post.likesCount + 1 : post.likesCount - 1
      });
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleMediaClick = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // It's a double tap
      if (!post.likedByCurrentUser) {
        handleLike();
      }
      setAnimateHeart(true);
      setTimeout(() => setAnimateHeart(false), 1000);
    }
    setLastTap(now);
  };

  return (
    <article className="post-card">
      <header className="post-header">
        <div className="post-user-info">
          {post.user.profilePictureUrl ? (
            <img 
              src={`${BASE_URL}${post.user.profilePictureUrl}`} 
              alt={post.user.username} 
              className="post-avatar"
            />
          ) : (
            <div className="post-avatar-placeholder">
              {post.user.username[0].toUpperCase()}
            </div>
          )}
          <div className="post-user-details">
            <span className="post-display-name">{post.user.displayName || post.user.username}</span>
            <span className="post-username">@{post.user.username}</span>
          </div>
        </div>
        <button className="post-more-btn"><MoreHorizontal size={20} /></button>
      </header>

      <div className="post-media-container" onClick={handleMediaClick}>
        {post.mediaType === 'video' ? (
          <video 
            src={`${BASE_URL}${post.mediaUrl}`} 
            controls 
            className="post-media"
          />
        ) : (
          <img 
            src={`${BASE_URL}${post.mediaUrl}`} 
            alt={post.title} 
            className="post-media"
          />
        )}
        {animateHeart && (
          <div className="double-tap-heart">
            <Heart size={80} fill="white" color="white" />
          </div>
        )}
      </div>

      <div className="post-actions-section">
        <div className="post-main-actions">
          <button 
            className={`action-btn like-btn ${post.likedByCurrentUser ? 'active' : ''}`}
            onClick={handleLike}
          >
            <Heart size={24} fill={post.likedByCurrentUser ? 'var(--primary)' : 'none'} color={post.likedByCurrentUser ? 'var(--primary)' : 'currentColor'} />
          </button>
          <button 
            className="action-btn comment-btn"
            onClick={() => setShowComments(true)}
          >
            <MessageCircle size={24} />
          </button>
          <button className="action-btn share-btn"><Send size={24} /></button>
        </div>
        <button className="action-btn save-btn"><Bookmark size={24} /></button>
      </div>

      <div className="post-content-details">
        <div className="post-likes-count">{post.likesCount.toLocaleString()} likes</div>
        <div className="post-caption">
          <span className="caption-username">{post.user.username}</span> {post.description}
        </div>
        {post.commentsCount > 0 && (
          <button 
            className="view-comments-btn"
            onClick={() => setShowComments(true)}
          >
            View all {post.commentsCount} comments
          </button>
        )}
        <div className="post-time">
          {new Date(post.createdAt).toLocaleDateString()}
        </div>
      </div>

      {showComments && (
        <CommentDrawer 
          postId={post.id} 
          onClose={() => setShowComments(false)}
          onCommentAdded={() => {
            if (onUpdate) onUpdate();
            // Refresh counts would be ideal here too
          }}
        />
      )}
    </article>
  );
};

export default PostCard;
