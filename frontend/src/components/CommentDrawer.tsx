import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { getComments, addComment, BASE_URL } from '../utils/api';
import './CommentDrawer.css';

interface Comment {
  id: number;
  content: string;
  user: {
    username: string;
    displayName: string;
    profilePictureUrl: string;
  };
  createdAt: string;
}

interface CommentDrawerProps {
  postId: number;
  onClose: () => void;
  onCommentAdded: () => void;
}

const CommentDrawer: React.FC<CommentDrawerProps> = ({ postId, onClose, onCommentAdded }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const res = await getComments(postId);
      setComments(res.data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await addComment(postId, newComment);
      setNewComment('');
      fetchComments();
      onCommentAdded();
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  return (
    <div className="comment-drawer-overlay" onClick={onClose}>
      <div className="comment-drawer animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-handle" />
        <div className="drawer-header">
          <h3>Comments</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="comments-list">
          {loading ? (
            <div className="comments-loading">Loading comments...</div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                {comment.user.profilePictureUrl ? (
                  <img src={`${BASE_URL}${comment.user.profilePictureUrl}`} alt={comment.user.username} className="comment-avatar" />
                ) : (
                  <div className="comment-avatar-placeholder">{comment.user.username[0].toUpperCase()}</div>
                )}
                <div className="comment-content">
                  <p>
                    <span className="comment-username">{comment.user.username}</span>
                    {comment.content}
                  </p>
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-comments">No comments yet. Be the first to comment!</div>
          )}
        </div>

        <form className="comment-input-area" onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Add a comment..." 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button type="submit" disabled={!newComment.trim()}>
            <Send size={20} color={newComment.trim() ? '#09E85E' : '#555'} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommentDrawer;
