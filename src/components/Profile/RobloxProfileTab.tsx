'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RobloxIcon } from '@/components/Icons/RobloxIcon';
import { formatShortDate, formatCustomDate } from '@/utils/timestamp';
import TradeAdsTab from './TradeAdsTab';
import { CircularProgress, Skeleton } from '@mui/material';

import { Tooltip } from '@mui/material';

interface User {
  id: string;
  roblox_id?: string | null;
  roblox_username?: string;
  roblox_display_name?: string;
  roblox_avatar?: string;
  roblox_join_date?: number;
}

interface TradeItem {
  id: number;
  name: string;
  type: string;
  creator: string;
  is_seasonal: number;
  cash_value: string;
  duped_value: string;
  price: string;
  is_limited: number;
  duped_owners: string;
  notes: string;
  demand: string;
  description: string;
  health: number;
  tradable: number;
  last_updated: number;
}

interface TradeAd {
  id: number;
  requesting: TradeItem[];
  offering: TradeItem[];
  author: string;
  created_at: number;
  expires: number | null;
  expired: number;
  status: string;
}

interface RobloxProfileTabProps {
  user: User;
  tradeAds?: TradeAd[];
  isLoadingAdditionalData?: boolean;
}

export default function RobloxProfileTab({
  user,
  tradeAds = [],
  isLoadingAdditionalData = false,
}: RobloxProfileTabProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="space-y-6">
      {/* Roblox Profile Card */}
      <div className="rounded-lg border border-[#5865F2] p-4">
        <div className="mb-4 flex items-center gap-2">
          <RobloxIcon className="h-6 w-6 text-white" />
          <h2 className="text-muted text-lg font-semibold">Roblox Profile</h2>
        </div>

        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          {/* Roblox Avatar */}
          <div className="relative h-32 w-32 overflow-hidden rounded-lg border-2 border-[#5865F2]">
            {!imageError && user.roblox_avatar ? (
              <>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CircularProgress size={32} sx={{ color: '#5865F2' }} />
                  </div>
                )}
                <div className="absolute inset-0">
                  <Image
                    src={user.roblox_avatar}
                    alt={`${user.roblox_display_name || user.roblox_username || 'Roblox'} user's profile picture`}
                    fill
                    draggable={false}
                    className="object-cover"
                    onError={() => setImageError(true)}
                    onLoad={() => setIsLoading(false)}
                  />
                </div>
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <RobloxIcon className="h-12 w-12 text-white" />
              </div>
            )}
          </div>

          {/* Roblox Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="space-y-2">
              <div>
                {isLoadingAdditionalData ? (
                  <>
                    <Skeleton variant="text" width="60%" height={28} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </>
                ) : (
                  <>
                    <h3 className="text-muted text-xl font-semibold">
                      {user.roblox_display_name || user.roblox_username}
                    </h3>
                    <p className="text-[#FFFFFF]">@{user.roblox_username}</p>
                  </>
                )}
              </div>

              <div className="text-sm text-[#FFFFFF]">
                {isLoadingAdditionalData ? (
                  <Skeleton variant="text" width="50%" height={16} />
                ) : (
                  user.roblox_join_date && (
                    <Tooltip
                      title={formatCustomDate(user.roblox_join_date)}
                      placement="top"
                      arrow
                      enterDelay={200}
                      leaveDelay={0}
                      slotProps={{
                        tooltip: {
                          sx: {
                            backgroundColor: '#0F1419',
                            color: '#D3D9D4',
                            fontSize: '0.75rem',
                            padding: '8px 12px',
                            borderRadius: '8px',

                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                            '& .MuiTooltip-arrow': {
                              color: '#0F1419',
                            },
                          },
                        },
                      }}
                    >
                      <span className="inline-block cursor-help">
                        Member since {formatShortDate(user.roblox_join_date)}
                      </span>
                    </Tooltip>
                  )
                )}
              </div>

              {user.roblox_id && (
                <div className="pt-2">
                  <Link
                    href={`https://www.roblox.com/users/${user.roblox_id}/profile`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#5865F2] px-4 py-2 text-white transition-colors hover:bg-[#4752C4]"
                  >
                    <RobloxIcon className="h-5 w-5" />
                    <span>View Roblox Profile</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trade Ads Section */}
      <TradeAdsTab
        userId={user.id}
        tradeAds={tradeAds}
        isLoadingAdditionalData={isLoadingAdditionalData}
      />
    </div>
  );
}
