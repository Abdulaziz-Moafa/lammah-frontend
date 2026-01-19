'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function JoinWithCodePage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;

  useEffect(() => {
    // Redirect to join page with code
    router.replace(`/join?code=${code}`);
  }, [code, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">Joining match...</p>
      </div>
    </div>
  );
}
