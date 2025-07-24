'use client';

import { useEffect, useRef, useCallback } from 'react';
import { PostCard } from './PostCard';
import { Post } from '@/types';

interface PostsListProps {
  posts: Post[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  search: string;
}

export function PostsList({ posts, loading, error, hasMore, onLoadMore, search }: PostsListProps) {
  const observer = useRef<IntersectionObserver>();
  
  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);
  
  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || !hasMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        console.log('Infinite scroll triggered');
        onLoadMore();
      }
    }, {
      threshold: 0.1,
      rootMargin: '100px'
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, onLoadMore]);

  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">Error Loading Posts</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (posts.length === 0 && !loading) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center text-gray-500">
          <p className="text-lg">
            {search 
              ? `No posts found matching "${search}".`
              : 'No posts found.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="grid gap-6 max-w-4xl mx-auto">
        {posts.map((post, index) => {
          // Create unique key combining philosopherId and id, with index as fallback
          const uniqueKey = `${post.philosopherId}-${post.id}-${index}`;
          
          if (posts.length === index + 1) {
            return (
              <div ref={lastPostElementRef} key={uniqueKey}>
                <PostCard post={post} />
              </div>
            );
          } else {
            return <PostCard key={uniqueKey} post={post} />;
          }
        })}

        {/* Loading indicator - only show if we have posts and are loading more */}
        {loading && posts.length > 0 && (
          <div className="loading text-center py-8">
            <div className="inline-flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading more posts...
            </div>
          </div>
        )}

        {/* Initial loading state */}
        {loading && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading posts...
            </div>
          </div>
        )}

        {/* End of posts indicator */}
        {!hasMore && posts.length > 0 && (
          <div className="text-center py-8 text-gray-500 border-t">
            <p>You&apos;ve reached the end! No more posts to load.</p>
          </div>
        )}
      </div>
    </div>
  );
}
