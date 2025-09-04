'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RobloxUser } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { hasValidToken } from '@/utils/cookies';
import toast from 'react-hot-toast';
import OGFinderDataStreamer from './OGFinderDataStreamer';
import { MagnifyingGlassIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface OGSearchData {
  results: Array<{
    tradePopularMetric: number;
    level: number | null;
    timesTraded: number;
    id: string;
    categoryTitle: string;
    info: Array<{
      title: string;
      value: string;
    }>;
    uniqueCirculation: number;
    season: number | null;
    title: string;
    isOriginalOwner: boolean;
    user_id: string;
    logged_at: number;
    history: string | Array<{
      UserId: number;
      TradeTime: number;
    }>;
  }>;
  count: number;
}

interface OGFinderClientProps {
  initialData?: OGSearchData;
  robloxId?: string;
  originalSearchTerm?: string;
  robloxUsers?: Record<string, RobloxUser>;
  robloxAvatars?: Record<string, string>;
  error?: string;
  isLoading?: boolean;
}

export default function OGFinderClient({ 
  initialData, 
  robloxId, 
  originalSearchTerm, 
  robloxUsers: initialRobloxUsers, 
  robloxAvatars: initialRobloxAvatars, 
  error, 
  isLoading: externalIsLoading 
}: OGFinderClientProps) {
  const [searchId, setSearchId] = useState(robloxId || '');
  const [isLoading, setIsLoading] = useState(externalIsLoading || false);
  const [localRobloxUsers, setLocalRobloxUsers] = useState<Record<string, RobloxUser>>(initialRobloxUsers || {});
  const [localRobloxAvatars, setLocalRobloxAvatars] = useState<Record<string, string>>(initialRobloxAvatars || {});
  const router = useRouter();
  const { isAuthenticated, setShowLoginModal } = useAuth();

  // Update local state when props change
  useEffect(() => {
    setLocalRobloxUsers(initialRobloxUsers || {});
  }, [initialRobloxUsers]);

  useEffect(() => {
    setLocalRobloxAvatars(initialRobloxAvatars || {});
  }, [initialRobloxAvatars]);

  // Reset loading state when new data is received or when there's an error
  useEffect(() => {
    if (initialData || error) {
      setIsLoading(false);
    }
  }, [initialData, error, externalIsLoading]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    // Check if user is authenticated
    if (!isAuthenticated || !hasValidToken()) {
      toast.error('You need to be logged in to use the OG Finder feature.', {
        duration: 4000,
        position: 'bottom-right',
      });
      setShowLoginModal(true);
      return;
    }

    setIsLoading(true);
    router.push(`/og/${searchId.trim()}`);
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-[#212A31] rounded-lg p-6 shadow-sm border border-[#2E3944]">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="searchId" className="block text-sm font-medium text-muted mb-2">
              Roblox ID or Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-muted" />
              </div>
              <input
                type="text"
                id="searchId"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Roblox ID or username..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-[#2E3944] bg-[#37424D] text-muted placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !searchId.trim()}
            className="w-full px-4 py-3 bg-[#5865F2] text-white rounded-lg hover:bg-[#4752C4] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:ring-offset-2 focus:ring-offset-[#212A31] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Results */}
      {robloxId && (
        <OGFinderDataStreamer 
          robloxId={robloxId} 
          originalSearchTerm={originalSearchTerm}
          initialData={initialData}
          robloxUsers={localRobloxUsers}
          robloxAvatars={localRobloxAvatars}
          error={error}
          isLoading={isLoading}
        />
      )}

      {/* Error Display */}
      {error && !initialData && (
        <div className="bg-[#212A31] rounded-lg p-6 shadow-sm border border-[#2E3944]">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-500/10 rounded-full">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-red-400 mb-2">User Not Found</h3>
            <p className="text-gray-300">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
