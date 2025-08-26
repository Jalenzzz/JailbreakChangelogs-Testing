'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Pagination } from '@mui/material';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import localFont from 'next/font/local';
import { useDebounce } from '@/hooks/useDebounce';
import { getItemImagePath, isVideoItem, isDriftItem, getDriftVideoPath, getVideoPath, handleImageError } from '@/utils/images';


const bangers = localFont({
  src: '../../../public/fonts/Bangers.ttf',
});

const Select = dynamic(() => import('react-select'), { ssr: false });

interface TradeHistoryEntry {
  UserId: number;
  TradeTime: number;
}

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
  history?: TradeHistoryEntry[];
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

interface InventoryCheckerClientProps {
  initialData?: InventoryData;
  robloxId?: string;
  robloxUsers?: Record<string, { displayName?: string; name?: string }>;
  robloxAvatars?: Record<string, string>;
  error?: string;
  isLoading?: boolean;
}

export default function InventoryCheckerClient({ initialData, robloxId, robloxUsers: initialRobloxUsers, robloxAvatars: initialRobloxAvatars, error, isLoading: externalIsLoading }: InventoryCheckerClientProps) {
  const [searchId, setSearchId] = useState(robloxId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'alpha-asc' | 'alpha-desc' | 'traded-desc' | 'unique-desc' | 'created-asc' | 'created-desc'>('alpha-asc');
  const [page, setPage] = useState(1);
  const [showOnlyOriginal, setShowOnlyOriginal] = useState(false);
  const [selectLoaded, setSelectLoaded] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const robloxUsers = initialRobloxUsers || {};
  const robloxAvatars = initialRobloxAvatars || {};
  const router = useRouter();
  
  const MAX_SEARCH_LENGTH = 50;
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  


  // Set selectLoaded to true after mount to ensure client-side rendering
  useEffect(() => {
    setSelectLoaded(true);
  }, []);



  // Gamepass mapping with links and image names
  const gamepassData = {
    'PremiumGarage': {
      link: 'https://www.roblox.com/game-pass/2725211/Pro-Garage',
      image: 'PremiumGarage'
    },
    'DuffelBag': {
      link: 'https://www.roblox.com/game-pass/2219040/Duffel-Bag',
      image: 'DuffelBag'
    },
    'SWAT': {
      link: 'https://www.roblox.com/game-pass/2070427/SWAT-Team',
      image: 'SWAT'
    },
    'Stereo': {
      link: 'https://www.roblox.com/game-pass/2218187/Car-Stereo',
      image: 'Stereo'
    },
    'BOSS': {
      link: 'https://www.roblox.com/game-pass/4974038/Crime-Boss',
      image: 'BOSS'
    },
    'VIP': {
      link: 'https://www.roblox.com/game-pass/2296901/Very-Important-Player-VIP',
      image: 'VIP'
    },
    'TradingVIP': {
      link: 'https://www.roblox.com/game-pass/56149618/VIP-Trading',
      image: 'TradingVIP'
    },
    'Walmart': {
      link: 'https://www.roblox.com/game-pass/1142100573/The-Pass',
      image: 'Walmart'
    }
  };
  
  const itemsPerPage = 20; // Show 20 items per page for inventory
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setIsLoading(true);
    router.push(`/inventories/${searchId.trim()}`);
  };

  // Reset loading state when new data is received or when there's an error
  useEffect(() => {
    if (initialData || error) {
      setIsLoading(false);
    }
  }, [initialData, error, externalIsLoading]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatMoney = (money: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(money);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle filter toggle with artificial delay
  const handleOriginalFilterToggle = (checked: boolean) => {
    setIsFiltering(true);
    setShowOnlyOriginal(checked);
    
    // Add artificial delay to show loading state
    setTimeout(() => {
      setIsFiltering(false);
    }, 300); // 300ms delay
  };

  // Reset page when search term, filter, categories, or sort order change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, showOnlyOriginal, selectedCategories, sortOrder]);

  // Filter inventory items based on search term, original owner filter, and category filter
  const filteredItems = useMemo(() => {
    if (!initialData) {
      return [];
    }

    let items = initialData.data;

    // Apply original owner filter
    if (showOnlyOriginal) {
      items = items.filter((item) => item.isOriginalOwner);
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      items = items.filter((item) => selectedCategories.includes(item.categoryTitle));
    }

    // Apply search filter
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase().trim();
      items = items.filter((item) => {
        // Search in item title
        if (item.title.toLowerCase().includes(searchLower)) return true;
        
        // Search in category title
        if (item.categoryTitle.toLowerCase().includes(searchLower)) return true;
        
        // Search in season (if exists)
        if (item.season && item.season.toString().includes(searchLower)) return true;
        
        // Search in level (if exists)
        if (item.level && item.level.toString().includes(searchLower)) return true;
        
        // Search in original owner status
        if (item.isOriginalOwner && searchLower.includes('original')) return true;
        if (!item.isOriginalOwner && searchLower.includes('not original')) return true;
        
        return false;
      });
    }

    // Apply sorting
    items = items.sort((a, b) => {
      switch (sortOrder) {
        case 'alpha-asc':
          return a.title.localeCompare(b.title);
        case 'alpha-desc':
          return b.title.localeCompare(a.title);
        case 'traded-desc':
          return (b.timesTraded || 0) - (a.timesTraded || 0);
        case 'unique-desc':
          return (b.uniqueCirculation || 0) - (a.uniqueCirculation || 0);
        case 'created-asc':
          const aCreatedAt = a.info.find(info => info.title === 'Created At')?.value;
          const bCreatedAt = b.info.find(info => info.title === 'Created At')?.value;
          if (!aCreatedAt || !bCreatedAt) return 0;
          return new Date(aCreatedAt).getTime() - new Date(bCreatedAt).getTime();
        case 'created-desc':
          const aCreatedAtDesc = a.info.find(info => info.title === 'Created At')?.value;
          const bCreatedAtDesc = b.info.find(info => info.title === 'Created At')?.value;
          if (!aCreatedAtDesc || !bCreatedAtDesc) return 0;
          return new Date(bCreatedAtDesc).getTime() - new Date(aCreatedAtDesc).getTime();
        default:
          return a.title.localeCompare(b.title);
      }
    });

    return items;
  }, [initialData, debouncedSearchTerm, showOnlyOriginal, selectedCategories, sortOrder]);

  // Get unique categories from the data
  const availableCategories = useMemo(() => {
    if (!initialData) return [];
    const categories = [...new Set(initialData.data.map(item => item.categoryTitle))];
    return categories.sort();
  }, [initialData]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowHistoryModal(true);
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedItem(null);
  };

  // Helper function to get level color based on level number
  const getLevelColor = (level: number) => {
    if (level > 10) {
      return 'text-[#a855f7]'; // Purple for levels 11-13 (contract grinding beyond grand prize)
    } else if (level === 10) {
      return 'text-[#ffd700]'; // Gold for level 10 (grand prize level)
    } else if (level >= 7) {
      return 'text-[#4ade80]'; // Green for levels 7-9 (getting close to grand prize)
    } else if (level >= 4) {
      return 'text-[#40c0e7]'; // Blue for levels 4-6 (mid-level)
    } else {
      return 'text-white'; // White for levels 1-3 (beginner)
    }
  };

  // Helper function to get Roblox user display name
  const getRobloxUserDisplay = (robloxId: string) => {
    if (!robloxUsers || !robloxUsers[robloxId]) {
      return robloxId;
    }
    
    const user = robloxUsers[robloxId];
    return user.displayName || user.name || robloxId;
  };

  if (!initialData || isLoading || externalIsLoading) {
    return (
      <div className="bg-[#212A31] rounded-lg border border-[#2E3944] p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="robloxId" className="block text-sm font-medium text-muted mb-2">
              Roblox ID
            </label>
            <input
              type="text"
              id="robloxId"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Roblox ID (e.g., 1910948809)"
              className="w-full px-3 py-2 border border-[#2E3944] bg-[#37424D] rounded-lg shadow-sm focus:outline-none focus:border-[#5865F2] text-muted placeholder-[#D3D9D4]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || externalIsLoading}
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] disabled:bg-[#2E3944] text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading || externalIsLoading ? 'Searching...' : 'Check Inventory'}
          </button>
        </form>
        
        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
            <p className="text-red-300 text-sm whitespace-pre-line">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Descriptive Text */}
      <div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Enter a Roblox ID to check their Jailbreak inventory.
        </p>
      </div>
      
      {/* Search Form */}
      <div className="bg-[#212A31] rounded-lg border border-[#2E3944] p-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Roblox ID (e.g., 1910948809)"
              className="w-full px-3 py-2 border border-[#2E3944] bg-[#37424D] rounded-lg shadow-sm focus:outline-none focus:border-[#5865F2] text-muted placeholder-[#D3D9D4]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || externalIsLoading}
            className="bg-[#5865F2] hover:bg-[#4752C4] disabled:bg-[#2E3944] text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            {(isLoading || externalIsLoading) && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading || externalIsLoading ? 'Searching...' : 'Search'}
          </button>
        </form>
        
        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* User Stats */}
      <div className="bg-[#212A31] rounded-lg border border-[#2E3944] p-6">
        <h2 className="text-xl font-semibold mb-4 text-muted">User Information</h2>
        
        {/* Roblox User Profile */}
        {initialData?.user_id && (
          <div className="flex items-center gap-4 mb-6 p-4 bg-[#2E3944] rounded-lg border border-[#37424D]">
            {robloxAvatars && robloxAvatars[initialData.user_id] ? (
              <Image
                src={robloxAvatars[initialData.user_id]}
                alt="Roblox Avatar"
                width={64}
                height={64}
                className="rounded-full bg-[#212A31]"
              />
            ) : (
              <div className="w-16 h-16 bg-[#37424D] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-muted">
                {robloxUsers[initialData.user_id]?.displayName || robloxUsers[initialData.user_id]?.name || initialData.user_id}
              </h3>
              <p className="text-sm text-muted opacity-75">
                @{robloxUsers[initialData.user_id]?.name || initialData.user_id}
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

        <div className="mt-4 text-sm text-muted space-y-1">
          <p>Scan Count: {initialData.scan_count}</p>
          <p>Created: {formatDate(initialData.created_at)}</p>
          <p>Last Updated: {formatDate(initialData.updated_at)}</p>
        </div>
      </div>

      {/* Inventory Items */}
      <div className="bg-[#212A31] rounded-lg border border-[#2E3944] p-6">
        <h2 className="text-xl font-semibold text-muted mb-4">Inventory Items</h2>
        
        <div className="flex flex-col gap-4 mb-4">
          {/* Original Owner Filter */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyOriginal}
              onChange={(e) => handleOriginalFilterToggle(e.target.checked)}
              className="w-4 h-4 text-[#5865F2] bg-[#37424D] border-[#2E3944] rounded focus:ring-[#5865F2] focus:ring-2"
            />
            <span className="text-sm text-muted whitespace-nowrap">Original Items Only</span>
          </label>
          
                      {/* Search, Category, and Sort Filters - Side by Side */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              {/* Search Bar - First */}
              <div className="relative w-full sm:w-1/3">
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  maxLength={MAX_SEARCH_LENGTH}
                  className="w-full px-3 py-2 pl-10 pr-10 border border-[#2E3944] bg-[#37424D] rounded-lg shadow-sm focus:outline-none focus:border-[#5865F2] text-muted placeholder-[#D3D9D4]"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#FFFFFF]" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#FFFFFF] hover:text-muted"
                    aria-label="Clear search"
                  >
                    <XMarkIcon />
                  </button>
                )}
              </div>
              
              {/* Category Filter - Second */}
              <div className="w-full sm:w-1/3">
                {selectLoaded ? (
                  <Select
                    value={selectedCategories.length > 0 ? { value: selectedCategories[0], label: selectedCategories[0] } : null}
                    onChange={(option) => {
                      if (!option) {
                        setSelectedCategories([]);
                        return;
                      }
                      setSelectedCategories([(option as { value: string }).value]);
                    }}
                    options={availableCategories.map(cat => ({ value: cat, label: cat }))}
                    classNamePrefix="react-select"
                    className="w-full"
                    isMulti={false}
                    isClearable={true}
                    placeholder="Filter by category..."
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: '#37424D',
                        borderColor: '#2E3944',
                        color: '#D3D9D4',
                      }),
                      singleValue: (base) => ({ ...base, color: '#D3D9D4' }),
                      menu: (base) => ({ ...base, backgroundColor: '#37424D', color: '#D3D9D4', zIndex: 3000 }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected ? '#5865F2' : state.isFocused ? '#2E3944' : '#37424D',
                        color: state.isSelected || state.isFocused ? '#FFFFFF' : '#D3D9D4',
                        '&:active': {
                          backgroundColor: '#124E66',
                          color: '#FFFFFF',
                        },
                      }),
                      clearIndicator: (base) => ({
                        ...base,
                        color: '#D3D9D4',
                        '&:hover': {
                          color: '#FFFFFF',
                        },
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: '#D3D9D4',
                      }),
                    }}
                    isSearchable={false}
                  />
                ) : (
                  <div className="w-full h-10 bg-[#37424D] border border-[#2E3944] rounded-md animate-pulse"></div>
                )}
              </div>
              
              {/* Sort Filter - Third */}
              <div className="w-full sm:w-1/3">
                {selectLoaded ? (
                  <Select
                    value={{ 
                      value: sortOrder, 
                      label: (() => {
                        switch (sortOrder) {
                          case 'alpha-asc': return 'Name (A to Z)';
                          case 'alpha-desc': return 'Name (Z to A)';
                          case 'traded-desc': return 'Monthly Traded (High to Low)';
                          case 'unique-desc': return 'Monthly Unique (High to Low)';
                          case 'created-asc': return 'Created On (Oldest to Newest)';
                          case 'created-desc': return 'Created On (Newest to Oldest)';
                          default: return 'Name (A to Z)';
                        }
                      })()
                    }}
                    onChange={(option) => {
                      if (!option) {
                        setSortOrder('alpha-asc');
                        return;
                      }
                      setSortOrder((option as { value: 'alpha-asc' | 'alpha-desc' | 'traded-desc' | 'unique-desc' | 'created-asc' | 'created-desc' }).value);
                    }}
                    options={[
                      { label: 'Alphabetically', options: [
                        { value: 'alpha-asc', label: 'Name (A to Z)' },
                        { value: 'alpha-desc', label: 'Name (Z to A)' },
                      ]},
                      { label: 'Activity', options: [
                        { value: 'traded-desc', label: 'Monthly Traded (High to Low)' },
                        { value: 'unique-desc', label: 'Monthly Unique (High to Low)' },
                      ]},
                      { label: 'Date', options: [
                        { value: 'created-asc', label: 'Created On (Oldest to Newest)' },
                        { value: 'created-desc', label: 'Created On (Newest to Oldest)' },
                      ]},
                    ]}
                    classNamePrefix="react-select"
                    className="w-full"
                    isMulti={false}
                    isClearable={true}
                    placeholder="Sort by..."
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: '#37424D',
                        borderColor: '#2E3944',
                        color: '#D3D9D4',
                      }),
                      singleValue: (base) => ({ ...base, color: '#D3D9D4' }),
                      menu: (base) => ({ ...base, backgroundColor: '#37424D', color: '#D3D9D4', zIndex: 3000 }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected ? '#5865F2' : state.isFocused ? '#2E3944' : '#37424D',
                        color: state.isSelected || state.isFocused ? '#FFFFFF' : '#D3D9D4',
                        '&:active': {
                          backgroundColor: '#124E66',
                          color: '#FFFFFF',
                        },
                      }),
                      clearIndicator: (base) => ({
                        ...base,
                        color: '#D3D9D4',
                        '&:hover': {
                          color: '#FFFFFF',
                        },
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: '#D3D9D4',
                      }),
                    }}
                    isSearchable={false}
                  />
                ) : (
                  <div className="w-full h-10 bg-[#37424D] border border-[#2E3944] rounded-md animate-pulse"></div>
                )}
              </div>
          </div>
        </div>
        
        {filteredItems.length === 0 && (debouncedSearchTerm || selectedCategories.length > 0) && (
          <div className="text-center py-8 text-muted">
            <p className="break-words">
              No items found
              {debouncedSearchTerm && ` matching "${debouncedSearchTerm}"`}
              {selectedCategories.length > 0 && ` in selected categories`}
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {debouncedSearchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-[#5865F2] hover:text-[#4752C4] hover:underline"
                >
                  Clear search
                </button>
              )}
              {selectedCategories.length > 0 && (
                <button
                  onClick={() => setSelectedCategories([])}
                  className="text-[#5865F2] hover:text-[#4752C4] hover:underline"
                >
                  Clear categories
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Filter Summary - Only show when there are items */}
        {(debouncedSearchTerm || selectedCategories.length > 0 || showOnlyOriginal) && filteredItems.length > 0 && (
          <div className="mb-4 p-3 bg-[#2E3944] rounded-lg border border-[#37424D]">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <span className="font-medium">Active filters:</span>
              {showOnlyOriginal && (
                <span className="px-2 py-1 bg-[#5865F2] text-white rounded-md text-xs">
                  Original Items Only
                </span>
              )}
              {selectedCategories.length > 0 && (
                <span className="px-2 py-1 bg-[#5865F2] text-white rounded-md text-xs">
                  Category: {selectedCategories[0]}
                </span>
              )}
              {debouncedSearchTerm && (
                <span className="px-2 py-1 bg-[#5865F2] text-white rounded-md text-xs break-words">
                  Search: &quot;{debouncedSearchTerm}&quot;
                </span>
              )}
              <span className="text-xs opacity-75">
                Showing {filteredItems.length} of {initialData?.item_count || 0} items
              </span>
            </div>
          </div>
        )}
        
        {/* Top Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mb-6">
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              sx={{
                '& .MuiPaginationItem-root': {
                  color: '#D3D9D4',
                  '&.Mui-selected': {
                    backgroundColor: '#5865F2',
                    '&:hover': {
                      backgroundColor: '#4752C4',
                    },
                  },
                  '&:hover': {
                    backgroundColor: '#2E3944',
                  },
                },
              }}
            />
          </div>
        )}
        
        {/* Loading Spinner */}
        {isFiltering && (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center gap-4">
              <svg className="animate-spin h-8 w-8 text-[#5865F2]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-muted text-sm">Filtering items...</p>
            </div>
          </div>
        )}
        
        {/* Items Grid - Only show when not filtering */}
        {!isFiltering && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {paginatedItems.map((item) => {
            const isOriginalOwner = item.isOriginalOwner;
            const originalOwnerInfo = item.info.find(info => info.title === 'Original Owner');
            
            return (
              <div
                key={item.id}
                className={`text-white rounded-lg p-3 border-2 relative cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg min-h-[400px] flex flex-col ${
                  isOriginalOwner 
                    ? 'bg-yellow-600/30 backdrop-blur-sm border-yellow-400'
                    : 'bg-gray-700 border-gray-800'
                }`}
                onClick={() => handleItemClick(item)}
              >
                {/* Title */}
                <div className="text-left mb-4">
                  <p className={`${bangers.className} text-md text-gray-300 mb-1 tracking-wide`}>
                    {item.categoryTitle}
                  </p>
                  <h2 className={`${bangers.className} text-2xl break-words tracking-wide`}>
                    {item.title}
                  </h2>
                </div>
                
                {/* Item Image - Always show container for consistent layout */}
                <div className="relative w-full h-40 mb-3 rounded-lg overflow-hidden bg-[#212A31]">
                  {!['Brakes'].includes(item.categoryTitle) ? (
                    isVideoItem(item.title) ? (
                      <video
                        src={getVideoPath(item.categoryTitle, item.title)}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        loop
                        autoPlay
                      />
                    ) : isDriftItem(item.categoryTitle) ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={getItemImagePath(item.categoryTitle, item.title, true)}
                          alt={item.title}
                          fill
                          className="object-cover"
                          onError={handleImageError}
                        />
                        <video
                          src={getDriftVideoPath(item.title)}
                          className="absolute inset-0 w-full h-full object-cover opacity-0 hover:opacity-100 transition-opacity duration-300"
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
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm">No Image</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Statistics */}
                <div className="space-y-2 text-center flex-1 flex flex-col justify-center">
                  <div>
                    <div className="text-sm opacity-90">MONTHLY TRADED</div>
                    <div className="text-xl font-bold">{formatNumber(item.timesTraded)}</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">MONTHLY UNIQUE</div>
                    <div className="text-xl font-bold">{formatNumber(item.uniqueCirculation)}</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">ORIGINAL OWNER</div>
                    <div className="text-xl font-bold italic">
                      {originalOwnerInfo ? (
                        <div className="flex items-center justify-center gap-2">
                          {/* Show avatar for original owner - use main user's avatar if isOriginalOwner is true */}
                          {(isOriginalOwner && robloxAvatars && robloxAvatars[initialData?.user_id]) || 
                           (!isOriginalOwner && robloxAvatars && robloxAvatars[originalOwnerInfo.value]) ? (
                            <Image
                              src={isOriginalOwner ? robloxAvatars[initialData?.user_id] : robloxAvatars[originalOwnerInfo.value]}
                              alt="Original Owner Avatar"
                              width={24}
                              height={24}
                              className="rounded-full bg-[#212A31] border border-[#2E3944]"
                            />
                          ) : null}
                          <a
                            href={`https://www.roblox.com/users/${isOriginalOwner ? initialData?.user_id : originalOwnerInfo.value}/profile`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-300 hover:text-blue-400 hover:underline transition-colors"
                          >
                            {isOriginalOwner ? getRobloxUserDisplay(initialData?.user_id || '') : getRobloxUserDisplay(originalOwnerInfo.value)}
                          </a>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">CREATED ON</div>
                    <div className="text-xl font-bold">
                      {item.info.find(info => info.title === 'Created At')?.value || 'N/A'}
                    </div>
                  </div>
                </div>
                
                {/* Season and Level badges - always show container for consistent layout */}
                <div className="flex justify-center gap-2 mt-3 pt-3 border-t border-white/20 min-h-[40px]">
                  {item.season && (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-blue-400 shadow-lg">
                      <span className="text-white text-xs font-bold">S{item.season}</span>
                    </div>
                  )}
                  {item.level && (
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center border-2 border-green-400 shadow-lg">
                      <span className="text-white text-xs font-bold">L{item.level}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              sx={{
                '& .MuiPaginationItem-root': {
                  color: '#D3D9D4',
                  '&.Mui-selected': {
                    backgroundColor: '#5865F2',
                    '&:hover': {
                      backgroundColor: '#4752C4',
                    },
                  },
                  '&:hover': {
                    backgroundColor: '#2E3944',
                  },
                },
              }}
            />
          </div>
        )}
      </div>

      {/* Trade History Modal */}
      {showHistoryModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#212A31] rounded-lg border border-[#2E3944] max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start sm:items-center justify-between p-4 sm:p-6 border-b border-[#2E3944] gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-semibold text-muted">Trade History</h2>
                <p className="text-sm text-muted opacity-75 truncate">{selectedItem.title}</p>
              </div>
              <button
                onClick={closeHistoryModal}
                className="text-muted hover:text-white transition-colors flex-shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */} 
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {selectedItem.history && selectedItem.history.length > 0 ? (
                <div className="space-y-4">
                  {(() => {
                    // Process history to show actual trades between users
                    const history = selectedItem.history.slice().reverse();
                    
                    // If there's only one history entry, hide it (user obtained the item)
                    if (history.length === 1) {
                      return (
                        <div className="text-center py-8">
                          <p className="text-muted">This item has no trade history.</p>
                        </div>
                      );
                    }
                    
                    // Group history into trades between users
                    const trades = [];
                    for (let i = 0; i < history.length - 1; i++) {
                      const toUser = history[i];
                      const fromUser = history[i + 1];
                      trades.push({
                        fromUser,
                        toUser,
                        tradeNumber: history.length - i - 1
                      });
                    }
                    
                    return (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted mb-4">
                          <span>Total Trades: {trades.length}</span>
                        </div>
                        
                        <div className="space-y-3">
                          {trades.map((trade) => (
                            <div
                              key={`${trade.fromUser.UserId}-${trade.toUser.UserId}-${trade.toUser.TradeTime}`}
                              className="p-3 bg-[#2E3944] rounded-lg border border-[#37424D]"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {/* From User */}
                                      <div className="flex items-center gap-2">
                                        {robloxAvatars && robloxAvatars[trade.fromUser.UserId.toString()] && (
                                          <Image
                                            src={robloxAvatars[trade.fromUser.UserId.toString()]}
                                            alt="User Avatar"
                                            width={24}
                                            height={24}
                                            className="rounded-full bg-[#212A31] border border-[#2E3944] flex-shrink-0"
                                          />
                                        )}
                                        <a
                                          href={`https://www.roblox.com/users/${trade.fromUser.UserId}/profile`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-300 hover:text-blue-400 hover:underline transition-colors font-medium truncate"
                                        >
                                          {robloxUsers && robloxUsers[trade.fromUser.UserId.toString()]
                                            ? (robloxUsers[trade.fromUser.UserId.toString()].displayName || robloxUsers[trade.fromUser.UserId.toString()].name || trade.fromUser.UserId.toString())
                                            : trade.fromUser.UserId.toString()}
                                        </a>
                                      </div>
                                      
                                      {/* Trade Arrow */}
                                      <span className="text-muted text-sm">→</span>
                                      
                                      {/* To User */}
                                      <div className="flex items-center gap-2">
                                        {robloxAvatars && robloxAvatars[trade.toUser.UserId.toString()] && (
                                          <Image
                                            src={robloxAvatars[trade.toUser.UserId.toString()]}
                                            alt="User Avatar"
                                            width={24}
                                            height={24}
                                            className="rounded-full bg-[#212A31] border border-[#2E3944] flex-shrink-0"
                                          />
                                        )}
                                        <a
                                          href={`https://www.roblox.com/users/${trade.toUser.UserId}/profile`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-300 hover:text-blue-400 hover:underline transition-colors font-medium truncate"
                                        >
                                          {robloxUsers && robloxUsers[trade.toUser.UserId.toString()]
                                            ? (robloxUsers[trade.toUser.UserId.toString()].displayName || robloxUsers[trade.toUser.UserId.toString()].name || trade.toUser.UserId.toString())
                                            : trade.toUser.UserId.toString()}
                                        </a>
                                      </div>

                                    </div>
                                    <p className="text-sm text-muted opacity-75 mt-1">
                                      {formatDate(trade.toUser.TradeTime)}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right sm:text-left sm:ml-auto">
                                  <div className="text-sm text-muted">Trade #{trade.tradeNumber}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted">No trade history available for this item.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-[#2E3944]">
              <button
                onClick={closeHistoryModal}
                className="px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

