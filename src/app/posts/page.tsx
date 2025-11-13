'use client';

import { useState, useEffect } from 'react';
import { PostCard } from '@/components/PostCard';
import { Post } from '@/types';

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const searchParam = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : '';
        const response = await fetch(`/api/posts?limit=500${searchParam}`);

        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        setPosts(data.posts || []);
        setTotalPosts(data.total || data.posts?.length || 0);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [debouncedSearch]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-4">
            Aggregated Posts Feed
          </h1>
          <p className="text-lg text-muted max-w-2xl">
            The latest writing from philosophy and theory Substacks
          </p>
        </div>

        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted">Loading posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-4">
          Aggregated Posts Feed
        </h1>
        <p className="text-lg text-muted max-w-2xl">
          The latest writing from philosophy and theory Substacks
        </p>
      </div>

      {/* Search Box */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by author, title, or keyword"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Posts count */}
      <div className="mb-6 text-sm text-muted">
        {posts.length} posts {totalPosts > posts.length && `of ${totalPosts} total`}
        {searchQuery && ` matching "${searchQuery}"`}
      </div>

      {/* Single Column List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            searchQuery={searchQuery}
          />
        ))}
      </div>

      {/* No results */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted">
            {searchQuery ? 'No posts found matching your search.' : 'No posts available yet.'}
          </p>
        </div>
      )}
    </div>
  );
}
