'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const Tooltip = dynamic(() => import('@mui/material/Tooltip'), { ssr: false });
import { RobloxIcon } from '@/components/Icons/RobloxIcon';
import { TradeUserTooltip } from './TradeUserTooltip';

interface RobloxTradeUserProps {
  user: {
    id: string;
    username: string;
    global_name?: string;
    avatar?: string;
    roblox_id?: string;
    roblox_username?: string;
    roblox_display_name?: string;
    roblox_avatar?: string;
  };
  showBadge?: boolean;
}

export default function RobloxTradeUser({ user, showBadge = false }: RobloxTradeUserProps) {
  const [imageError, setImageError] = useState(false);

  if (!user.roblox_id || !user.roblox_username) {
    return null;
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0">
        {!imageError && user.roblox_avatar ? (
          <div className="bg-primary-bg relative h-10 w-10 overflow-hidden rounded-full">
            <Image
              src={user.roblox_avatar}
              alt={`${user.roblox_display_name || user.roblox_username || 'Roblox'} user's profile picture`}
              fill
              draggable={false}
              className="object-cover"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="bg-primary-bg flex h-10 w-10 items-center justify-center rounded-full">
            <RobloxIcon className="h-6 w-6 text-white" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        {showBadge && (
          <div className="mb-1 flex items-center gap-2">
            <div className="bg-secondary-bg flex items-center gap-1.5 rounded px-1.5 py-0.5">
              <RobloxIcon className="text-button-info h-3 w-3" />
              <span className="text-primary-text text-xs">Roblox</span>
            </div>
          </div>
        )}
        <div className="flex flex-col">
          <Tooltip
            title={<TradeUserTooltip user={user} />}
            arrow
            disableTouchListener
            slotProps={{
              tooltip: {
                sx: {
                  backgroundColor: 'var(--color-secondary-bg)',
                  color: 'var(--color-primary-text)',
                  maxWidth: '400px',
                  width: 'auto',
                  minWidth: '300px',
                  '& .MuiTooltip-arrow': {
                    color: 'var(--color-secondary-bg)',
                  },
                },
              },
            }}
          >
            <Link
              href={`https://www.roblox.com/users/${user.roblox_id}/profile`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-text hover:text-button-info inline-block truncate font-medium transition-colors"
            >
              {user.roblox_display_name || user.roblox_username}
            </Link>
          </Tooltip>
          {user.roblox_display_name && (
            <span className="text-secondary-text truncate text-xs">@{user.roblox_username}</span>
          )}
        </div>
      </div>
    </div>
  );
}
