import {
  FaClock,
  FaRegSnowflake,
  FaCarAlt,
  FaFire,
  FaLayerGroup,
  FaHome,
  FaBullhorn,
} from 'react-icons/fa';
import { FaJar, FaGun } from 'react-icons/fa6';
import { GiCarWheel } from 'react-icons/gi';
import { RiPaintFill } from 'react-icons/ri';
import { PiStickerFill } from 'react-icons/pi';
import { CircleStackIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

interface CategoryIcon {
  Icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
}

export const getCategoryIcon = (type: string): CategoryIcon | null => {
  const normalizedType = type.toLowerCase().trim();
  switch (normalizedType) {
    case 'vehicles':
    case 'vehicle':
      return { Icon: FaCarAlt };
    case 'hyperchromes':
    case 'hyperchrome':
      return { Icon: FaJar };
    case 'rims':
    case 'rim':
      return { Icon: GiCarWheel };
    case 'spoilers':
    case 'spoiler':
      return { Icon: RocketLaunchIcon };
    case 'body colors':
    case 'body color':
      return { Icon: RiPaintFill };
    case 'textures':
    case 'texture':
      return { Icon: FaLayerGroup };
    case 'tire stickers':
    case 'tire sticker':
      return { Icon: PiStickerFill };
    case 'tire styles':
    case 'tire style':
      return { Icon: CircleStackIcon };
    case 'drifts':
    case 'drift':
      return { Icon: FaFire };
    case 'furniture':
      return { Icon: FaHome };
    case 'horns':
    case 'horn':
      return { Icon: FaBullhorn };
    case 'weapon skins':
    case 'weapon skin':
      return { Icon: FaGun };
    default:
      return null;
  }
};

export const CategoryIconBadge = ({
  type,
  isLimited,
  isSeasonal,
  hasChildren,
  showCategoryForVariants = false,
  className = 'h-5 w-5',
}: {
  type: string;
  isLimited: boolean;
  isSeasonal: boolean;
  hasChildren: boolean;
  showCategoryForVariants?: boolean;
  className?: string;
}) => {
  if (isSeasonal) {
    return (
      <div className="bg-primary-bg/50 rounded-full p-1.5">
        <FaRegSnowflake className={`${className} text-secondary-text`} />
      </div>
    );
  }

  if (isLimited) {
    return (
      <div className="bg-primary-bg/50 rounded-full p-1.5">
        <FaClock className={`${className} text-secondary-text`} />
      </div>
    );
  }

  // Show category icon based on showCategoryForVariants prop
  if (!hasChildren || showCategoryForVariants) {
    const categoryIcon = getCategoryIcon(type);
    if (categoryIcon) {
      return (
        <div className="bg-primary-bg/50 rounded-full p-1.5">
          <categoryIcon.Icon className={`${className} text-secondary-text`} />
        </div>
      );
    }
  }

  return null;
};
