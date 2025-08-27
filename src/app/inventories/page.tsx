import InventoryCheckerClient from './InventoryCheckerClient';
import Breadcrumb from '@/components/Layout/Breadcrumb';
import { fetchItemCountStats, fetchUserScansLeaderboard, fetchRobloxUsersBatchLeaderboard, fetchRobloxAvatars, UserScan } from '@/utils/api';
import Image from 'next/image';
import CopyButton from './CopyButton';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

// Component for stats that loads immediately
async function StatsSection() {
  const stats = await fetchItemCountStats();
  
  if (!stats) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-[#212A31] rounded-lg p-4 shadow-sm border border-[#2E3944]">
        <div className="text-2xl font-bold text-blue-400">
          {stats.item_count_str}
        </div>
        <div className="text-sm text-gray-400">
          Items Tracked
        </div>
      </div>
      <div className="bg-[#212A31] rounded-lg p-4 shadow-sm border border-[#2E3944]">
        <div className="text-2xl font-bold text-green-400">
          {stats.user_count_str}
        </div>
        <div className="text-sm text-gray-400">
          Users Scanned
        </div>
      </div>
    </div>
  );
}

// Component for leaderboard section
async function LeaderboardSection() {
  const leaderboard = await fetchUserScansLeaderboard();
  
  if (!leaderboard || leaderboard.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4 text-gray-300">Most Scanned Players ({leaderboard.slice(5).length})</h2>
      <div className="bg-[#212A31] rounded-lg p-4 shadow-sm border border-[#2E3944]">
        <div className="max-h-[32rem] overflow-y-auto space-y-3 pr-2">
          {leaderboard.slice(5).map((user, index) => (
            <Suspense key={user.user_id} fallback={<BasicLeaderboardUser user={user} index={index} />}>
              <LeaderboardUser user={user} index={index} />
            </Suspense>
          ))}
        </div>
      </div>
    </div>
  );
}

// Component for individual user with their Roblox data
async function LeaderboardUser({ user, index }: { user: UserScan; index: number }) {
  let robloxUser: { displayName?: string; name?: string } | null = null;
  let avatarUrl: string | null = null;
  
  try {
    // Fetch individual user data
    const [userDataResult, avatarData] = await Promise.all([
      fetchRobloxUsersBatchLeaderboard([user.user_id]),
      fetchRobloxAvatars([user.user_id])
    ]);

    // Process user data
    if (userDataResult && typeof userDataResult === 'object') {
      const userData = Object.values(userDataResult)[0] as { id: number; name: string; displayName: string; hasVerifiedBadge: boolean };
      if (userData && userData.id) {
        robloxUser = userData;
      }
    }

    // Process avatar data
    if (avatarData && typeof avatarData === 'object') {
      const avatar = Object.values(avatarData)[0] as { targetId: number; state: string; imageUrl?: string; version: string };
      if (avatar && avatar.targetId && avatar.state === 'Completed' && avatar.imageUrl) {
        avatarUrl = avatar.imageUrl;
      }
    }
  } catch (error) {
    console.error(`Failed to fetch Roblox data for user ${user.user_id}:`, error);
  }

  const displayName = robloxUser?.displayName || robloxUser?.name || `User ${user.user_id}`;
  const username = robloxUser?.name || user.user_id;
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg bg-[#2E3944] border border-[#37424D]">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          index === 0 ? 'bg-yellow-500 text-black' :
          index === 1 ? 'bg-gray-400 text-black' :
          index === 2 ? 'bg-amber-600 text-white' :
          'bg-[#37424D] text-gray-300'
        }`}>
          {index + 1}
        </div>
        
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#37424D] flex-shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={`${displayName}'s avatar`}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-6 h-6 bg-[#5865F2] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-blue-400 font-medium break-words">
              {displayName}
            </div>
            <div className="text-sm text-gray-400 break-words">@{username} • {user.upsert_count.toLocaleString()} scans</div>
            <a
              href={`https://www.roblox.com/users/${user.user_id}/profile`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-400 text-xs mt-1 transition-colors"
            >
              View Roblox Profile
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          <CopyButton text={user.user_id} className="flex-shrink-0 mt-1" />
        </div>
      </div>
    </div>
  );
}

// Component for basic user (fallback)
function BasicLeaderboardUser({ user, index }: { user: UserScan; index: number }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg bg-[#2E3944] border border-[#37424D]">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          index === 0 ? 'bg-yellow-500 text-black' :
          index === 1 ? 'bg-gray-400 text-black' :
          index === 2 ? 'bg-amber-600 text-white' :
          'bg-[#37424D] text-gray-300'
        }`}>
          {index + 1}
        </div>
        
        {/* Placeholder Avatar */}
        <div className="w-10 h-10 rounded-full bg-[#37424D] flex-shrink-0 flex items-center justify-center">
          <div className="w-6 h-6 bg-[#5865F2] rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">?</span>
          </div>
        </div>
      </div>
      
             <div className="flex-1 min-w-0">
         <div className="flex items-start gap-2">
           <div className="flex-1 min-w-0">
             <div className="text-blue-400 font-medium">User {user.user_id}</div>
             <div className="text-sm text-gray-400">@{user.user_id} • {user.upsert_count.toLocaleString()} scans</div>
           </div>
           <CopyButton text={user.user_id} className="flex-shrink-0 mt-1" />
         </div>
       </div>
    </div>
  );
}

export default function InventoryCheckerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb />
      <h1 className="text-3xl font-bold mb-6">Inventory Checker</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Enter a Roblox ID or username to check their Jailbreak inventory.
      </p>
      
      {/* Stats load immediately */}
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#212A31] rounded-lg p-4 shadow-sm border border-[#2E3944] animate-pulse">
            <div className="h-8 bg-gray-600 rounded w-24 mb-2"></div>
            <div className="h-4 bg-gray-600 rounded w-32"></div>
          </div>
          <div className="bg-[#212A31] rounded-lg p-4 shadow-sm border border-[#2E3944] animate-pulse">
            <div className="h-8 bg-gray-600 rounded w-24 mb-2"></div>
            <div className="h-4 bg-gray-600 rounded w-32"></div>
          </div>
        </div>
      }>
        <StatsSection />
      </Suspense>
      
      <InventoryCheckerClient />
      
      {/* Leaderboard loads separately */}
      <Suspense fallback={
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 text-gray-300">Most Scanned Players</h2>
          <div className="bg-[#212A31] rounded-lg p-4 shadow-sm border border-[#2E3944]">
            <div className="space-y-3">
              {[...Array(10)].map((_, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg bg-[#2E3944] border border-[#37424D] animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                    <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="h-5 bg-gray-600 rounded w-32 mb-2"></div>
                        <div className="h-4 bg-gray-600 rounded w-24"></div>
                      </div>
                      <div className="w-6 h-6 bg-gray-600 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }>
        <LeaderboardSection />
      </Suspense>
    </div>
  );
}
