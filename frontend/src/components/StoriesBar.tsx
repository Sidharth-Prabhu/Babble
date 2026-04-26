import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { getStories, uploadStory, BASE_URL } from '../utils/api';
import StoryViewer from './StoryViewer';
import './StoriesBar.css';

interface Story {
  id: number;
  mediaUrl: string;
  mediaType: string;
  createdAt: string;
  user: {
    username: string;
    profilePictureUrl: string;
  };
}

export interface UserStories {
  username: string;
  profilePictureUrl: string;
  stories: Story[];
}

interface StoriesBarProps {
  currentUser: any;
}

const StoriesBar: React.FC<StoriesBarProps> = ({ currentUser }) => {
  const [userStories, setUserStories] = useState<UserStories[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeUserIndex, setActiveUserIndex] = useState<number | null>(null);

  const fetchStories = async () => {
    try {
      const res = await getStories();
      const rawStories: Story[] = res.data;
      
      const grouped = rawStories.reduce((acc: { [key: string]: UserStories }, story) => {
        const username = story.user.username;
        if (!acc[username]) {
          acc[username] = {
            username: username,
            profilePictureUrl: story.user.profilePictureUrl,
            stories: []
          };
        }
        acc[username].stories.push(story);
        return acc;
      }, {});

      Object.values(grouped).forEach(user => {
        user.stories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      });

      setUserStories(Object.values(grouped));
    } catch (err) {
      console.error('Failed to fetch stories:', err);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      try {
        await uploadStory(e.target.files[0]);
        fetchStories();
      } catch (err) {
        console.error('Story upload failed:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const activeUserStories = activeUserIndex !== null ? userStories[activeUserIndex] : null;

  return (
    <div className="stories-container">
      <div className="stories-wrapper">
        <div className="story-item" onClick={() => document.getElementById('story-upload')?.click()}>
          <div className="story-avatar-wrapper mine">
            {currentUser.profilePictureUrl ? (
              <img src={`${BASE_URL}${currentUser.profilePictureUrl}`} alt="Me" className="story-avatar" />
            ) : (
              <div className="story-avatar-placeholder">{currentUser.username[0].toUpperCase()}</div>
            )}
            <div className="add-story-badge">
              <Plus size={14} color="white" strokeWidth={3} />
            </div>
          </div>
          <span className="story-username">Your Story</span>
          <input id="story-upload" type="file" accept="image/*,video/*" hidden onChange={handleFileUpload} disabled={loading} />
        </div>

        {userStories.map((user, idx) => (
          <div key={user.username} className="story-item" onClick={() => setActiveUserIndex(idx)}>
            <div className="story-avatar-wrapper active">
              {user.profilePictureUrl ? (
                <img src={`${BASE_URL}${user.profilePictureUrl}`} alt={user.username} className="story-avatar" />
              ) : (
                <div className="story-avatar-placeholder">{user.username[0].toUpperCase()}</div>
              )}
            </div>
            <span className="story-username">{user.username}</span>
          </div>
        ))}
      </div>

      {activeUserStories && (
        <StoryViewer 
          userStories={activeUserStories} 
          onClose={() => setActiveUserIndex(null)}
          onAllStoriesEnd={() => {
            if (activeUserIndex !== null && activeUserIndex < userStories.length - 1) {
              setActiveUserIndex(activeUserIndex + 1);
            } else {
              setActiveUserIndex(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default StoriesBar;
