'use client';

import { SearchInput } from '@/components/SearchInput';
import { PhilosophersSidebar } from '@/components/PhilosophersSidebar';
import { PostsList } from '@/components/PostsList';
import { Footer } from '@/components/Footer';
import { usePosts } from '@/hooks/usePosts';

export default function Home() {
  const { posts, loading, error, hasMore, search, handleSearch, loadMore } = usePosts();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Substack Philosophers&apos; Alliance
            </h1>
            <SearchInput onSearch={handleSearch} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        {/* Mobile: Philosophers at top, Desktop: Sidebar */}
        <div className="flex flex-col lg:flex-row">
          <div className="lg:hidden">
            <PhilosophersSidebar />
          </div>
          <div className="hidden lg:block">
            <PhilosophersSidebar />
          </div>
          <PostsList
            posts={posts}
            loading={loading}
            error={error}
            hasMore={hasMore}
            onLoadMore={loadMore}
            search={search}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
