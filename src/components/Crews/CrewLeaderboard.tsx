'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CrewLeaderboardEntry as CrewLeaderboardEntryType } from '@/utils/api';
import { RobloxUser } from '@/types';
import { fetchMissingRobloxData } from '@/app/inventories/actions';

interface CrewLeaderboardProps {
  leaderboard: CrewLeaderboardEntryType[];
}

export default function CrewLeaderboard({ leaderboard }: CrewLeaderboardProps) {
  const [robloxUsers, setRobloxUsers] = useState<Record<string, RobloxUser>>({});
  const [robloxAvatars, setRobloxAvatars] = useState<Record<string, string>>({});
  const [visibleCrews, setVisibleCrews] = useState<CrewLeaderboardEntryType[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const CREWS_PER_BATCH = 20; // Load 20 crews at a time

  // Progressive loading of missing user data
  const fetchMissingUserData = useCallback(async (userIds: string[]) => {
    const missingIds = userIds.filter(id => !robloxUsers[id]);
    
    if (missingIds.length === 0) return;
    
    try {
      const result = await fetchMissingRobloxData(missingIds);
      
      // Update state with new user data
      if (result.userData && typeof result.userData === 'object') {
        setRobloxUsers(prev => ({ ...prev, ...result.userData }));
      }
      
      // Update state with new avatar data
      if (result.avatarData && typeof result.avatarData === 'object') {
        setRobloxAvatars(prev => ({ ...prev, ...result.avatarData }));
      }
    } catch (error) {
      console.error('Failed to fetch missing user data:', error);
    }
  }, [robloxUsers]);

  // Load initial batch of crews
  useEffect(() => {
    const initialBatch = leaderboard.slice(0, CREWS_PER_BATCH);
    setVisibleCrews(initialBatch);
  }, [leaderboard]);

  // Progressive loading for visible crews
  useEffect(() => {
    if (visibleCrews.length === 0) return;

    const userIdsToLoad = visibleCrews.map(crew => crew.OwnerUserId.toString());
    
    // Fetch user data for crew owners
    fetchMissingUserData(userIdsToLoad);
  }, [visibleCrews, fetchMissingUserData]);

  // Load more crews
  const loadMoreCrews = useCallback(() => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    // Simulate loading delay
    setTimeout(() => {
      const currentCount = visibleCrews.length;
      const nextBatch = leaderboard.slice(currentCount, currentCount + CREWS_PER_BATCH);
      
      if (nextBatch.length > 0) {
        setVisibleCrews(prev => [...prev, ...nextBatch]);
      }
      
      setIsLoadingMore(false);
    }, 300);
  }, [visibleCrews.length, leaderboard, isLoadingMore]);

  // Helper function to get user display name
  const getUserDisplay = (userId: string) => {
    const user = robloxUsers[userId];
    return user?.displayName || user?.name || `User ${userId}`;
  };

  // Helper function to get username
  const getUsername = (userId: string) => {
    const user = robloxUsers[userId];
    return user?.name || userId;
  };

  // Helper function to get user avatar
  const getUserAvatar = (userId: string) => {
    return robloxAvatars[userId] || null;
  };

  // Helper function to format rating
  const formatRating = (rating: number) => {
    return Math.round(rating).toLocaleString();
  };



  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 text-gray-300">Crew Leaderboard</h2>
        <div className="bg-[#212A31] rounded-lg p-4 shadow-sm border border-[#2E3944]">
          <p className="text-gray-400 text-center py-8">No crew data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4 text-gray-300">Crew Leaderboard ({leaderboard.length})</h2>
      <div className="bg-[#212A31] rounded-lg p-4 shadow-sm border border-[#2E3944]">
        <div className="max-h-[48rem] overflow-y-auto space-y-3 pr-2">
          {visibleCrews.map((crew, index) => (
            <CrewLeaderboardEntry 
              key={crew.ClanId} 
              crew={crew} 
              index={index}
              getUserDisplay={getUserDisplay}
              getUsername={getUsername}
              getUserAvatar={getUserAvatar}
              formatRating={formatRating}
            />
          ))}
          
          {visibleCrews.length < leaderboard.length && (
            <div className="text-center py-4">
              <button
                onClick={loadMoreCrews}
                disabled={isLoadingMore}
                className="px-6 py-2 bg-[#5865F2] hover:bg-[#4752C4] disabled:bg-[#37424D] disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {isLoadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CrewLeaderboardEntryProps {
  crew: CrewLeaderboardEntryType;
  index: number;
  getUserDisplay: (userId: string) => string;
  getUsername: (userId: string) => string;
  getUserAvatar: (userId: string) => string | null;
  formatRating: (rating: number) => string;
}

function CrewLeaderboardEntry({ 
  crew, 
  index, 
  getUserDisplay, 
  getUsername, 
  getUserAvatar, 
  formatRating
}: CrewLeaderboardEntryProps) {
  const ownerId = crew.OwnerUserId.toString();
  const displayName = getUserDisplay(ownerId);
  const username = getUsername(ownerId);
  const avatarUrl = getUserAvatar(ownerId);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-6 rounded-lg bg-[#2E3944] border border-[#37424D] hover:bg-[#37424D] transition-colors">
      {/* Rank Badge */}
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5865F2] text-white font-bold text-sm">
        {index + 1}
      </div>

      {/* Crew Flag with Owner Avatar */}
      <div className="relative w-32 h-20 rounded overflow-hidden">
        <Image
          src="/assets/images/Flag_white_bg.webp"
          alt="Crew flag"
          width={128}
          height={80}
          className="w-full h-full object-cover"
        />
        {avatarUrl && (
          <div className="absolute inset-0 flex items-center justify-start pl-2">
            <Image
              src={avatarUrl}
              alt={`${displayName}'s avatar`}
              width={56}
              height={56}
              className="rounded-full"
            />
          </div>
        )}
      </div>

      {/* Crew Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-semibold text-white truncate">
            {username}&apos;s {crew.ClanName}
          </h3>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-lg font-semibold text-white">{formatRating(crew.Rating)}</div>
          <div className="text-xs text-gray-400">Rating</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-white">{crew.BattlesPlayed}</div>
          <div className="text-xs text-gray-400">Battles</div>
        </div>
        <Link
          href={`/crews/${index + 1}`}
          className="px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg transition-colors text-sm font-medium inline-block"
        >
          View Crew
        </Link>
      </div>
    </div>
  );
}
