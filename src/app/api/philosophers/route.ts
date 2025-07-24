import { NextResponse } from 'next/server';
import { philosophers } from '@/data/philosophers';

export async function GET() {
  try {
    // Sort philosophers alphabetically by name
    const sortedPhilosophers = [...philosophers].sort((a, b) => 
      a.name.localeCompare(b.name)
    );
    
    return NextResponse.json(sortedPhilosophers);
  } catch (error) {
    console.error('Error fetching philosophers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch philosophers' },
      { status: 500 }
    );
  }
}
