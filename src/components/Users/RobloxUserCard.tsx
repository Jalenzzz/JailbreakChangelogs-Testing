import { useState } from 'react';
import Image from 'next/image';
import { CircularProgress } from '@mui/material';
import { RobloxIcon } from '@/components/Icons/RobloxIcon';
import { formatShortDate } from '@/utils/timestamp';

interface RobloxUserCardProps {
  user: {
    id: string;
    roblox_id?: string | null;
    roblox_username?: string;
    roblox_display_name?: string;
    roblox_avatar?: string;
    roblox_join_date?: number;
    settings?: {
      profile_public: number;
    };
  };
}

export default function RobloxUserCard({ user }: RobloxUserCardProps) {
  const [avatarError, setAvatarError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="flex items-center space-x-3">
      {!avatarError && user.roblox_avatar ? (
        <div className="relative h-12 w-12 flex-shrink-0">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full">
              <CircularProgress size={24} sx={{ color: 'var(--color-button-info)' }} />
            </div>
          )}
          <div className="absolute inset-0">
            <Image
              src={user.roblox_avatar}
              alt={`${user.roblox_display_name || user.roblox_username || 'Roblox'} user's profile picture`}
              fill
              draggable={false}
              className="rounded-full border object-cover"
              onError={() => setAvatarError(true)}
              onLoad={() => setIsLoading(false)}
            />
          </div>
        </div>
      ) : (
        <div className="border-border-primary bg-tertiary-bg flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border">
          <RobloxIcon className="text-primary-text h-6 w-6" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h2 className="text-primary-text group-hover:text-border-focus max-w-[180px] truncate text-base font-semibold transition-colors sm:max-w-[250px]">
          {user.roblox_display_name || user.roblox_username || 'Roblox User'}
        </h2>
        <p className="text-secondary-text group-hover:text-border-focus max-w-[180px] truncate text-sm transition-colors sm:max-w-[250px]">
          @{user.roblox_username || 'unknown'}
        </p>
        <p className="text-tertiary-text text-sm">
          {user.roblox_join_date
            ? `Joined ${formatShortDate(user.roblox_join_date)}`
            : 'Unknown join date'}
        </p>
      </div>
    </div>
  );
}
