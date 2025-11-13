'use client';

import { useState, useEffect } from 'react';

interface Note {
  note_id: number;
  text: string;
  author: {
    name: string;
    handle: string;
    photo_url: string;
    publication_name?: string;
    publication_logo?: string;
  };
  date: string;
  reactions: number;
  restacks: number;
  comments: number;
  attachments: any[];
  substack_url: string;
  note_url: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [totalNotes, setTotalNotes] = useState(0);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    async function loadNotes() {
      try {
        setLoading(true);
        const searchParam = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : '';
        const response = await fetch(`/api/notes?limit=100${searchParam}`);

        if (!response.ok) {
          throw new Error('Failed to fetch notes');
        }

        const data = await response.json();
        setNotes(data.notes || []);
        setTotalNotes(data.total);
        setError(null);
      } catch (err) {
        console.error('Error loading notes:', err);
        setError('Failed to load notes. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadNotes();
  }, [debouncedSearch]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const highlightText = (text: string, query: string) => {
    if (!query || !query.trim()) return text;

    // Escape special regex characters in the search query
    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedQuery = escapeRegex(query.trim());

    // Create regex with word boundary support and case-insensitive matching
    const regex = new RegExp(`(${escapedQuery})`, 'gi');

    // Split text by the regex and wrap matches
    const parts = text.split(regex);

    return parts.map((part) => {
      if (regex.test(part)) {
        return `<mark class="bg-yellow-200 font-medium">${part}</mark>`;
      }
      return part;
    }).join('');
  };

  const normalizeText = (text: string) => {
    // Replace multiple consecutive newlines with a single newline
    return text.replace(/\n\s*\n+/g, '\n');
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-4">
            Aggregated Notes Feed
          </h1>
          <p className="text-lg text-muted max-w-2xl">
            Latest notes and short-form content from philosophers
          </p>
        </div>

        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted">Loading notes from the community...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-4">
          Aggregated Notes Feed
        </h1>
        <p className="text-lg text-muted max-w-2xl">
          Latest notes and short-form content from philosophers
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

      {/* Notes count */}
      <div className="mb-6 text-sm text-muted">
        {notes.length} notes {totalNotes > notes.length && `of ${totalNotes} total`}
        {searchQuery && ` matching "${searchQuery}"`}
      </div>

      {/* Notes Feed */}
      <div className="space-y-3">
        {notes.map((note) => (
          <div
            key={note.note_id}
            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all bg-white"
          >
            {/* Author Header */}
            <div className="flex items-start gap-2 mb-2">
              <img
                src={note.author.photo_url}
                alt={note.author.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={note.note_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:text-accent-dark transition-colors"
                  >
                    {note.author.name}
                  </a>
                  <span className="text-muted text-sm">@{note.author.handle}</span>
                  <span className="text-muted text-sm">·</span>
                  <span className="text-muted text-sm">{formatDate(note.date)}</span>
                </div>
                {note.author.publication_name && (
                  <div className="text-xs text-muted mt-1">
                    {note.author.publication_name}
                  </div>
                )}
              </div>
            </div>

            {/* Note Content */}
            <a
              href={note.note_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block prose prose-sm max-w-none mb-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <p
                className="whitespace-pre-line text-gray-800 text-base"
                style={{ lineHeight: '1.4' }}
                dangerouslySetInnerHTML={{ __html: highlightText(normalizeText(note.text), searchQuery) }}
              />
            </a>

            {/* Attachments */}
            {note.attachments && note.attachments.length > 0 && (
              <div className="mb-3">
                {note.attachments.map((attachment: any, idx: number) => {
                  if (attachment.type === 'link' && attachment.linkMetadata) {
                    return (
                      <a
                        key={idx}
                        href={attachment.linkMetadata.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block border border-gray-200 rounded-lg overflow-hidden hover:border-accent transition-colors"
                      >
                        {attachment.linkMetadata.image && (
                          <img
                            src={attachment.linkMetadata.image}
                            alt={attachment.linkMetadata.title}
                            className="w-full aspect-video object-cover"
                          />
                        )}
                        <div className="p-3">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {attachment.linkMetadata.title}
                          </div>
                          <div className="text-xs text-muted">
                            {attachment.linkMetadata.host}
                          </div>
                        </div>
                      </a>
                    );
                  }
                  if (attachment.type === 'post' && attachment.post) {
                    return (
                      <a
                        key={idx}
                        href={`https://${attachment.publication?.subdomain}.substack.com/p/${attachment.post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block border border-gray-200 rounded-lg overflow-hidden hover:border-accent transition-colors"
                      >
                        {attachment.post.cover_image && (
                          <img
                            src={attachment.post.cover_image}
                            alt={attachment.post.title}
                            className="w-full aspect-video object-cover"
                          />
                        )}
                        <div className="p-3">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {attachment.post.title}
                          </div>
                          {attachment.post.subtitle && (
                            <div className="text-xs text-muted">
                              {attachment.post.subtitle}
                            </div>
                          )}
                        </div>
                      </a>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {notes.length === 0 && !loading && (
        <div className="text-center py-16">
          <p className="text-muted">
            No notes available at the moment. Check back later for updates.
          </p>
        </div>
      )}
    </div>
  );
}
