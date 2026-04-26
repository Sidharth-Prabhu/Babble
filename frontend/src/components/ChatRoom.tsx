import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, MoreVertical, Edit2, Trash2, X, Check, Loader2 } from 'lucide-react';
import { getChatHistory, sendMessage, editMessage, deleteMessage, getUserProfile, BASE_URL } from '../utils/api';
import './ChatRoom.css';

interface Message {
  id: number;
  senderUsername: string;
  recipientUsername: string;
  content: string;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
}

interface ChatUser {
  username: string;
  displayName: string;
  profilePictureUrl: string;
  lastSeenAt: string;
}

const ChatRoom: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatUser, setChatUser] = useState<ChatUser | null>(null);
  const [inputText, setInputText] = useState('');
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showOptions, setShowOptions] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchChatUser();
    fetchHistory();
    const interval = setInterval(fetchHistory, 3000); // Poll every 3s for chat
    return () => clearInterval(interval);
  }, [username]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatUser = async () => {
    try {
      const res = await getUserProfile(username || '');
      setChatUser(res.data);
    } catch (err) {
      console.error('Failed to fetch chat user:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await getChatHistory(username || '');
      setMessages(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (editingMessage) {
      try {
        await editMessage(editingMessage.id, inputText);
        setEditingMessage(null);
        setInputText('');
        fetchHistory();
      } catch (err) {
        console.error('Failed to edit:', err);
      }
    } else {
      const text = inputText;
      setInputText('');
      try {
        await sendMessage(username || '', text);
        fetchHistory();
      } catch (err) {
        console.error('Failed to send:', err);
        setInputText(text); // Restore on failure
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await deleteMessage(id);
      setShowOptions(null);
      fetchHistory();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleEdit = (msg: Message) => {
    setEditingMessage(msg);
    setInputText(msg.content);
    setShowOptions(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getStatus = () => {
    if (!chatUser?.lastSeenAt) return 'Offline';
    const lastSeen = new Date(chatUser.lastSeenAt);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - lastSeen.getTime()) / 60000);

    if (diffMins < 5) return 'Active now';
    if (diffMins < 60) return `Active ${diffMins}m ago`;
    if (diffMins < 1440) return `Active ${Math.floor(diffMins / 60)}h ago`;
    return 'Offline';
  };

  if (loading && !chatUser) return <div className="chat-loading"><Loader2 className="spinner" /></div>;

  return (
    <div className="chat-room-container">
      <header className="chat-header">
        <button className="back-btn" onClick={() => navigate('/messages')}>
          <ChevronLeft size={24} />
        </button>
        <div className="chat-user-info" onClick={() => navigate(`/profile/${username}`)}>
          <div className="chat-avatar">
            {chatUser?.profilePictureUrl ? (
              <img src={`${BASE_URL}${chatUser.profilePictureUrl}`} alt={username} />
            ) : (
              <div className="chat-avatar-placeholder">{username?.[0].toUpperCase()}</div>
            )}
          </div>
          <div className="chat-user-details">
            <span className="chat-display-name">{chatUser?.displayName || username}</span>
            <span className={`chat-status ${getStatus() === 'Active now' ? 'online' : ''}`}>{getStatus()}</span>
          </div>
        </div>
        <button className="chat-info-btn"><MoreVertical size={20} /></button>
      </header>

      <div className="chat-messages">
        {messages.map((msg) => {
          const isMe = msg.senderUsername === currentUser.username;
          return (
            <div key={msg.id} className={`message-row ${isMe ? 'me' : 'them'}`}>
              <div className="message-bubble-wrapper">
                <div 
                  className={`message-bubble ${msg.isDeleted ? 'deleted' : ''}`}
                  onClick={() => isMe && !msg.isDeleted && setShowOptions(showOptions === msg.id ? null : msg.id)}
                >
                  <p>{msg.content}</p>
                  {msg.isEdited && !msg.isDeleted && <span className="edited-label">Edited</span>}
                </div>
                
                {isMe && showOptions === msg.id && !msg.isDeleted && (
                  <div className="message-options animate-fade-in">
                    <button onClick={() => handleEdit(msg)}><Edit2 size={14} /> Edit</button>
                    <button onClick={() => handleDelete(msg.id)} className="delete"><Trash2 size={14} /> Delete</button>
                  </div>
                )}
              </div>
              <span className="message-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <footer className="chat-input-area">
        <form onSubmit={handleSend} className="chat-input-wrapper">
          {editingMessage && (
            <div className="editing-bar">
              <span>Editing message...</span>
              <button type="button" onClick={() => { setEditingMessage(null); setInputText(''); }}><X size={14} /></button>
            </div>
          )}
          <div className="input-row">
            <input 
              type="text" 
              placeholder="Message..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" className="send-btn" disabled={!inputText.trim()}>
              {editingMessage ? <Check size={24} /> : <Send size={24} />}
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
};

export default ChatRoom;
