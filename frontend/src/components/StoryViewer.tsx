import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { BASE_URL } from '../utils/api';

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

interface UserStories {
  username: string;
  profilePictureUrl: string;
  stories: Story[];
}

interface StoryViewerProps {
  userStories: UserStories;
  onClose: () => void;
  onAllStoriesEnd?: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ userStories, onClose, onAllStoriesEnd }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 5000;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          handleNext();
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < userStories.stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      if (onAllStoriesEnd) onAllStoriesEnd();
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now.getTime() - past.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInHours > 0) return `${diffInHours}h`;
    if (diffInMinutes > 0) return `${diffInMinutes}m`;
    return 'now';
  };

  const currentStory = userStories.stories[currentIndex];

  return (
    <div className="story-viewer-overlay" onClick={onClose}>
      <div className="story-viewer-content" onClick={(e) => e.stopPropagation()}>
        <div className="story-progress-container-multi">
          {userStories.stories.map((_, idx) => (
            <div key={idx} className="progress-segment-bg">
              <div 
                className="progress-segment-fill" 
                style={{ 
                  width: idx < currentIndex ? '100%' : (idx === currentIndex ? `${progress}%` : '0%') 
                }}
              />
            </div>
          ))}
        </div>
        
        <div className="story-viewer-header">
           <div className="story-user">
              {userStories.profilePictureUrl ? (
                <img src={`${BASE_URL}${userStories.profilePictureUrl}`} className="mini-avatar" alt="" />
              ) : (
                <div className="mini-avatar-placeholder">{userStories.username[0]}</div>
              )}
              <span>{userStories.username}</span>
              <span className="story-time-hint">• {getTimeAgo(currentStory.createdAt)}</span>
           </div>
           <button className="close-story" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="story-nav-areas">
          <div className="nav-area left" onClick={handlePrev} />
          <div className="nav-area right" onClick={handleNext} />
        </div>

        {currentStory.mediaType === 'video' ? (
          <video src={`${BASE_URL}${currentStory.mediaUrl}`} autoPlay key={currentStory.id} className="full-story-media" />
        ) : (
          <img src={`${BASE_URL}${currentStory.mediaUrl}`} alt="Story" key={currentStory.id} className="full-story-media" />
        )}
      </div>
    </div>
  );
};

export default StoryViewer;
