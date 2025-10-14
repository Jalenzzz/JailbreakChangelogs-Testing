'use client';

import React from 'react';
import Breadcrumb from '@/components/Layout/Breadcrumb';
import ServerHeader from '@/components/Servers/ServerHeader';
import ServerList from '@/components/Servers/ServerList';
import { ArrowUpIcon } from '@heroicons/react/24/outline';

type SortOption = 'date_added_asc' | 'date_added_desc' | 'date_expires_asc' | 'date_expires_desc';

export default function ServersPage() {
  const [showBackToTop, setShowBackToTop] = React.useState(false);
  const [sortOption, setSortOption] = React.useState<SortOption>('date_added_desc');

  React.useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <main className="text-primary-text min-h-screen">
      <div className="container mx-auto mb-8">
        <Breadcrumb />
        <ServerHeader />
        <ServerList sortOption={sortOption} onSortChange={setSortOption} />
      </div>

      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="bg-button-info text-form-button-text hover:bg-button-info-hover fixed right-8 bottom-8 z-[2000] rounded-full p-3 shadow-lg focus:outline-none"
          aria-label="Back to top"
        >
          <ArrowUpIcon className="h-6 w-6" />
        </button>
      )}
    </main>
  );
}
