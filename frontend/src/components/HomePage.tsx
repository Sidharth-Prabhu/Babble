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

  if (loading) return <div className="loading">Loading Feed...</div>;

  return (
    <div className="home-container">
      <StoriesBar currentUser={currentUser} />
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onUpdate={fetchPosts} />
      ))}
      {posts.length === 0 && (
        <div className="no-posts-feed">
          <p>No posts to show. Follow some people!</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
