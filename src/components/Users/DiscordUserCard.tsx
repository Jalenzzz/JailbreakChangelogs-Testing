import { UserAvatar } from '@/utils/avatar';
import { UserSettings } from '@/types/auth';
import dynamic from 'next/dynamic';

const Tooltip = dynamic(() => import('@mui/material/Tooltip'), { ssr: false });
import { TrophyIcon } from '@heroicons/react/24/solid';

interface DiscordUserCardProps {
  user: {
    id: string;
    username: string;
    avatar: string;
    global_name: string;
    usernumber: number;
    accent_color: string;
    custom_avatar?: string;
    settings?: UserSettings;
    premiumtype?: number;
  };
  currentUserId: string | null;
}

export default function DiscordUserCard({ user, currentUserId }: DiscordUserCardProps) {
  const isPrivate = user.settings?.profile_public === 0 && currentUserId !== user.id;

  if (isPrivate) {
    return (
      <div className="flex items-center space-x-3">
        <div className="border-border-primary bg-tertiary-bg flex h-12 w-12 items-center justify-center rounded-full border">
          <svg
            className="text-primary-text h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-secondary-text group-hover:text-border-focus truncate text-base font-semibold transition-colors">
            Hidden User
          </h2>
          <p className="text-primary-text group-hover:text-border-focus truncate text-sm transition-colors">
            Private Profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <UserAvatar
        userId={user.id}
        avatarHash={user.avatar}
        username={user.username}
        size={12}
        accent_color={user.accent_color}
        custom_avatar={user.custom_avatar}
        showBadge={false}
        settings={user.settings}
        premiumType={user.premiumtype}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <h2 className="text-primary-text group-hover:text-border-focus max-w-[180px] truncate text-base font-semibold transition-colors sm:max-w-[250px]">
            {user.global_name && user.global_name !== 'None' ? user.global_name : user.username}
          </h2>
          {user.premiumtype ? (
            <Tooltip
              title={`Supporter Type ${user.premiumtype}`}
              placement="top"
              arrow
              slotProps={{
                tooltip: {
                  sx: {
                    backgroundColor: 'var(--color-primary-bg)',
                    color: 'var(--color-secondary-text)',
                    fontSize: '0.75rem',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    '& .MuiTooltip-arrow': {
                      color: 'var(--color-primary-bg)',
                    },
                  },
                },
              }}
            >
              <div
                className={`inline-flex items-center justify-center rounded-full ${user.premiumtype === 1 ? 'bg-gradient-to-r from-[#CD7F32] to-[#B87333]' : user.premiumtype === 2 ? 'bg-gradient-to-r from-[#C0C0C0] to-[#A9A9A9]' : 'bg-gradient-to-r from-[#FFD700] to-[#DAA520]'} h-4 w-4 cursor-pointer text-black hover:opacity-90`}
                style={{ minWidth: '1rem', minHeight: '1rem' }}
              >
                <TrophyIcon className="h-3 w-3" />
              </div>
            </Tooltip>
          ) : null}
        </div>
        <p className="text-secondary-text group-hover:text-border-focus max-w-[180px] truncate text-sm transition-colors sm:max-w-[250px]">
          @{user.username}
        </p>
      </div>
    </div>
  );
}
