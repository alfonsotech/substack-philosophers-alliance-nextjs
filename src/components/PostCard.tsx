'use client';

import { Post } from '@/types';

interface PostCardProps {
  post: Post;
  searchQuery?: string;
}

export function PostCard({ post, searchQuery }: PostCardProps) {
  const initial = post.title.charAt(0).toUpperCase();

  // Construct author profile URL
  const getAuthorProfileUrl = () => {
    if (post.link && post.link.includes('substack.com')) {
      const match = post.link.match(/https:\/\/(.*?)\.substack\.com/);
      if (match && match[1]) {
        return `https://substack.com/@${match[1]}`;
      }
    }
    return null;
  };

  // Extract publication URL from the post link
  const getPublicationUrl = () => {
    if (post.link && post.link.includes('substack.com')) {
      const match = post.link.match(/(https:\/\/.*?\.substack\.com)/);
      if (match && match[1]) {
        return match[1];
      }
    }
    return post.link;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const authorProfileUrl = getAuthorProfileUrl();
  const publicationUrl = getPublicationUrl();

  return (
    <article className="post-card bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
      <div className="flex flex-col sm:flex-row">
        {/* Post Image - Top on mobile, Left on desktop */}
        <div className="post-image-container flex-shrink-0">
          <a href={post.link} target="_blank" rel="noopener noreferrer" className="block h-full">
            {post.coverImage ? (
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-48 sm:w-32 sm:h-full object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-t-none"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.outerHTML = `
                    <div class="w-full h-48 sm:w-32 sm:h-full bg-gray-200 flex items-center justify-center rounded-t-lg sm:rounded-l-lg sm:rounded-t-none">
                      <svg width="24" height="16" viewBox="0 0 24 16" class="text-gray-400">
                        <rect width="24" height="16" fill="currentColor" />
                        <text x="12" y="10" font-size="8" text-anchor="middle" fill="white">${initial}</text>
                      </svg>
                    </div>
                  `;
                }}
              />
            ) : (
              <img
                src="/thinker- fernando-santander-yjWjLmv13FI-unsplash.jpg"
                alt="Philosophy discussion"
                className="w-full h-48 sm:w-32 sm:h-full object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-t-none"
              />
            )}
          </a>
        </div>

        {/* Post Content - Bottom on mobile, Right on desktop */}
        <div className="post-content flex-1 p-4">
          <h2 className="post-title text-lg font-semibold mb-1 leading-tight">
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
            >
              {post.title}
            </a>
          </h2>

          {post.subtitle && (
            <p className="post-subtitle text-sm text-gray-600 mb-2 leading-relaxed line-clamp-2">
              {post.subtitle}
            </p>
          )}

          <div className="post-meta flex justify-between items-center text-xs text-gray-500">
            <span className="truncate">
              {authorProfileUrl ? (
                <a
                  href={authorProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="author-link text-gray-700 hover:text-blue-600 font-medium"
                >
                  {post.author}
                </a>
              ) : (
                <span className="text-gray-700 font-medium">{post.author}</span>
              )}
              {' · '}
              <a
                href={publicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="publication-link text-gray-600 hover:text-blue-600"
              >
                {post.publicationName}
              </a>
            </span>
            <span className="flex-shrink-0 ml-2">{formatDate(post.publishDate)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
