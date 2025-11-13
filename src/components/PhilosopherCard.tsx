import Image from 'next/image';
import { Philosopher } from '@/types';

interface PhilosopherCardProps {
  philosopher: Philosopher;
  searchQuery?: string;
}

const highlightText = (text: string, query?: string) => {
  if (!query || !query.trim()) return text;

  // Escape special regex characters in the search query
  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedQuery = escapeRegex(query.trim());

  // Create regex with case-insensitive matching
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

export default function PhilosopherCard({ philosopher, searchQuery }: PhilosopherCardProps) {
  return (
    <div className="group border border-gray-100 rounded-lg p-6 hover:border-gray-200 transition-colors flex flex-col h-full">
      <a
        href={philosopher.substackUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col h-full"
      >
        {/* Profile Photo and Name */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
            {philosopher.profile_photo_url ? (
              <Image
                src={philosopher.profile_photo_url}
                alt={philosopher.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-semibold text-gray-400">
                {philosopher.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-lg group-hover:text-accent-dark transition-colors"
              dangerouslySetInnerHTML={{ __html: highlightText(philosopher.name, searchQuery) }}
            />
            <p className="text-xs text-muted mt-0.5">
              {philosopher.publicationName}
            </p>
          </div>
        </div>

        {/* Bio - flexible space */}
        {philosopher.bio && (
          <p
            className="text-sm text-muted line-clamp-3 mb-4 flex-grow"
            style={{ lineHeight: '1.4' }}
            dangerouslySetInnerHTML={{ __html: highlightText(philosopher.bio, searchQuery) }}
          />
        )}

        {/* Recent Posts - pinned to bottom */}
        {philosopher.recent_posts && philosopher.recent_posts.length > 0 && (
          <div className="mt-auto space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {philosopher.recent_posts.slice(0, 3).map((post, index) => (
                <div
                  key={index}
                  className="relative aspect-[4/3] overflow-hidden rounded-md bg-gray-100 group/post"
                >
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover/post:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 33vw, 200px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                  {/* Post Title Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-2">
                    <p className="text-white text-xs font-medium line-clamp-2 leading-tight">
                      {post.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* View Profile CTA */}
            <div className="text-sm font-medium text-muted group-hover:text-foreground transition-colors flex items-center gap-1">
              Visit Substack
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        )}

        {/* If no recent posts, still show the CTA */}
        {(!philosopher.recent_posts || philosopher.recent_posts.length === 0) && (
          <div className="mt-auto text-sm font-medium text-muted group-hover:text-foreground transition-colors flex items-center gap-1">
            Visit Substack
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        )}
      </a>
    </div>
  );
}
