export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-8">
        About Philosophy and Humanities Alliance
      </h1>

      <div className="prose prose-lg max-w-none space-y-6">
        <p className="text-lg text-muted leading-relaxed">
          The Philosophy and Humanities Alliance is a curated directory of writers and thinkers
          exploring philosophy, critical theory, and social thought on Substack.
        </p>

        <p className="text-lg text-muted leading-relaxed">
          Our mission is to make thoughtful discourse more accessible and help readers
          discover diverse voices examining contemporary issues through theoretical lenses—from
          existentialism to political theory, ethics to social critique.
        </p>

        <h2 className="text-2xl font-semibold mt-12 mb-4">How It Works</h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Discover</h3>
            <p className="text-muted leading-relaxed">
              Browse through our directory of writers and thinkers, explore their publications,
              and find perspectives that challenge and inspire.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Read</h3>
            <p className="text-muted leading-relaxed">
              Access an aggregated feed of the latest posts from all featured writers
              in one convenient location.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Connect</h3>
            <p className="text-muted leading-relaxed">
              Follow your favorite writers on Substack and engage with thoughtful
              analysis of contemporary ideas and enduring questions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
