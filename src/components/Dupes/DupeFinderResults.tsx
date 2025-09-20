'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { DupeFinderItem, RobloxUser, Item } from '@/types';
import { UserConnectionData } from '@/app/inventories/types';
import { fetchItems } from '@/utils/api';
import { parseCurrencyValue } from '@/utils/currency';
import ItemActionModal from '@/components/Modals/ItemActionModal';
import TradeHistoryModal from '@/components/Modals/TradeHistoryModal';
import DisplayAd from '@/components/Ads/DisplayAd';
import AdRemovalNotice from '@/components/Ads/AdRemovalNotice';
import { useAuthContext } from '@/contexts/AuthContext';
import { logError } from '@/services/logger';
import DupeUserInfo from './DupeUserInfo';
import DupeFilters from './DupeFilters';
import DupeItemsGrid from './DupeItemsGrid';
import DupeSearchInput from './DupeSearchInput';

interface DupeFinderResultsProps {
  initialData: DupeFinderItem[];
  robloxId: string;
  robloxUsers: Record<string, RobloxUser>;
  robloxAvatars: Record<string, string>;
  userConnectionData: UserConnectionData | null;
}

export default function DupeFinderResults({
  initialData,
  robloxId,
  robloxUsers,
  robloxAvatars,
  userConnectionData,
}: DupeFinderResultsProps) {
  // State management
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
  const [selectedItem, setSelectedItem] = useState<DupeFinderItem | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedItemForAction, setSelectedItemForAction] = useState<DupeFinderItem | null>(null);
  const [itemsData, setItemsData] = useState<Item[]>([]);
  const [totalDupedValue, setTotalDupedValue] = useState<number>(0);

  const { user } = useAuthContext();
  const currentUserPremiumType = user?.premiumtype || 0;
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
      if (!user) return userId;
      return user.name || userId;
    },
    [localRobloxUsers],
  );

  const getUserAvatar = useCallback(
    (userId: string) => {
      return localRobloxAvatars[userId] || '';
    },
    [localRobloxAvatars],
  );

  const getDupedValueForItem = useCallback((itemData: Item, dupeItem: DupeFinderItem): number => {
    let dupedValue = parseCurrencyValue(itemData.duped_value);

    if ((isNaN(dupedValue) || dupedValue <= 0) && itemData.children) {
      const createdAtInfo = dupeItem.info.find((info) => info.title === 'Created At');
      const createdYear = createdAtInfo
        ? new Date(createdAtInfo.value).getFullYear().toString()
        : null;

      const matchingChild = createdYear
        ? itemData.children.find(
            (child) =>
              child.sub_name === createdYear &&
              child.data &&
              child.data.duped_value &&
              child.data.duped_value !== 'N/A' &&
              child.data.duped_value !== null,
          )
        : null;

      if (matchingChild) {
        dupedValue = parseCurrencyValue(matchingChild.data.duped_value);
      } else {
        // If no matching year found, fall back to first child with valid duped value
        const childWithDupedValue = itemData.children.find(
          (child) =>
            child.data &&
            child.data.duped_value &&
            child.data.duped_value !== 'N/A' &&
            child.data.duped_value !== null,
        );

        if (childWithDupedValue) {
          dupedValue = parseCurrencyValue(childWithDupedValue.data.duped_value);
        }
      }
    }

    return isNaN(dupedValue) ? 0 : dupedValue;
  }, []);

  // Effects
  useEffect(() => {
    setLocalRobloxUsers(robloxUsers);
    setLocalRobloxAvatars(robloxAvatars);
  }, [robloxUsers, robloxAvatars]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategories, sortOrder]);

  // Fetch items data
  useEffect(() => {
    const fetchItemsData = async () => {
      try {
        const items = await fetchItems();
        setItemsData(items);
      } catch (error) {
        logError('Error fetching items data', error, {
          component: 'DupeFinderResults',
          action: 'fetchItemsData',
        });
      }
    };

    fetchItemsData();
  }, [initialData]);

  // Calculate total duped value
  useEffect(() => {
    const calculateTotalDupedValue = () => {
      try {
        let totalDuped = 0;
        const itemMap = new Map(itemsData.map((item) => [item.id, item]));

        initialData.forEach((dupeItem) => {
          const itemData = itemMap.get(dupeItem.item_id);
          if (itemData) {
            const dupedValue = getDupedValueForItem(itemData, dupeItem);
            if (!isNaN(dupedValue) && dupedValue > 0) {
              totalDuped += dupedValue;
            }
          }
        });

        setTotalDupedValue(totalDuped);
      } catch (error) {
        logError('Error calculating duped value', error, {
          component: 'DupeFinderResults',
          action: 'calculateTotalDupedValue',
        });
        setTotalDupedValue(0);
      }
    };

    calculateTotalDupedValue();
  }, [initialData, itemsData, getDupedValueForItem]);

  // Filter and sort logic
  const filteredData = useMemo(() => {
    return initialData.filter((item) => {
      const itemData = itemsData.find((data) => data.id === item.item_id);
      if (!itemData) return false;

      const matchesSearch =
        searchTerm === '' ||
        itemData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        itemData.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categoryTitle.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(item.categoryTitle);

      return matchesSearch && matchesCategory;
    });
  }, [initialData, searchTerm, selectedCategories, itemsData]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      switch (sortOrder) {
        case 'duplicates':
          const aKey = `${a.categoryTitle}-${a.title}`;
          const bKey = `${b.categoryTitle}-${b.title}`;
          const aCount = filteredData.filter(
            (item) => `${item.categoryTitle}-${item.title}` === aKey,
          ).length;
          const bCount = filteredData.filter(
            (item) => `${item.categoryTitle}-${item.title}` === bKey,
          ).length;
          if (aCount > 1 && bCount === 1) return -1;
          if (aCount === 1 && bCount > 1) return 1;
          const itemNameCompare = a.title.localeCompare(b.title);
          if (itemNameCompare !== 0) return itemNameCompare;
          const aCreated = a.info.find((info) => info.title === 'Created At')?.value;
          const bCreated = b.info.find((info) => info.title === 'Created At')?.value;
          if (aCreated && bCreated) {
            const aDate = new Date(aCreated);
            const bDate = new Date(bCreated);
            if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
              return aDate.getTime() - bDate.getTime();
            }
          }
          return 0;
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

  // Check if there are any duplicates
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

  // Create maps for duplicate tracking
  const itemCounts = useMemo(() => {
    const counts = new Map<string, number>();
    paginatedData.forEach((item) => {
      const key = `${item.categoryTitle}-${item.title}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
  }, [paginatedData]);

  const duplicateOrders = useMemo(() => {
    const orders = new Map<string, number>();
    const itemGroups = new Map<string, DupeFinderItem[]>();

    // Group items by name
    paginatedData.forEach((item) => {
      const key = `${item.categoryTitle}-${item.title}`;
      if (!itemGroups.has(key)) {
        itemGroups.set(key, []);
      }
      itemGroups.get(key)!.push(item);
    });

    // Sort each group by creation date and assign order numbers
    itemGroups.forEach((items) => {
      if (items.length > 1) {
        items.sort((a, b) => {
          const aCreated = a.info.find((info) => info.title === 'Created At')?.value;
          const bCreated = b.info.find((info) => info.title === 'Created At')?.value;
          if (aCreated && bCreated) {
            return new Date(aCreated).getTime() - new Date(bCreated).getTime();
          }
          return 0;
        });

        items.forEach((item, index) => {
          orders.set(item.id, index);
        });
      }
    });

    return orders;
  }, [paginatedData]);

  // Event handlers
  const handleCardClick = (item: DupeFinderItem) => {
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

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <DupeSearchInput />

      {/* User Info */}
      <div
        className={`grid gap-6 ${currentUserPremiumType === 0 ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}
      >
        <div className={`${currentUserPremiumType === 0 ? 'lg:col-span-2' : ''}`}>
          <DupeUserInfo
            robloxId={robloxId}
            userConnectionData={userConnectionData}
            getUserDisplay={getUserDisplay}
            getUsername={getUsername}
            getUserAvatar={getUserAvatar}
            dupeItemsCount={initialData.length}
            totalDupedValue={totalDupedValue}
          />
        </div>

        {/* Ad - Takes up 1/3 of the space, only show for non-premium users */}
        {currentUserPremiumType === 0 && (
          <div className="flex flex-col lg:col-span-1">
            <div
              className="relative h-full overflow-hidden rounded-lg border border-[#2E3944] bg-[#1a2127] shadow transition-all duration-300"
              style={{ minHeight: '250px' }}
            >
              <span className="text-muted absolute top-2 left-2 z-10 rounded bg-[#212A31] px-2 py-0.5 text-xs">
                Advertisement
              </span>
              <DisplayAd
                adSlot="9566904102"
                adFormat="auto"
                style={{ display: 'block', width: '100%', height: '100%' }}
              />
            </div>
            <AdRemovalNotice className="mt-2" />
          </div>
        )}
      </div>

      {/* Filters */}
      <DupeFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        sortOrder={sortOrder}
        setSortOrder={(order) => setSortOrder(order as typeof sortOrder)}
        initialData={initialData}
        hasDuplicates={hasDuplicates}
      />

      {/* Items Grid */}
      <div className="rounded-lg border border-[#2E3944] bg-[#212A31] p-6 shadow-sm">
        <h2 className="text-muted mb-4 text-xl font-semibold">Duplicate Items</h2>

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

        <DupeItemsGrid
          paginatedData={paginatedData}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          getUserDisplay={getUserDisplay}
          getUserAvatar={getUserAvatar}
          getDupedValueForItem={getDupedValueForItem}
          onCardClick={handleCardClick}
          itemCounts={itemCounts}
          duplicateOrders={duplicateOrders}
          itemsData={itemsData}
        />
      </div>

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
