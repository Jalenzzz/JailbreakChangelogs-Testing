import { Box, Typography, Divider, Chip, Skeleton } from '@mui/material';
import dynamic from 'next/dynamic';

const Tooltip = dynamic(() => import('@mui/material/Tooltip'), { ssr: false });
import { formatRelativeDate, formatCustomDate } from '@/utils/timestamp';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getItemImagePath, isVideoItem, handleImageError, getVideoPath } from '@/utils/images';
import { getItemTypeColor } from '@/utils/badgeColors';
import { ItemDetails } from '@/types';
import { convertUrlsToLinks } from '@/utils/urlConverter';

interface CommentProps {
  id: number;
  author: string;
  content: string;
  date: string;
  item_id: number;
  item_type: string;
  user_id: string;
  edited_at: number | null;
  owner: string;
  changelogDetails?: unknown;
  itemDetails?: unknown;
  seasonDetails?: unknown;
  tradeDetails?: unknown;
  isLoading?: boolean;
}

interface ChangelogDetails {
  id: number;
  title: string;
}

interface SeasonDetails {
  season: number;
  title: string;
}

export default function Comment({
  content,
  date,
  item_type,
  item_id,
  edited_at,
  changelogDetails: propChangelogDetails,
  itemDetails: propItemDetails,
  seasonDetails: propSeasonDetails,
  isLoading: propIsLoading,
}: CommentProps) {
  const [itemDetails, setItemDetails] = useState<ItemDetails | null>(
    (propItemDetails as ItemDetails) || null,
  );
  const [changelogDetails, setChangelogDetails] = useState<ChangelogDetails | null>(
    (propChangelogDetails as ChangelogDetails) || null,
  );
  const [seasonDetails, setSeasonDetails] = useState<SeasonDetails | null>(
    (propSeasonDetails as SeasonDetails) || null,
  );
  const [isLoading, setIsLoading] = useState(propIsLoading || false);

  const formattedDate = formatRelativeDate(parseInt(date));
  const contentType = item_type.charAt(0).toUpperCase() + item_type.slice(1);
  const typeColor = getItemTypeColor(item_type);

  useEffect(() => {
    // Update state when props change
    if (propChangelogDetails) {
      setChangelogDetails(propChangelogDetails as ChangelogDetails);
    }
    if (propItemDetails) {
      setItemDetails(propItemDetails as ItemDetails);
    }
    if (propSeasonDetails) {
      setSeasonDetails(propSeasonDetails as SeasonDetails);
    }
    setIsLoading(propIsLoading || false);
  }, [propChangelogDetails, propItemDetails, propSeasonDetails, propIsLoading]);

  const renderThumbnail = () => {
    if (item_type.toLowerCase() === 'changelog') {
      return (
        <div className="relative mr-3 h-16 w-16 flex-shrink-0 overflow-hidden rounded-md md:h-[4.5rem] md:w-32">
          <Image
            src={`https://assets.jailbreakchangelogs.xyz/assets/images/changelogs/${item_id}.webp`}
            alt={`Changelog ${item_id}`}
            fill
            className="object-cover"
            onError={handleImageError}
          />
        </div>
      );
    }

    if (item_type.toLowerCase() === 'season') {
      return (
        <div className="relative mr-3 h-16 w-16 flex-shrink-0 overflow-hidden rounded-md md:h-[4.5rem] md:w-32">
          <Image
            src={`https://assets.jailbreakchangelogs.xyz/assets/images/seasons/${item_id}/10.webp`}
            alt={`Season ${item_id}`}
            fill
            className="object-cover"
            onError={handleImageError}
          />
        </div>
      );
    }

    if (item_type.toLowerCase() === 'trade') {
      return (
        <div className="relative mr-3 h-16 w-16 flex-shrink-0 overflow-hidden rounded-md md:h-[4.5rem] md:w-32">
          <Image
            src="https://assets.jailbreakchangelogs.xyz/assets/logos/collab/JBCL_X_TC_Logo_Long_Dark_Background_Small.webp"
            alt="Trade Ad"
            fill
            className="object-cover"
            onError={handleImageError}
          />
        </div>
      );
    }

    // Handle item types that need item details (vehicle, weapon skin, etc.)
    const itemTypes = [
      'vehicle',
      'spoiler',
      'rim',
      'body color',
      'hyperchrome',
      'texture',
      'tire sticker',
      'tire style',
      'drift',
      'furniture',
      'horn',
      'weapon skin',
    ];

    if (itemTypes.includes(item_type.toLowerCase()) && itemDetails?.name) {
      // Use the same image utility as the values page, with light background for horns
      const imagePath = getItemImagePath(itemDetails.type, itemDetails.name, true, false, 'light');

      // Special case for video items
      if (isVideoItem(itemDetails.name)) {
        return (
          <div className="relative mr-3 h-16 w-16 flex-shrink-0 overflow-hidden rounded-md md:h-[4.5rem] md:w-32">
            <video
              src={getVideoPath(itemDetails.type, itemDetails.name)}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
              onError={(e) => {
                console.error(
                  `Failed to load video: ${getVideoPath(itemDetails.type, itemDetails.name)}`,
                );
                // Use a simple image replacement since handleImageError expects an img element
                const videoEl = e.target as HTMLVideoElement;
                const parentEl = videoEl.parentElement;
                if (parentEl) {
                  const img = document.createElement('img');
                  img.src = '/assets/images/Placeholder.webp';
                  img.className = 'object-cover h-full w-full';
                  parentEl.replaceChild(img, videoEl);
                }
              }}
            />
          </div>
        );
      }

      return (
        <div className="relative mr-3 h-16 w-16 flex-shrink-0 overflow-hidden rounded-md md:h-[4.5rem] md:w-32">
          <Image
            src={imagePath}
            alt={`${item_type} ${itemDetails.name}`}
            fill
            className="object-cover"
            onError={handleImageError}
          />
        </div>
      );
    }

    // Show loading placeholder while fetching item details
    if (isLoading) {
      return (
        <div className="relative mr-3 h-16 w-16 flex-shrink-0 animate-pulse overflow-hidden rounded-md bg-[#2E3944] md:h-[4.5rem] md:w-32"></div>
      );
    }

    return null;
  };

  // Get the item name to display
  const getItemName = () => {
    if (item_type.toLowerCase() === 'changelog' && changelogDetails?.title) {
      return changelogDetails.title;
    }

    if (item_type.toLowerCase() === 'season') {
      if (seasonDetails?.title) {
        return `Season ${item_id} / ${seasonDetails.title}`;
      }
      return `Season ${item_id}`;
    }

    if (item_type.toLowerCase() === 'trade') {
      return `Trade #${item_id}`;
    }

    if (itemDetails?.name) {
      return itemDetails.name;
    }

    // Show skeleton loading for item types that need details
    const itemTypesNeedingDetails = [
      'vehicle',
      'spoiler',
      'rim',
      'body color',
      'hyperchrome',
      'texture',
      'tire sticker',
      'tire style',
      'drift',
      'furniture',
      'horn',
      'weapon skin',
    ];

    if (itemTypesNeedingDetails.includes(item_type.toLowerCase()) && isLoading) {
      return null; // Will be handled by skeleton in render
    }

    return `${contentType} #${item_id}`;
  };

  return (
    <Link
      href={
        item_type.toLowerCase() === 'changelog'
          ? `/changelogs/${item_id}`
          : item_type.toLowerCase() === 'season'
            ? `/seasons/${item_id}`
            : item_type.toLowerCase() === 'trade'
              ? `/trading/ad/${item_id}`
              : `/item/${item_type.toLowerCase()}/${itemDetails?.name}`
      }
      className="group block"
    >
      <Box className="rounded-lg border border-[#2E3944] bg-[#212A31] p-3 shadow-sm transition-colors hover:border-[#5865F2]">
        <div className="mb-2 flex">
          {renderThumbnail()}
          <div className="min-w-0 flex-1">
            {/* Item Title/Name First */}
            {getItemName() ? (
              <Typography
                variant="body2"
                className="text-muted mb-1 font-medium transition-colors group-hover:text-blue-300"
                sx={{
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {getItemName()}
              </Typography>
            ) : (
              <Skeleton variant="text" width="80%" height={20} sx={{ bgcolor: '#2E3944', mb: 1 }} />
            )}

            {/* Badge Second */}
            <div className="mb-2">
              <Chip
                label={contentType}
                size="small"
                sx={{
                  backgroundColor: typeColor,
                  color: '#fff',
                  fontSize: '0.65rem',
                  height: '20px',
                }}
              />
            </div>

            {/* Comment Content Third */}
            <Typography
              variant="body2"
              className="text-muted break-words whitespace-pre-wrap"
              sx={{
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {convertUrlsToLinks(content, true)}
            </Typography>
          </div>
        </div>

        <Divider sx={{ my: 1, backgroundColor: '#2E3944' }} />

        <div className="flex items-center justify-start text-xs">
          <div className="flex items-center gap-1">
            <Tooltip
              title={edited_at ? formatCustomDate(edited_at) : formatCustomDate(parseInt(date))}
              placement="top"
              arrow
              slotProps={{
                tooltip: {
                  sx: {
                    backgroundColor: '#0F1419',
                    color: '#D3D9D4',
                    fontSize: '0.75rem',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #2E3944',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    '& .MuiTooltip-arrow': {
                      color: '#0F1419',
                    },
                  },
                },
              }}
            >
              <Typography variant="caption" className="cursor-help text-[#FFFFFF]">
                Posted {formattedDate}
              </Typography>
            </Tooltip>
            {edited_at && (
              <Typography variant="caption" className="text-[#FFFFFF]">
                (edited)
              </Typography>
            )}
          </div>
        </div>
      </Box>
    </Link>
  );
}
