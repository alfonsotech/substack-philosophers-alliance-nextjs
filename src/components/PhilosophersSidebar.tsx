'use client';

import { usePhilosophers } from '@/hooks/usePhilosophers';
import { Philosopher } from '@/types';

export function PhilosophersSidebar() {
  const { philosophers, loading, error } = usePhilosophers();

  if (loading) {
    return (
      <aside className="w-64 bg-gray-50 p-6 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Philosophers</h2>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="w-64 bg-gray-50 p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Philosophers</h2>
        <div className="text-red-600 text-sm">{error}</div>
      </aside>
    );
  }

  return (
    <aside className="w-full lg:w-72 bg-gray-50 p-4 lg:p-6 overflow-y-auto lg:max-h-screen">
      <h2 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4 text-gray-800">Philosophers</h2>
      <ul className="flex flex-wrap gap-2 lg:flex-col lg:space-y-2 lg:gap-0">
        {philosophers.map((philosopher) => (
          <PhilosopherItem key={philosopher.id} philosopher={philosopher} />
        ))}
      </ul>
    </aside>
  );
}

function PhilosopherItem({ philosopher }: { philosopher: Philosopher }) {
  const initial = philosopher.name.charAt(0).toUpperCase();
  
  // Convert publication URL to profile URL
  // From: https://philosophypublics.substack.com/
  // To: https://substack.com/@philosophypublics
  const getProfileUrl = (substackUrl: string) => {
    try {
      const url = new URL(substackUrl);
      const subdomain = url.hostname.split('.')[0];
      return `https://substack.com/@${subdomain}`;
    } catch {
      return substackUrl; // Fallback to original URL if parsing fails
    }
  };

  const profileUrl = getProfileUrl(philosopher.substackUrl);

  return (
    <li className="philosopher-item">
      {/* Mobile: Compact pill, Desktop: Full item */}
      <div className="lg:hidden">
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 bg-white px-3 py-2 rounded-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm whitespace-nowrap"
        >
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              src={`/api/philosophers/${philosopher.id}/logo`}
              alt={philosopher.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const parent = target.parentElement!;
                parent.innerHTML = `
                  <svg width="24" height="24" viewBox="0 0 24 24" class="text-gray-500">
                    <rect width="24" height="24" fill="currentColor" />
                    <text x="12" y="15" font-size="10" text-anchor="middle" fill="white">${initial}</text>
                  </svg>
                `;
              }}
            />
          </div>
          <span className="font-medium text-gray-700">{philosopher.name}</span>
        </a>
      </div>

      {/* Desktop: Full item */}
      <div className="hidden lg:flex items-center space-x-3 p-2 rounded hover:bg-gray-100 transition-colors">
        <div className="philosopher-logo-container flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            <img
              src={`/api/philosophers/${philosopher.id}/logo`}
              alt={philosopher.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const parent = target.parentElement!;
                parent.innerHTML = `
                  <svg width="32" height="32" viewBox="0 0 32 32" class="text-gray-500">
                    <rect width="32" height="32" fill="currentColor" />
                    <text x="16" y="20" font-size="12" text-anchor="middle" fill="white">${initial}</text>
                  </svg>
                `;
              }}
            />
          </div>
        </div>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-700 hover:text-blue-600 transition-colors flex-1 min-w-0"
        >
          <div className="font-medium truncate">{philosopher.name}</div>
          <div className="text-xs text-gray-500">{philosopher.publicationName}</div>
        </a>
      </div>
    </li>
  );
}
