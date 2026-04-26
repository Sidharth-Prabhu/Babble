import React, { useEffect, useState } from 'react';
import { getAllPosts } from '../utils/api';
import PostCard from './PostCard';
import type { Post } from './PostCard';
import StoriesBar from './StoriesBar';
import './HomePage.css';

interface HomePageProps {
  currentUser: any;
}

const HomePage: React.FC<HomePageProps> = ({ currentUser }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await getAllPosts();
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="home-container">
      <StoriesBar currentUser={currentUser} />
      
      {loading ? (
        <div className="loading-feed">Loading Feed...</div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={fetchPosts} />
          ))}
          {posts.length === 0 && (
            <div className="no-posts-feed">
              <p>No posts to show yet. Be the first to share something!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;
