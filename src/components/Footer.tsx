export function Footer() {
  return (
    <footer className="mt-12 py-6 text-xs text-gray-500 text-center border-t border-gray-200">
      <p>
        Default image: Photo by{' '}
        <a 
          href="https://unsplash.com/@pucelano?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
          className="hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Fernando Santander
        </a>{' '}
        on{' '}
        <a 
          href="https://unsplash.com/photos/a-statue-of-a-man-sitting-in-front-of-a-building-yjWjLmv13FI?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
          className="hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Unsplash
        </a>
      </p>
    </footer>
  );
}
