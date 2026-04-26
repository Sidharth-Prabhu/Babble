import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Trash2, Edit2, Check } from 'lucide-react';
import { getComments, addComment, deleteComment, updateComment, BASE_URL } from '../utils/api';
import './CommentDrawer.css';

interface Comment {
  id: number;
  content: string;
  edited: boolean;
  username: string;
  displayName: string;
  profilePictureUrl: string;
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [activeCommentId, setActiveCommentIndex] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const longPressTimer = useRef<any>(null);

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
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
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

  const handleLongPressStart = (commentId: number) => {
    longPressTimer.current = setTimeout(() => {
      setActiveCommentIndex(commentId);
    }, 600);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(commentId);
      fetchComments();
      onCommentAdded();
      setActiveCommentIndex(null);
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
    setActiveCommentIndex(null);
  };

  const handleUpdateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCommentId || !editContent.trim()) return;

    try {
      await updateComment(editingCommentId, editContent);
      setEditingCommentId(null);
      setEditContent('');
      fetchComments();
    } catch (err) {
      console.error('Failed to update comment:', err);
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
              <div 
                key={comment.id} 
                className={`comment-item ${activeCommentId === comment.id ? 'active-context' : ''}`}
                onMouseDown={() => handleLongPressStart(comment.id)}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                onTouchStart={() => handleLongPressStart(comment.id)}
                onTouchEnd={handleLongPressEnd}
              >
                {comment.profilePictureUrl ? (
                  <img src={`${BASE_URL}${comment.profilePictureUrl}`} alt={comment.username} className="comment-avatar" />
                ) : (
                  <div className="comment-avatar-placeholder">{comment.username[0].toUpperCase()}</div>
                )}
                <div className="comment-content">
                  {editingCommentId === comment.id ? (
                    <form className="edit-comment-form" onSubmit={handleUpdateComment}>
                      <input 
                        type="text" 
                        value={editContent} 
                        onChange={(e) => setEditContent(e.target.value)}
                        autoFocus
                      />
                      <div className="edit-actions">
                         <button type="button" onClick={() => setEditingCommentId(null)} className="cancel-edit"><X size={16} /></button>
                         <button type="submit" className="save-edit"><Check size={16} /></button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p>
                        <span className="comment-username">{comment.username}</span>
                        {comment.content}
                      </p>
                      <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleDateString()}
                        {comment.edited && <span className="edited-tag"> (edited)</span>}
                      </span>
                    </>
                  )}
                </div>
                
                {currentUser && currentUser.username === comment.username && activeCommentId === comment.id && (
                  <div className="comment-actions-overlay">
                     <button onClick={() => startEditing(comment)} className="action-item"><Edit2 size={18} /> Edit</button>
                     <button onClick={() => handleDeleteComment(comment.id)} className="action-item delete"><Trash2 size={18} /> Delete</button>
                     <button onClick={() => setActiveCommentIndex(null)} className="action-item cancel"><X size={18} /></button>
                  </div>
                )}
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
