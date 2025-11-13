'use client';

import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import PhilosopherCard from '@/components/PhilosopherCard';
import { Philosopher } from '@/types';

const ITEMS_PER_PAGE = 9;

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allPhilosophers, setAllPhilosophers] = useState<Philosopher[]>([]);
  const [filteredPhilosophers, setFilteredPhilosophers] = useState<Philosopher[]>([]);
  const [displayedPhilosophers, setDisplayedPhilosophers] = useState<Philosopher[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  // Fetch all philosophers from API on mount
  useEffect(() => {
    async function fetchPhilosophers() {
      try {
        setLoading(true);
        const response = await fetch('/api/philosophers?limit=1500');

        if (!response.ok) {
          throw new Error('Failed to fetch philosophers');
        }

        const data = await response.json();
        setAllPhilosophers(data.philosophers || data);
        setFilteredPhilosophers(data.philosophers || data);
        setDisplayedPhilosophers((data.philosophers || data).slice(0, ITEMS_PER_PAGE));
        setHasMore((data.philosophers || data).length > ITEMS_PER_PAGE);
      } catch (err) {
        console.error('Error fetching philosophers:', err);
        setError('Failed to load philosophers. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchPhilosophers();
  }, []);

  // Filter philosophers based on search query
  useEffect(() => {
    if (!allPhilosophers.length) return;

    const filtered = allPhilosophers.filter((philosopher) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        philosopher.name.toLowerCase().includes(searchLower) ||
        philosopher.publicationName.toLowerCase().includes(searchLower) ||
        (philosopher.bio && philosopher.bio.toLowerCase().includes(searchLower))
      );
    });
    setFilteredPhilosophers(filtered);
    setPage(1);
    setDisplayedPhilosophers(filtered.slice(0, ITEMS_PER_PAGE));
    setHasMore(filtered.length > ITEMS_PER_PAGE);
  }, [searchQuery, allPhilosophers]);

  // Load more philosophers when scrolling
  useEffect(() => {
    if (inView && hasMore && !loading) {
      const nextPage = page + 1;
      const startIndex = page * ITEMS_PER_PAGE;
      const endIndex = nextPage * ITEMS_PER_PAGE;
      const newPhilosophers = filteredPhilosophers.slice(startIndex, endIndex);

      if (newPhilosophers.length > 0) {
        setDisplayedPhilosophers((prev) => [...prev, ...newPhilosophers]);
        setPage(nextPage);
        setHasMore(endIndex < filteredPhilosophers.length);
      } else {
        setHasMore(false);
      }
    }
  }, [inView, hasMore, page, filteredPhilosophers, loading]);

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-4">
            Discover Philosophers
          </h1>
          <p className="text-lg text-muted max-w-2xl">
            Browse philosophy writers sharing their insights on Substack
          </p>
        </div>

        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted">Loading philosophers...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-accent hover:text-accent-dark"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-4">
          Discover Philosophy and Theory Substackers
        </h1>
        <p className="text-lg text-muted max-w-2xl">
          Browse writers sharing insights on philosophy, critical theory, and social thought
        </p>
      </div>

      {/* Search */}
      <div className="mb-12">
        <input
          type="text"
          placeholder="Search by author, publication, or keyword"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-xl px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
        />
      </div>

      {/* Results count */}
      <div className="mb-6 text-sm text-muted">
        {filteredPhilosophers.length} {filteredPhilosophers.length === 1 ? 'writer' : 'writers'} found
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {displayedPhilosophers.map((philosopher) => (
          <PhilosopherCard key={philosopher.id} philosopher={philosopher} searchQuery={searchQuery} />
        ))}
      </div>

      {/* Loading indicator and infinite scroll trigger */}
      {hasMore && (
        <div ref={ref} className="flex justify-center py-8">
          <div className="animate-pulse text-muted text-sm">
            Loading more...
          </div>
        </div>
      )}

      {/* No results */}
      {!loading && filteredPhilosophers.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted">
            No writers found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}
