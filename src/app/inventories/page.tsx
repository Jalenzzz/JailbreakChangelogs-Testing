import InventoryCheckerClient from './InventoryCheckerClient';
import Breadcrumb from '@/components/Layout/Breadcrumb';
import { fetchItemCountStats, fetchUserScansLeaderboard, fetchRobloxUsersBatchLeaderboard, fetchRobloxAvatars } from '@/utils/api';
import Image from 'next/image';
import CopyButton from './CopyButton';
import { RobloxUser } from '@/types';

export const dynamic = 'force-dynamic';

export default async function InventoryCheckerPage() {
  const [stats, leaderboard] = await Promise.all([
    fetchItemCountStats(),
    fetchUserScansLeaderboard()
  ]);

  // Fetch Roblox data for all remaining players (excluding first 5 bots)
  const topPlayers = leaderboard?.slice(5) || [];
  const playerIds = topPlayers.map(player => player.user_id);
  
  const robloxUsers: Record<string, RobloxUser> = {};
  const robloxAvatars: Record<string, string> = {};
  
  if (playerIds.length > 0) {
    try {
      const [userDataResult, avatarData] = await Promise.all([
        fetchRobloxUsersBatchLeaderboard(playerIds),
        fetchRobloxAvatars(playerIds)
      ]);

      // Process user data
      if (userDataResult && typeof userDataResult === 'object') {
        Object.values(userDataResult).forEach((userData) => {
          const user = userData as { id: number; name: string; displayName: string; username: string; hasVerifiedBadge: boolean };
          if (user && user.id) {
            robloxUsers[user.id.toString()] = {
              id: user.id,
              name: user.name,
              displayName: user.displayName,
              username: user.username
            };
          }
        });
      }

      // Process avatar data
      if (avatarData && typeof avatarData === 'object') {
        Object.values(avatarData).forEach((avatar) => {
          const avatarData = avatar as { targetId: number; state: string; imageUrl?: string; version: string };
          if (avatarData && avatarData.targetId && avatarData.state === 'Completed' && avatarData.imageUrl) {
            robloxAvatars[avatarData.targetId.toString()] = avatarData.imageUrl;
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch Roblox data for leaderboard:', error);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb />
      <h1 className="text-3xl font-bold mb-6">Inventory Checker</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Enter a Roblox ID or username to check their Jailbreak inventory.
      </p>
      
      {stats && (
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
      )}
      
      <InventoryCheckerClient />
      
      {leaderboard && leaderboard.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 text-gray-300">Most Scanned Players</h2>
          <div className="bg-[#212A31] rounded-lg p-4 shadow-sm border border-[#2E3944]">
            <div className="max-h-[32rem] overflow-y-auto space-y-3 pr-2">
              {leaderboard.slice(5).map((user, index) => {
                const robloxUser = robloxUsers[user.user_id];
                const avatarUrl = robloxAvatars[user.user_id];
                const displayName = robloxUser?.displayName || robloxUser?.name || `User ${user.user_id}`;
                const username = robloxUser?.name || user.user_id;
                
                return (
                  <div key={user.user_id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg bg-[#2E3944] border border-[#37424D]">
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
                          <a
                            href={`https://www.roblox.com/users/${user.user_id}/profile`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 font-medium hover:text-blue-300 transition-colors break-words"
                          >
                            {displayName}
                          </a>
                          <div className="text-sm text-gray-400 break-words">@{username} • {user.upsert_count.toLocaleString()} scans</div>
                        </div>
                        <CopyButton text={user.user_id} className="flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
