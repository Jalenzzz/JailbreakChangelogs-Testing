'use client';

import { useEffect, useState } from 'react';
import Maintenance from './Maintenance';
import Header from './Header';
import { canBypassMaintenance } from '@/utils/maintenance';
import { AuthProvider } from '@/contexts/AuthContext';

interface MaintenanceBypassProps {
  children: React.ReactNode;
}

export default function MaintenanceBypass({ children }: MaintenanceBypassProps) {
  const [canBypass, setCanBypass] = useState<boolean | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Check if user can bypass maintenance
    const bypassCheck = canBypassMaintenance();
    setCanBypass(bypassCheck);

    // Update document title based on bypass status
    if (bypassCheck) {
      // Reset to normal title for testers
      document.title = 'Latest Updates & Patch Notes | Changelogs';
    } else {
      // Keep maintenance title for non-testers
      document.title = 'Under Maintenance';
    }

    // Listen for auth changes to re-check bypass status
    const handleAuthChange = () => {
      const newBypassCheck = canBypassMaintenance();
      setCanBypass(newBypassCheck);

      // Update title when auth changes
      if (newBypassCheck) {
        document.title = 'Latest Updates & Patch Notes | Changelogs';
      } else {
        document.title = 'Under Maintenance';
      }
    };

    window.addEventListener('authStateChanged', handleAuthChange);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  // Show loading state while checking
  if (!isClient || canBypass === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#2e3944]">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  // If user can bypass maintenance, show normal content
  if (canBypass) {
    return <>{children}</>;
  }

  // Otherwise show maintenance page with header
  return (
    <div className="flex min-h-screen flex-col">
      <AuthProvider>
        <Header />
        <Maintenance />
      </AuthProvider>
    </div>
  );
}
