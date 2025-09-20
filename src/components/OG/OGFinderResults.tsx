'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RobloxUser } from '@/types';
import { UserConnectionData } from '@/app/inventories/types';
import { fetchMissingRobloxData } from '@/app/inventories/actions';
import DisplayAd from '@/components/Ads/DisplayAd';
import AdRemovalNotice from '@/components/Ads/AdRemovalNotice';
import { useAuthContext } from '@/contexts/AuthContext';
import OGFinderFAQ from './OGFinderFAQ';
import SearchForm from './SearchForm';
import ItemActionModal from '@/components/Modals/ItemActionModal';
import TradeHistoryModal from '@/components/Modals/TradeHistoryModal';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { logError } from '@/services/logger';
import OGUserInfo from './OGUserInfo';
import OGFilters from './OGFilters';
import OGItemsGrid from './OGItemsGrid';

interface OGItem {
  tradePopularMetric: number;
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
  user_id: string;
  logged_at: number;
  history?: string | Array<{ UserId: number; TradeTime: number }>;
}

interface OGSearchData {
  results: OGItem[];
  count: number;
  search_id: string;
  search_time: number;
}

interface OGFinderResultsProps {
  initialData: OGSearchData | null;
  robloxId: string;
  robloxUsers: Record<string, RobloxUser>;
  robloxAvatars: Record<string, string>;
  userConnectionData: UserConnectionData | null;
  error?: string;
}

export default function OGFinderResults({
  initialData,
  robloxId,
  robloxUsers,
  robloxAvatars,
  userConnectionData,
  error,
}: OGFinderResultsProps) {
  const router = useRouter();
  const { user } = useAuthContext();
  const currentUserPremiumType = user?.premiumtype || 0;

  // State management
  const [searchId, setSearchId] = useState(robloxId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<
    | 'alpha-asc'
    | 'alpha-desc'
    | 'traded-desc'
    | 'unique-desc'
    | 'created-asc'
    | 'created-desc'
    | 'duplicates'
  >('created-desc');

  const [page, setPage] = useState(1);
  const [localRobloxUsers, setLocalRobloxUsers] = useState<Record<string, RobloxUser>>(robloxUsers);
  const [localRobloxAvatars, setLocalRobloxAvatars] =
    useState<Record<string, string>>(robloxAvatars);
  const localRobloxUsersRef = useRef(localRobloxUsers);
  const localRobloxAvatarsRef = useRef(localRobloxAvatars);
  const [selectedItem, setSelectedItem] = useState<OGItem | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedItemForAction, setSelectedItemForAction] = useState<OGItem | null>(null);

  const itemsPerPage = 20;

  // Helper functions
  const getUserDisplay = useCallback(
    (userId: string) => {
      const user = localRobloxUsers[userId];
      return user?.displayName || user?.name || userId;
    },
    [localRobloxUsers],
  );

  const getUsername = useCallback(
    (userId: string) => {
      const user = localRobloxUsers[userId];
      return user?.name || userId;
    },
    [localRobloxUsers],
  );

  const getUserAvatar = useCallback(
    (userId: string) => {
      return localRobloxAvatars[userId] || '';
    },
    [localRobloxAvatars],
  );

  // Fetch missing user data function
  const fetchMissingUserData = useCallback(
    async (userIds: string[]) => {
      // Filter out users that are already available
      const missingIds = userIds.filter((id) => !localRobloxUsers[id] && !robloxUsers[id]);

      if (missingIds.length === 0) {
        return;
      }

      try {
        const { userData, avatarData } = await fetchMissingRobloxData(missingIds);

        if (userData && Object.keys(userData).length > 0) {
          setLocalRobloxUsers((prev) => ({ ...prev, ...userData }));
        }

        if (avatarData && Object.keys(avatarData).length > 0) {
          setLocalRobloxAvatars((prev) => ({ ...prev, ...avatarData }));
        }
      } catch (error) {
        console.error('Failed to fetch missing user data:', error);
      }
    },
    [robloxUsers, localRobloxUsers],
  );

  // Effects
  useEffect(() => {
    setLocalRobloxUsers(robloxUsers);
    setLocalRobloxAvatars(robloxAvatars);
    localRobloxUsersRef.current = robloxUsers;
    localRobloxAvatarsRef.current = robloxAvatars;
  }, [robloxUsers, robloxAvatars]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategories, sortOrder]);

  // Handle search
  const handleSearch = async (searchValue: string) => {
    if (!searchValue.trim()) return;

    setIsLoading(true);
    try {
      router.push(`/og/${searchValue}`);
    } catch (error) {
      logError('Search error', error, { component: 'OGFinderResults', action: 'handleSearch' });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort logic
  const filteredData = useMemo(() => {
    if (!initialData?.results) return [];

    return initialData.results.filter((item) => {
      const matchesSearch =
        searchTerm === '' ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categoryTitle.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(item.categoryTitle);

      return matchesSearch && matchesCategory;
    });
  }, [initialData?.results, searchTerm, selectedCategories]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      switch (sortOrder) {
        case 'duplicates':
          // Group duplicates together and sort alphabetically by item name, then by duplicate number
          const aKey = `${a.categoryTitle}-${a.title}`;
          const bKey = `${b.categoryTitle}-${b.title}`;

          // Count how many of each item exist
          const aCount = filteredData.filter(
            (item) => `${item.categoryTitle}-${item.title}` === aKey,
          ).length;
          const bCount = filteredData.filter(
            (item) => `${item.categoryTitle}-${item.title}` === bKey,
          ).length;

          // Prioritize duplicates (items with count > 1) over singles
          if (aCount > 1 && bCount === 1) return -1; // a is duplicate, b is single
          if (aCount === 1 && bCount > 1) return 1; // a is single, b is duplicate

          // If both are duplicates or both are singles, sort by item name alphabetically
          const itemNameCompare = a.title.localeCompare(b.title);
          if (itemNameCompare !== 0) return itemNameCompare;

          // If same item name, sort by logged date (oldest first) to match duplicate numbering
          return a.logged_at - b.logged_at;
        case 'alpha-asc':
          return a.title.localeCompare(b.title);
        case 'alpha-desc':
          return b.title.localeCompare(a.title);
        case 'traded-desc':
          return b.timesTraded - a.timesTraded;
        case 'unique-desc':
          return b.uniqueCirculation - a.uniqueCirculation;
        case 'created-asc':
          return a.logged_at - b.logged_at;
        case 'created-desc':
          return b.logged_at - a.logged_at;
        default:
          return 0;
      }
    });
  }, [filteredData, sortOrder]);

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, page, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(sortedData.length / itemsPerPage);
  }, [sortedData.length, itemsPerPage]);

  // Check if there are any duplicates in the filtered data
  const hasDuplicates = useMemo(() => {
    const itemCounts = new Map<string, number>();
    filteredData.forEach((item) => {
      const key = `${item.categoryTitle}-${item.title}`;
      itemCounts.set(key, (itemCounts.get(key) || 0) + 1);
    });
    return Array.from(itemCounts.values()).some((count) => count > 1);
  }, [filteredData]);

  // Reset sort order if duplicates option is selected but no duplicates exist
  useEffect(() => {
    if (sortOrder === 'duplicates' && !hasDuplicates) {
      setSortOrder('created-desc');
    }
  }, [sortOrder, hasDuplicates]);

  // Progressive loading for user data
  useEffect(() => {
    if (!initialData?.results || initialData.results.length === 0) return;

    const userIdsToLoad: string[] = [];

    // Add main user ID if missing
    if (robloxId && !localRobloxUsers[robloxId]) {
      userIdsToLoad.push(robloxId);
    }

    // Add current owner IDs from current page items
    paginatedData.forEach((item) => {
      if (item.user_id && /^\d+$/.test(item.user_id)) {
        const user = localRobloxUsers[item.user_id];
        if (!user?.displayName && !user?.name) {
          userIdsToLoad.push(item.user_id);
        }
      }
    });

    // Fetch missing user data if any (deduplicate arrays)
    if (userIdsToLoad.length > 0) {
      const uniqueUserIds = [...new Set(userIdsToLoad)];
      fetchMissingUserData(uniqueUserIds);
    }
  }, [initialData?.results, paginatedData, fetchMissingUserData, localRobloxUsers, robloxId]);

  // Event handlers
  const handleCardClick = (item: OGItem) => {
    setSelectedItemForAction(item);
    setShowActionModal(true);
  };

  const handleViewTradeHistory = () => {
    if (selectedItemForAction) {
      setSelectedItem(selectedItemForAction);
      setShowHistoryModal(true);
      setShowActionModal(false);
    }
  };

  const closeActionModal = () => {
    setShowActionModal(false);
    setSelectedItemForAction(null);
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedItem(null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Create a map to track duplicate items
  const itemCounts = useMemo(() => {
    const counts = new Map<string, number>();
    paginatedData.forEach((item: OGItem) => {
      const key = `${item.categoryTitle}-${item.title}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
  }, [paginatedData]);

  // Create a map to track the order of duplicates based on logged date
  const duplicateOrders = useMemo(() => {
    const orders = new Map<string, number>();

    // Group items by name
    const itemGroups = new Map<string, OGItem[]>();
    paginatedData.forEach((item: OGItem) => {
      const key = `${item.categoryTitle}-${item.title}`;
      if (!itemGroups.has(key)) {
        itemGroups.set(key, []);
      }
      itemGroups.get(key)!.push(item);
    });

    // Sort each group by logged date (oldest first) and assign numbers
    itemGroups.forEach((items) => {
      if (items.length > 1) {
        // Sort by logged date (oldest first)
        const sortedItems = items.sort((a, b) => {
          return a.logged_at - b.logged_at;
        });

        // Assign numbers starting from 1
        sortedItems.forEach((item, index) => {
          const uniqueKey = `${item.id}-${item.user_id}-${item.logged_at}`;
          orders.set(uniqueKey, index + 1);
        });
      }
    });

    return orders;
  }, [paginatedData]);

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <SearchForm
        searchId={searchId}
        setSearchId={setSearchId}
        handleSearch={(e) => {
          e.preventDefault();
          handleSearch(searchId);
        }}
        isLoading={isLoading}
        externalIsLoading={false}
      />

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border bg-[#212A31] p-6 shadow-sm">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-red-500/10 p-3">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
              </div>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-red-400">Search Error</h3>
            <p className="text-gray-300">{error}</p>
          </div>
        </div>
      )}

      {/* No Items Found Display */}
      {!error && (!initialData?.results || initialData.results.length === 0) && (
        <>
          <div className="rounded-lg border bg-[#212A31] p-6 shadow-sm">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-red-500/10 p-3">
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-red-400">No OG Items Found</h3>
              <p className="text-gray-300">
                No original items found for this user. Their items may not yet have been logged by
                our bots.
              </p>
            </div>
          </div>
          <OGFinderFAQ />
        </>
      )}

      {/* User Info and Results - Only show when no error and has data */}
      {!error && initialData?.results && initialData.results.length > 0 && (
        <>
          {/* User Info with Side-by-Side Layout */}
          <div
            className={`grid gap-6 ${currentUserPremiumType === 0 ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}
          >
            {/* User Information - Takes up full width for premium users, 2/3 for non-premium */}
            <div className={`${currentUserPremiumType === 0 ? 'lg:col-span-2' : ''}`}>
              <OGUserInfo
                robloxId={robloxId}
                userConnectionData={userConnectionData}
                getUserDisplay={getUserDisplay}
                getUsername={getUsername}
                getUserAvatar={getUserAvatar}
                originalItemsCount={initialData?.count || 0}
              />
            </div>

            {/* Ad - Takes up 1/3 of the space, only show for non-premium users */}
            {currentUserPremiumType === 0 && (
              <div className="flex flex-col lg:col-span-1">
                <div
                  className="border-stroke bg-secondary-bg relative h-full overflow-hidden rounded-lg border shadow transition-all duration-300"
                  style={{ minHeight: '250px' }}
                >
                  <span className="text-secondary-text border-stroke bg-primary-bg absolute top-2 left-2 z-10 rounded border px-2 py-0.5 text-xs">
                    Ad
                  </span>
                  <DisplayAd
                    adSlot="2726163589"
                    adFormat="auto"
                    style={{ display: 'block', width: '100%', height: '100%' }}
                  />
                </div>
                <AdRemovalNotice className="mt-2" />
              </div>
            )}
          </div>

          {/* Filters */}
          <OGFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            sortOrder={sortOrder}
            setSortOrder={(order) => setSortOrder(order as typeof sortOrder)}
            initialData={initialData}
          />

          {/* Items Grid */}
          <div className="rounded-lg border bg-[#212A31] p-6 shadow-sm">
            <h2 className="text-muted mb-4 text-xl font-semibold">OG Items</h2>

            {/* Pro Tip - Only show when there are results */}
            {sortedData.length > 0 && (
              <div className="mb-4 rounded-lg border border-[#5865F2] bg-[#5865F2]/10 p-3">
                <div className="flex items-center gap-2 text-sm text-[#FFFFFF]">
                  <span className="text-[#5865F2]">💡</span>
                  <span className="font-medium">Pro Tip:</span>
                  <span>Click on any item card to view its trading history.</span>
                </div>
              </div>
            )}

            <OGItemsGrid
              paginatedData={paginatedData}
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              getUserDisplay={getUserDisplay}
              getUserAvatar={getUserAvatar}
              onCardClick={handleCardClick}
              itemCounts={itemCounts}
              duplicateOrders={duplicateOrders}
            />
          </div>
        </>
      )}

      {/* Modals */}
      {showActionModal && selectedItemForAction && (
        <ItemActionModal
          isOpen={showActionModal}
          onClose={closeActionModal}
          item={selectedItemForAction}
          onViewTradeHistory={handleViewTradeHistory}
        />
      )}

      {showHistoryModal && selectedItem && (
        <TradeHistoryModal
          isOpen={showHistoryModal}
          onClose={closeHistoryModal}
          item={selectedItem}
          getUserDisplay={getUserDisplay}
          getUserAvatar={getUserAvatar}
          formatDate={(timestamp) => new Date(timestamp * 1000).toLocaleString()}
        />
      )}
    </div>
  );
}
