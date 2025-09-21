import { FilterSort, ValueSort } from '@/types';
import { StarIcon } from '@heroicons/react/24/solid';
import { FaClock, FaRegSnowflake } from 'react-icons/fa';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { getItemTypeColor } from '@/utils/badgeColors';
import { toast } from 'react-hot-toast';
import { useAuthContext } from '@/contexts/AuthContext';

interface CategoryIconsProps {
  onSelect: (filter: FilterSort) => void;
  selectedFilter: FilterSort;
  onValueSort: (sort: ValueSort) => void;
}

export default function CategoryIcons({
  onSelect,
  selectedFilter,
  onValueSort,
}: CategoryIconsProps) {
  const { isAuthenticated } = useAuthContext();
  const handleCategoryClick = (categoryId: string) => {
    onSelect(categoryId as FilterSort);
    onValueSort('cash-desc');
  };

  // Special categories that don't map to item types
  const specialCategories = [
    {
      id: 'favorites',
      name: 'My Favorites',
      icon: StarIcon,
      color: 'var(--color-button-info)',
      onClick: () => {
        if (!isAuthenticated) {
          toast.error('Please log in to view your favorites');
          return;
        }
        handleCategoryClick('favorites');
      },
    },
    {
      id: 'name-limited-items',
      name: 'Limited',
      icon: FaClock,
      color: 'var(--color-warning)',
    },
    {
      id: 'name-seasonal-items',
      name: 'Seasonal',
      icon: FaRegSnowflake,
      color: 'var(--color-tertiary)',
    },
  ];

  // Item type categories generated dynamically
  const itemTypeCategories = [
    { id: 'name-vehicles', name: 'Vehicles', type: 'Vehicle' },
    { id: 'name-hyperchromes', name: 'HyperChromes', type: 'Hyperchrome' },
    { id: 'name-rims', name: 'Rims', type: 'Rim' },
    { id: 'name-spoilers', name: 'Spoilers', type: 'Spoiler' },
    { id: 'name-body-colors', name: 'Body Colors', type: 'Body Color' },
    { id: 'name-textures', name: 'Textures', type: 'Texture' },
    { id: 'name-tire-stickers', name: 'Tire Stickers', type: 'Tire Sticker' },
    { id: 'name-tire-styles', name: 'Tire Styles', type: 'Tire Style' },
    { id: 'name-drifts', name: 'Drifts', type: 'Drift' },
    { id: 'name-furnitures', name: 'Furniture', type: 'Furniture' },
    { id: 'name-horns', name: 'Horns', type: 'Horn' },
    { id: 'name-weapon-skins', name: 'Weapon Skins', type: 'Weapon Skin' },
  ].map(({ id, name, type }) => ({
    id,
    name,
    icon: getCategoryIcon(type.toLowerCase())?.Icon,
    color: getItemTypeColor(type),
    onClick: undefined, // Will use default handleCategoryClick
  }));

  const categories = [...specialCategories, ...itemTypeCategories];

  return (
    <div className="mb-8">
      <h3 className="text-primary-text mb-4 text-xl font-semibold">Categories</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedFilter === category.id;

          if (!Icon) return null;

          return (
            <button
              key={category.id}
              onClick={category.onClick || (() => handleCategoryClick(category.id))}
              className={`border-stroke flex items-center gap-2 rounded-lg border p-2 transition-all hover:scale-105 sm:p-3 ${
                isSelected ? 'ring-2' : 'bg-secondary-bg'
              }`}
              style={
                {
                  backgroundColor: isSelected ? category.color : undefined,
                  '--tw-ring-color': isSelected ? category.color : undefined,
                } as React.CSSProperties
              }
            >
              <Icon className="text-secondary-text h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-primary-text text-xs font-medium sm:text-sm">
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
