import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
      <div className="text-center space-y-8">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
          Philosophy and Theory Substacks
        </h1>

        <p className="text-xl sm:text-2xl text-muted max-w-2xl mx-auto leading-relaxed font-light">
          Discover and connect with writers exploring philosophy, critical theory,
          social thought, and ideas that shape our world.
        </p>

        <div className="pt-8">
          <Link
            href="/discover"
            className="inline-block bg-accent hover:bg-accent-dark text-foreground font-medium px-8 py-4 rounded-full transition-colors"
          >
            Explore the Directory
          </Link>
        </div>

        <div className="pt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 text-left">
          <div>
            <h3 className="font-semibold mb-2">Discover</h3>
            <p className="text-sm text-muted leading-relaxed">
              Browse profiles of writers and thinkers, explore their publications,
              and find voices that resonate with your interests.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Connect</h3>
            <p className="text-sm text-muted leading-relaxed">
              Follow their Substacks, read their latest posts, and engage with
              thoughtful writing on contemporary issues and timeless ideas.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Learn</h3>
            <p className="text-sm text-muted leading-relaxed">
              Access aggregated content from the entire directory in one feed,
              bringing diverse perspectives and ideas together.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
