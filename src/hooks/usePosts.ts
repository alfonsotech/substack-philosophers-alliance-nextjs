import { useState, useEffect, useCallback, useRef } from 'react';
import { Post } from '@/types';

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const initialLoadRef = useRef(true);
  const loadingRef = useRef(false);

  // Keep loading ref in sync
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const fetchPosts = useCallback(async (page: number, searchTerm: string, reset = false) => {
    if (loadingRef.current) {
      console.log('Already loading, skipping request');
      return;
    }
    
    console.log(`Fetching posts - Page: ${page}, Search: "${searchTerm}", Reset: ${reset}`);
    setLoading(true);
    setError(null);

    try {
      const url = new URL('/api/posts', window.location.origin);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', '10');
      if (searchTerm) url.searchParams.append('search', searchTerm);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      console.log(`Received ${data.posts.length} posts, hasMore: ${data.hasMore}`);
      
      if (reset) {
        setPosts(data.posts);
      } else {
        setPosts(prevPosts => {
          // Prevent duplicate posts
          const existingIds = new Set(prevPosts.map(p => p.id));
          const newPosts = data.posts.filter((p: Post) => !existingIds.has(p.id));
          return [...prevPosts, ...newPosts];
        });
      }
      
      setHasMore(data.hasMore);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []); // Remove loading dependency to prevent recreation

  // Initial load
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      fetchPosts(1, '', true);
    }
  }, []); // Empty dependency array - run only once

  // Handle search changes
  const handleSearch = useCallback((searchTerm: string) => {
    setSearch(searchTerm);
    setCurrentPage(1);
    setHasMore(true);
    fetchPosts(1, searchTerm, true);
  }, []);

  // Load more posts
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchPosts(currentPage + 1, search);
    }
  }, [hasMore, loading, currentPage, search]);

  return {
    posts,
    loading,
    error,
    hasMore,
    search,
    handleSearch,
    loadMore,
  };
}
