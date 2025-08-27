'use client';

import Image from 'next/image';
import { RobloxUser } from '@/types';

interface InventoryItem {
  tradePopularMetric: number | null;
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
  history?: Array<{
    UserId: number;
    TradeTime: number;
  }>;
}

interface InventoryData {
  user_id: string;
  data: InventoryItem[];
  item_count: number;
  level: number;
  money: number;
  xp: number;
  gamepasses: string[];
  has_season_pass: boolean;
  job_id: string;
  bot_id: string;
  scan_count: number;
  created_at: number;
  updated_at: number;
}

interface UserStatsProps {
  initialData: InventoryData;
  robloxUsers: Record<string, RobloxUser>;
  robloxAvatars: Record<string, string>;
}

// Gamepass data
const gamepassData = {
  PremiumGarage: { image: 'PremiumGarage', link: 'https://www.roblox.com/games/606849621/Jailbreak?assetId=1' },
  Stereo: { image: 'Stereo', link: 'https://www.roblox.com/games/606849621/Jailbreak?assetId=2' },
  BOSS: { image: 'BOSS', link: 'https://www.roblox.com/games/606849621/Jailbreak?assetId=3' },
  VIP: { image: 'VIP', link: 'https://www.roblox.com/games/606849621/Jailbreak?assetId=4' },
  TradingVIP: { image: 'TradingVIP', link: 'https://www.roblox.com/games/606849621/Jailbreak?assetId=5' },
  DuffelBag: { image: 'DuffelBag', link: 'https://www.roblox.com/games/606849621/Jailbreak?assetId=6' },
  SWAT: { image: 'SWAT', link: 'https://www.roblox.com/games/606849621/Jailbreak?assetId=7' },
  Walmart: { image: 'Walmart', link: 'https://www.roblox.com/games/606849621/Jailbreak?assetId=8' }
};

// Helper functions
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const formatMoney = (money: number) => {
  return `$${money.toLocaleString()}`;
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const getLevelColor = (level: number) => {
  if (level >= 50) return 'text-[#ff6b6b]';
  if (level >= 25) return 'text-[#ffa726]';
  if (level >= 10) return 'text-[#4ade80]';
  return 'text-white';
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.src = '/assets/images/placeholder.png';
};

export default function UserStats({ initialData, robloxUsers, robloxAvatars }: UserStatsProps) {
  // Helper function to get user display name
  const getUserDisplay = (userId: string) => {
    const user = robloxUsers[userId];
    return user?.displayName || user?.name || userId;
  };

  // Helper function to get user avatar
  const getUserAvatar = (userId: string) => {
    const avatar = robloxAvatars[userId];
    return avatar && typeof avatar === 'string' && avatar.trim() !== '' ? avatar : null;
  };

  return (
    <div className="bg-[#212A31] rounded-lg border border-[#2E3944] p-6">
      <h2 className="text-xl font-semibold mb-4 text-muted">User Information</h2>
      
      {/* Roblox User Profile */}
      {initialData?.user_id && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 p-4 bg-[#2E3944] rounded-lg border border-[#37424D]">
          {getUserAvatar(initialData.user_id) ? (
            <Image
              src={getUserAvatar(initialData.user_id)!}
              alt="Roblox Avatar"
              width={64}
              height={64}
              className="rounded-full bg-[#212A31] flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 bg-[#37424D] rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-muted break-words">
              {getUserDisplay(initialData.user_id)}
            </h3>
            <p className="text-sm text-muted opacity-75 break-words">
              @{getUserDisplay(initialData.user_id)}
            </p>
            <a
              href={`https://www.roblox.com/users/${initialData.user_id}/profile`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-400 text-sm mt-1 transition-colors"
            >
              View Roblox Profile
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
        <div className="text-center">
          <div className="text-sm text-muted">Total Items</div>
          <div className="text-2xl font-bold text-white">{formatNumber(initialData.item_count)}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-muted">Original Items</div>
          <div className="text-2xl font-bold text-[#4ade80]">{formatNumber(initialData.data.filter(item => item.isOriginalOwner).length)}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-muted">Non-Original</div>
          <div className="text-2xl font-bold text-[#ff6b6b]">{formatNumber(initialData.data.filter(item => !item.isOriginalOwner).length)}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-muted">Level</div>
          <div className={`text-2xl font-bold ${getLevelColor(initialData.level)}`}>{initialData.level}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-muted">XP</div>
          <div className="text-2xl font-bold text-white">{formatNumber(initialData.xp)}</div>
        </div>
        <div className="text-center hidden lg:block">
          <div className="text-sm text-muted">Money</div>
          <div className="text-2xl font-bold text-[#4ade80]">{formatMoney(initialData.money)}</div>
        </div>
      </div>
      
      {/* Money gets its own row for mobile and tablet */}
      <div className="mt-4 text-center lg:hidden">
        <div className="text-sm text-muted">Money</div>
        <div className="text-2xl font-bold text-[#4ade80]">{formatMoney(initialData.money)}</div>
      </div>
      
      {/* Gamepasses */}
      {initialData.gamepasses.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2 text-muted">Gamepasses</h3>
          <div className="flex flex-wrap gap-3">
            {[...new Set(initialData.gamepasses)].map((gamepass) => {
              const gamepassInfo = gamepassData[gamepass as keyof typeof gamepassData];
              if (!gamepassInfo) return null;
              
              const GamepassContent = () => (
                <div className="flex items-center gap-2 px-3 py-2 bg-[#2B2F4C] border border-[#5865F2] text-muted rounded-lg text-sm hover:bg-[#32365A] transition-colors">
                  <div className="w-6 h-6 relative">
                    <Image
                      src={`/assets/images/gamepasses/${gamepassInfo.image}.webp`}
                      alt={gamepass}
                      width={24}
                      height={24}
                      className="object-contain"
                      onError={handleImageError}
                    />
                  </div>
                  <span>{gamepass}</span>
                </div>
              );
              
              return gamepassInfo.link ? (
                <a
                  key={gamepass}
                  href={gamepassInfo.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <GamepassContent />
                </a>
              ) : (
                <div key={gamepass}>
                  <GamepassContent />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="mt-4 text-sm text-muted space-y-1">
        <p>Scan Count: {initialData.scan_count}</p>
        <p>Created: {formatDate(initialData.created_at)}</p>
        <p>Last Updated: {formatDate(initialData.updated_at)}</p>
      </div>
    </div>
  );
}
