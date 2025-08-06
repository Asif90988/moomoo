'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard immediately
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-neural-dark flex items-center justify-center">
      <div className="text-white text-xl">Redirecting to dashboard...</div>
    </div>
  );
}
