'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import localFont from 'next/font/local';
import { InventoryItem } from '@/app/inventories/types';
import {
  getItemImagePath,
  isVideoItem,
  isDriftItem,
  getDriftVideoPath,
  getVideoPath,
  handleImageError,
} from '@/utils/images';
import { getCategoryIcon, getCategoryColor } from '@/utils/categoryIcons';
import { VerifiedBadgeIcon } from '@/components/Icons/VerifiedBadgeIcon';

const Tooltip = dynamic(() => import('@mui/material/Tooltip'), { ssr: false });

const bangers = localFont({
  src: '../../../public/fonts/Bangers.ttf',
});

// Helper function to format numbers with commas
const formatNumber = (num: number) => {
  return new Intl.NumberFormat().format(num);
};

interface InventoryItemCardProps {
  item: InventoryItem;
  getUserDisplay: (userId: string) => string;
  getUserAvatar: (userId: string) => string;
  getHasVerifiedBadge?: (userId: string) => boolean;
  onCardClick: (item: InventoryItem) => void;
  duplicateCount?: number;
  duplicateOrder?: number;
  userId: string;
}

export default function InventoryItemCard({
  item,
  getUserDisplay,
  // getUserAvatar,
  getHasVerifiedBadge,
  onCardClick,
  duplicateCount = 1,
  duplicateOrder = 1,
  userId,
}: InventoryItemCardProps) {
  const isOriginalOwner = item.isOriginalOwner;
  const originalOwnerInfo = item.info.find((info) => info.title === 'Original Owner');
  const isDuplicate = duplicateCount > 1;

  return (
    <div
      className={`text-primary-text hover:shadow-card-shadow relative flex min-h-[400px] cursor-pointer flex-col rounded-lg p-3 transition-all duration-200 ${
        isOriginalOwner
          ? 'border border-[#FFD700] bg-[#FFD700]/10 hover:border-[#FFD700]'
          : 'border-border-primary bg-primary-bg hover:border-border-focus border'
      }`}
      onClick={() => onCardClick(item)}
    >
      {/* Duplicate Indicator */}
      {isDuplicate && (
        <div className="bg-button-danger text-form-button-text absolute -top-2 -right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-lg">
          #{duplicateOrder}
        </div>
      )}

      {/* Title */}
      <div className="mb-4 text-left">
        <div className="mb-1 flex items-center gap-2">
          <span
            className="text-primary-text flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
            style={{
              borderColor: getCategoryColor(item.categoryTitle),
              backgroundColor: getCategoryColor(item.categoryTitle) + '20', // Add 20% opacity
            }}
          >
            {(() => {
              const categoryIcon = getCategoryIcon(item.categoryTitle);
              return categoryIcon ? (
                <categoryIcon.Icon
                  className="h-3 w-3"
                  style={{ color: getCategoryColor(item.categoryTitle) }}
                />
              ) : null;
            })()}
            {item.categoryTitle}
          </span>
        </div>
        <h2 className={`${bangers.className} text-primary-text text-2xl tracking-wide break-words`}>
          {item.title}
        </h2>
      </div>

      {/* Item Image - Always show container for consistent layout */}
      <div className="relative mb-3 h-48 w-full overflow-hidden rounded-lg">
        {!['Brakes'].includes(item.categoryTitle) ? (
          isVideoItem(item.title) ? (
            <video
              src={getVideoPath(item.categoryTitle, item.title)}
              className="h-full w-full object-cover"
              muted
              playsInline
              loop
              autoPlay
            />
          ) : isDriftItem(item.categoryTitle) ? (
            <div className="relative h-full w-full">
              <Image
                src={getItemImagePath(item.categoryTitle, item.title, true)}
                alt={item.title}
                fill
                className="object-cover"
                onError={handleImageError}
              />
              <video
                src={getDriftVideoPath(item.title)}
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 hover:opacity-100"
                muted
                playsInline
                loop
              />
            </div>
          ) : (
            <Image
              src={getItemImagePath(item.categoryTitle, item.title, true)}
              alt={item.title}
              fill
              className="object-cover"
              onError={handleImageError}
            />
          )
        ) : (
          <Image
            src={getItemImagePath(item.categoryTitle, item.title, true)}
            alt={item.title}
            fill
            className="object-cover"
            onError={handleImageError}
          />
        )}
      </div>

      {/* Statistics */}
      <div className="flex flex-1 flex-col justify-center space-y-2 text-center">
        <div>
          <div className="text-secondary-text text-sm">MONTHLY UNIQUE</div>
          <Tooltip
            title={item.uniqueCirculation.toLocaleString()}
            placement="top"
            arrow
            slotProps={{
              tooltip: {
                sx: {
                  backgroundColor: 'var(--color-secondary-bg)',
                  color: 'var(--color-primary-text)',
                  '& .MuiTooltip-arrow': {
                    color: 'var(--color-secondary-bg)',
                  },
                },
              },
            }}
          >
            <div className="text-primary-text cursor-help text-xl font-bold">
              {formatNumber(item.uniqueCirculation)}
            </div>
          </Tooltip>
        </div>
        <div>
          <div className="text-secondary-text text-sm">ORIGINAL OWNER</div>
          <div className="text-xl font-bold">
            {originalOwnerInfo ? (
              <a
                href={`https://www.roblox.com/users/${isOriginalOwner ? userId : originalOwnerInfo.value}/profile`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link hover:text-link-hover text-center break-words transition-colors hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="inline-flex items-center gap-2">
                  {isOriginalOwner
                    ? getUserDisplay(userId)
                    : getUserDisplay(originalOwnerInfo.value)}
                  {getHasVerifiedBadge &&
                    (isOriginalOwner
                      ? getHasVerifiedBadge(userId)
                      : getHasVerifiedBadge(originalOwnerInfo.value)) && (
                      <VerifiedBadgeIcon className="h-4 w-4" />
                    )}
                </span>
              </a>
            ) : (
              <span className="text-secondary-text text-sm">Unknown</span>
            )}
          </div>
        </div>
        <div>
          <div className="text-secondary-text text-sm">CREATED ON</div>
          <div className="text-primary-text text-xl font-bold">
            {item.info.find((info) => info.title === 'Created At')?.value || 'N/A'}
          </div>
        </div>
      </div>

      {/* Season and Level badges - always show container for consistent layout */}
      <div className="border-secondary-text mt-3 flex min-h-[40px] justify-center gap-2 border-t pt-3">
        {item.season && (
          <div className="border-button-info bg-button-info flex h-8 w-8 items-center justify-center rounded-full border shadow-lg">
            <span className="text-form-button-text text-xs font-bold">S{item.season}</span>
          </div>
        )}
        {item.level && (
          <div className="border-status-success bg-status-success flex h-8 w-8 items-center justify-center rounded-full border shadow-lg">
            <span className="text-form-button-text text-xs font-bold">L{item.level}</span>
          </div>
        )}
      </div>
    </div>
  );
}
