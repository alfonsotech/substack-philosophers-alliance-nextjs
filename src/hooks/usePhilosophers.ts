import { useState, useEffect } from 'react';
import { Philosopher } from '@/types';

export function usePhilosophers() {
  const [philosophers, setPhilosophers] = useState<Philosopher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPhilosophers() {
      try {
        const response = await fetch('/api/philosophers');
        if (!response.ok) {
          throw new Error('Failed to fetch philosophers');
        }
        const data = await response.json();
        setPhilosophers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchPhilosophers();
  }, []);

  return { philosophers, loading, error };
}
