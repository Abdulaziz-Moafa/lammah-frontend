'use client';

import { useEffect } from 'react';
import { ToastContainer } from '@/components/ui';
import { useUIStore } from '@/store/ui';
import { LoadingOverlay } from '@/components/ui/Spinner';

export function Providers({ children }: { children: React.ReactNode }) {
  const { globalLoading, loadingMessage, setOnline } = useUIStore();

  useEffect(() => {
    // Handle online/offline status
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);

  return (
    <>
      {children}
      <ToastContainer />
      {globalLoading && <LoadingOverlay message={loadingMessage || undefined} />}
    </>
  );
}
