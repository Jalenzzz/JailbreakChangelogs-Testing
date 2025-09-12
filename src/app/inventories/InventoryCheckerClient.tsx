'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
} from '@heroicons/react/24/outline';
import { fetchMissingRobloxData, fetchOriginalOwnerAvatars } from './actions';
import { fetchItems } from '@/utils/api';
import { RobloxUser, Item } from '@/types';
import SearchForm from '@/components/Inventory/SearchForm';
import UserStats from '@/components/Inventory/UserStats';
import InventoryItems from '@/components/Inventory/InventoryItems';

interface TradeHistoryEntry {
  UserId: number;
  TradeTime: number;
}

interface InventoryItem {
  tradePopularMetric: number | null;
  item_id: number;
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
  originalSearchTerm?: string;
  robloxUsers?: Record<string, RobloxUser>;
  robloxAvatars?: Record<string, string>;
  error?: string;
  isLoading?: boolean;
}

export default function InventoryCheckerClient({
  initialData,
  robloxId,
  originalSearchTerm,
  robloxUsers: initialRobloxUsers,
  robloxAvatars: initialRobloxAvatars,
  error,
  isLoading: externalIsLoading,
}: InventoryCheckerClientProps) {
  const [searchId, setSearchId] = useState(originalSearchTerm || robloxId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const progressiveLoadingRef = useRef<Set<string>>(new Set());
  const loadedPagesRef = useRef<Set<number>>(new Set());
  const preloadingPagesRef = useRef<Set<number>>(new Set());
  const [robloxUsers, setRobloxUsers] = useState<Record<string, RobloxUser>>(
    initialRobloxUsers || {},
  );
  const [robloxAvatars, setRobloxAvatars] = useState(initialRobloxAvatars || {});
  const [itemsData, setItemsData] = useState<Item[]>([]);
  const [loadingUserIds, setLoadingUserIds] = useState<Set<string>>(new Set());
  const [tradeSortOrder, setTradeSortOrder] = useState<'newest' | 'oldest'>('newest');

  const router = useRouter();

  // Helper function to get user display name with progressive loading
  const getUserDisplay = useCallback(
    (userId: string) => {
      const user = robloxUsers[userId] || initialRobloxUsers?.[userId];
      return user?.displayName || user?.name || userId;
    },
    [robloxUsers, initialRobloxUsers],
  );

  // Helper function to get user avatar with progressive loading
  const getUserAvatar = useCallback(
    (userId: string) => {
      const avatar = robloxAvatars[userId] || initialRobloxAvatars?.[userId];
      return avatar && typeof avatar === 'string' && avatar.trim() !== '' ? avatar : null;
    },
    [robloxAvatars, initialRobloxAvatars],
  );

  // Progressive loading of missing user data (only for trade history users)
  const fetchMissingUserData = useCallback(
    async (userIds: string[]) => {
      const missingIds = userIds.filter((id) => !robloxUsers[id] && !initialRobloxUsers?.[id]);

      if (missingIds.length === 0) {
        return;
      }

      // Check if we're already loading these IDs
      const newIds = missingIds.filter((id) => !progressiveLoadingRef.current.has(id));
      if (newIds.length === 0) {
        return;
      }

      // Mark as loading
      newIds.forEach((id) => progressiveLoadingRef.current.add(id));

      // Update loading state for UI
      setLoadingUserIds((prev) => {
        const newSet = new Set(prev);
        newIds.forEach((id) => newSet.add(id));
        return newSet;
      });

      try {
        const result = await fetchMissingRobloxData(newIds);

        // Update state with new user data immediately
        if (result.userData && typeof result.userData === 'object') {
          setRobloxUsers((prev) => ({ ...prev, ...result.userData }));
        }

        // Update state with new avatar data immediately
        if (result.avatarData && typeof result.avatarData === 'object') {
          setRobloxAvatars((prev) => ({ ...prev, ...result.avatarData }));
        }
      } catch (error) {
        console.error('[INVENTORY] Failed to fetch missing user data:', error);
      } finally {
        // Remove from loading set
        newIds.forEach((id) => progressiveLoadingRef.current.delete(id));

        // Update loading state for UI
        setLoadingUserIds((prev) => {
          const newSet = new Set(prev);
          newIds.forEach((id) => newSet.delete(id));
          return newSet;
        });
      }
    },
    [robloxUsers, initialRobloxUsers, setRobloxUsers, setRobloxAvatars],
  );

  // Fetch avatars for trade history users (not original owners since they're loaded server-side)
  const fetchTradeHistoryAvatarsData = useCallback(
    async (userIds: string[]) => {
      const missingIds = userIds.filter((id) => !robloxAvatars[id] && !initialRobloxAvatars?.[id]);

      if (missingIds.length === 0) {
        return;
      }

      // Check if we're already loading these IDs
      const newIds = missingIds.filter((id) => !progressiveLoadingRef.current.has(id));
      if (newIds.length === 0) {
        return;
      }

      // Mark as loading
      newIds.forEach((id) => progressiveLoadingRef.current.add(id));

      // Update loading state for UI
      setLoadingUserIds((prev) => {
        const newSet = new Set(prev);
        newIds.forEach((id) => newSet.add(id));
        return newSet;
      });

      try {
        const avatarData = await fetchOriginalOwnerAvatars(newIds);

        // Update state with new avatar data
        if (avatarData && typeof avatarData === 'object') {
          setRobloxAvatars((prev) => ({ ...prev, ...avatarData }));
        }
      } catch (error) {
        console.error('[INVENTORY] Failed to fetch trade history avatars:', error);
      } finally {
        // Remove from loading set
        newIds.forEach((id) => progressiveLoadingRef.current.delete(id));

        // Update loading state for UI
        setLoadingUserIds((prev) => {
          const newSet = new Set(prev);
          newIds.forEach((id) => newSet.delete(id));
          return newSet;
        });
      }
    },
    [robloxAvatars, initialRobloxAvatars, setRobloxAvatars],
  );

  // Fetch items data for value calculations
  useEffect(() => {
    const loadItemsData = async () => {
      try {
        const items = await fetchItems();
        setItemsData(items);
      } catch (error) {
        console.error('Failed to fetch items data:', error);
      }
    };

    if (initialData?.data && initialData.data.length > 0) {
      loadItemsData();
    }
  }, [initialData]);

  // Progressive loading for trade history users and missing original owners
  const loadPageData = useCallback(
    (pageNumber: number, isPreload = false) => {
      if (!initialData?.data || initialData.data.length === 0) return;

      // Check if we've already loaded this page
      if (loadedPagesRef.current.has(pageNumber)) {
        return;
      }

      // Check if we're already preloading this page
      if (isPreload && preloadingPagesRef.current.has(pageNumber)) {
        return;
      }

      const itemsPerPage = 20;

      // Calculate which items are on the current page
      const startIndex = (pageNumber - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentPageItems = initialData.data.slice(startIndex, endIndex);

      const userIdsToLoad: string[] = [];
      const avatarIdsToLoad: string[] = [];

      // Collect user IDs from both trade history and original owners
      currentPageItems.forEach((item) => {
        // Check original owner data
        const originalOwnerInfo = item.info.find((info) => info.title === 'Original Owner');
        if (originalOwnerInfo && originalOwnerInfo.value && /^\d+$/.test(originalOwnerInfo.value)) {
          const originalOwnerId = originalOwnerInfo.value;
          const hasUserData = robloxUsers[originalOwnerId] || initialRobloxUsers?.[originalOwnerId];
          const hasAvatarData =
            robloxAvatars[originalOwnerId] || initialRobloxAvatars?.[originalOwnerId];

          if (!hasUserData) {
            userIdsToLoad.push(originalOwnerId);
          }
          if (!hasAvatarData) {
            avatarIdsToLoad.push(originalOwnerId);
          }
        }

        // Check trade history users
        if (item.history && item.history.length > 0) {
          item.history.forEach((trade) => {
            if (trade.UserId) {
              const tradeUserId = trade.UserId.toString();
              // Check if we already have this user's data
              const hasUserData = robloxUsers[tradeUserId] || initialRobloxUsers?.[tradeUserId];
              const hasAvatarData =
                robloxAvatars[tradeUserId] || initialRobloxAvatars?.[tradeUserId];

              if (!hasUserData) {
                userIdsToLoad.push(tradeUserId);
              }

              if (!hasAvatarData) {
                avatarIdsToLoad.push(tradeUserId);
              }
            }
          });
        }
      });

      // Remove duplicates
      const uniqueUserIds = [...new Set(userIdsToLoad)];
      const uniqueAvatarIds = [...new Set(avatarIdsToLoad)];

      // Mark this page as loaded or preloading
      if (isPreload) {
        preloadingPagesRef.current.add(pageNumber);
      } else {
        loadedPagesRef.current.add(pageNumber);
      }

      // Only fetch if we have IDs to load
      if (uniqueUserIds.length > 0) {
        fetchMissingUserData(uniqueUserIds);
      }

      if (uniqueAvatarIds.length > 0) {
        fetchTradeHistoryAvatarsData(uniqueAvatarIds);
      }
    },
    [
      initialData?.data,
      robloxUsers,
      initialRobloxUsers,
      robloxAvatars,
      initialRobloxAvatars,
      fetchMissingUserData,
      fetchTradeHistoryAvatarsData,
    ],
  );

  // Preload next page for smoother experience
  const preloadNextPage = useCallback(
    (currentPage: number) => {
      if (!initialData?.data || initialData.data.length === 0) return;

      const itemsPerPage = 20;
      const totalPages = Math.ceil(initialData.data.length / itemsPerPage);
      const nextPage = currentPage + 1;

      // Only preload if next page exists and we haven't loaded it yet
      if (
        nextPage <= totalPages &&
        !loadedPagesRef.current.has(nextPage) &&
        !preloadingPagesRef.current.has(nextPage)
      ) {
        loadPageData(nextPage, true);
      }
    },
    [initialData?.data, loadPageData],
  );

  // Load data for page 1 initially and preload page 2 - but only after itemsData is loaded for sorting
  useEffect(() => {
    if (initialData?.data && initialData.data.length > 0 && itemsData.length > 0) {
      loadPageData(1);
      // Preload page 2 for smoother experience
      setTimeout(() => preloadNextPage(1), 1000);
    }
  }, [initialData?.data, itemsData, loadPageData, preloadNextPage]);

  // Enhanced page change handler with preloading
  const handlePageChangeWithPreload = useCallback(
    (pageNumber: number) => {
      // Load current page data
      loadPageData(pageNumber);

      // Preload next page for smoother experience
      setTimeout(() => preloadNextPage(pageNumber), 500);
    },
    [loadPageData, preloadNextPage],
  );

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
  }, [initialData, error]);

  // Sync with external loading state
  useEffect(() => {
    setIsLoading(externalIsLoading || false);
  }, [externalIsLoading]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowHistoryModal(true);

    // Load Roblox data for history users if not already loaded
    if (item.history && item.history.length > 0) {
      const historyUserIds: string[] = [];
      const historyAvatarIds: string[] = [];

      item.history.forEach((trade) => {
        if (trade.UserId) {
          const tradeUserId = trade.UserId.toString();

          // Check if we need user data
          const hasUserData = robloxUsers[tradeUserId] || initialRobloxUsers?.[tradeUserId];
          if (!hasUserData) {
            historyUserIds.push(tradeUserId);
          }

          // Check if we need avatar data
          const hasAvatarData = robloxAvatars[tradeUserId] || initialRobloxAvatars?.[tradeUserId];
          if (!hasAvatarData) {
            historyAvatarIds.push(tradeUserId);
          }
        }
      });

      // Remove duplicates
      const uniqueUserIds = [...new Set(historyUserIds)];
      const uniqueAvatarIds = [...new Set(historyAvatarIds)];

      // Load missing data
      if (uniqueUserIds.length > 0) {
        fetchMissingUserData(uniqueUserIds);
      }

      if (uniqueAvatarIds.length > 0) {
        fetchTradeHistoryAvatarsData(uniqueAvatarIds);
      }
    }
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedItem(null);
  };

  const toggleTradeSortOrder = () => {
    setTradeSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'));
  };

  if (isLoading || externalIsLoading) {
    return (
      <SearchForm
        searchId={searchId}
        setSearchId={setSearchId}
        handleSearch={handleSearch}
        isLoading={isLoading}
        externalIsLoading={externalIsLoading || false}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <SearchForm
        searchId={searchId}
        setSearchId={setSearchId}
        handleSearch={handleSearch}
        isLoading={isLoading}
        externalIsLoading={externalIsLoading || false}
      />

      {/* Error Display */}
      {error && !initialData && (
        <div className="rounded-lg border border-[#2E3944] bg-[#212A31] p-6 shadow-sm">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-red-500/10 p-3">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
              </div>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-red-400">
              Unable to Fetch Inventory Data
            </h3>
            <p className="text-gray-300">{error}</p>
          </div>
        </div>
      )}

      {/* User Stats and Inventory Items - Only show when no error and has data */}
      {!error && initialData && (
        <>
          {/* User Stats */}
          <UserStats
            initialData={initialData}
            robloxUsers={robloxUsers}
            robloxAvatars={robloxAvatars}
            itemsData={itemsData}
          />

          {/* Inventory Items */}
          <InventoryItems
            initialData={initialData}
            robloxUsers={robloxUsers}
            robloxAvatars={robloxAvatars}
            onItemClick={handleItemClick}
            itemsData={itemsData}
            onPageChange={handlePageChangeWithPreload}
          />

          {/* Trade History Modal */}
          {selectedItem && (
            <Dialog open={showHistoryModal} onClose={closeHistoryModal} className="relative z-50">
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

              <div className="fixed inset-0 flex items-center justify-center p-4">
                <div className="mx-auto max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-lg border border-[#2E3944] bg-[#212A31]">
                  {/* Modal Header */}
                  <div className="border-b border-[#2E3944] p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-4 sm:items-center">
                      <div className="min-w-0 flex-1">
                        <Dialog.Title className="text-muted text-lg font-semibold sm:text-xl">
                          Trade History
                        </Dialog.Title>
                        <p className="text-muted truncate text-sm opacity-75">
                          {selectedItem.title} ({selectedItem.categoryTitle})
                        </p>
                        {selectedItem.history && selectedItem.history.length > 1 && (
                          <p className="text-muted mt-1 text-xs opacity-75">
                            Total Trades: {selectedItem.history.length - 1}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={closeHistoryModal}
                        className="text-muted rounded-full p-1 hover:bg-[#2E3944] hover:text-white"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                    {/* Sort button - below on mobile, inline on desktop */}
                    {selectedItem.history && selectedItem.history.length > 1 && (
                      <div className="mt-3 flex justify-start">
                        <button
                          onClick={toggleTradeSortOrder}
                          className="flex items-center gap-1 rounded-lg border border-[#2E3944] bg-[#37424D] px-3 py-1.5 text-sm text-white transition-colors hover:bg-[#2E3944]"
                        >
                          {tradeSortOrder === 'newest' ? (
                            <ArrowDownIcon className="h-4 w-4" />
                          ) : (
                            <ArrowUpIcon className="h-4 w-4" />
                          )}
                          {tradeSortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Modal Content */}
                  <div className="max-h-[60vh] overflow-y-auto p-6">
                    {selectedItem.history && selectedItem.history.length > 0 ? (
                      <div className="space-y-4">
                        {(() => {
                          // Process history to show actual trades between users
                          const history = selectedItem.history.slice().reverse();

                          // If there's only one history entry, hide it (user obtained the item)
                          if (history.length === 1) {
                            return (
                              <div className="py-8 text-center">
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
                              tradeNumber: history.length - i - 1,
                            });
                          }

                          // Sort trades based on sort order
                          const sortedTrades = [...trades].sort((a, b) => {
                            const dateA = a.toUser.TradeTime;
                            const dateB = b.toUser.TradeTime;
                            return tradeSortOrder === 'newest' ? dateB - dateA : dateA - dateB;
                          });

                          return (
                            <>
                              {loadingUserIds.size > 0 && (
                                <div className="mb-4 flex items-center justify-center gap-2 text-blue-400">
                                  <svg
                                    className="h-4 w-4 animate-spin"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  <span className="text-sm">Loading user profiles...</span>
                                </div>
                              )}

                              <div className="space-y-3">
                                {sortedTrades.map((trade, index) => {
                                  return (
                                    <div
                                      key={`${trade.fromUser.UserId}-${trade.toUser.UserId}-${trade.toUser.TradeTime}`}
                                      className={`rounded-lg border p-3 ${
                                        (tradeSortOrder === 'newest' && index === 0) ||
                                        (tradeSortOrder === 'oldest' &&
                                          index === sortedTrades.length - 1)
                                          ? 'border-[#124E66] bg-[#1A5F7A] shadow-lg'
                                          : 'border-[#37424D] bg-[#2E3944]'
                                      }`}
                                    >
                                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                              {/* From User */}
                                              <div className="flex items-center gap-2">
                                                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[#2E3944] bg-[#212A31]">
                                                  {getUserAvatar(
                                                    trade.fromUser.UserId.toString(),
                                                  ) ? (
                                                    <Image
                                                      src={
                                                        getUserAvatar(
                                                          trade.fromUser.UserId.toString(),
                                                        )!
                                                      }
                                                      alt="User Avatar"
                                                      width={24}
                                                      height={24}
                                                      className="rounded-full"
                                                    />
                                                  ) : (
                                                    <svg
                                                      className="text-muted h-3 w-3"
                                                      fill="none"
                                                      stroke="currentColor"
                                                      viewBox="0 0 24 24"
                                                    >
                                                      <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                      />
                                                    </svg>
                                                  )}
                                                </div>
                                                <a
                                                  href={`https://www.roblox.com/users/${trade.fromUser.UserId}/profile`}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="truncate font-medium text-blue-300 transition-colors hover:text-blue-400 hover:underline"
                                                >
                                                  {getUserDisplay(trade.fromUser.UserId.toString())}
                                                </a>
                                              </div>

                                              {/* Arrow */}
                                              <div className="text-muted flex items-center gap-1">
                                                <svg
                                                  className="h-4 w-4"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                  />
                                                </svg>
                                                <span className="text-xs">
                                                  Trade #{trade.tradeNumber}
                                                </span>
                                              </div>

                                              {/* To User */}
                                              <div className="flex items-center gap-2">
                                                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[#2E3944] bg-[#212A31]">
                                                  {getUserAvatar(trade.toUser.UserId.toString()) ? (
                                                    <Image
                                                      src={
                                                        getUserAvatar(
                                                          trade.toUser.UserId.toString(),
                                                        )!
                                                      }
                                                      alt="User Avatar"
                                                      width={24}
                                                      height={24}
                                                      className="rounded-full"
                                                    />
                                                  ) : (
                                                    <svg
                                                      className="text-muted h-3 w-3"
                                                      fill="none"
                                                      stroke="currentColor"
                                                      viewBox="0 0 24 24"
                                                    >
                                                      <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                      />
                                                    </svg>
                                                  )}
                                                </div>
                                                <a
                                                  href={`https://www.roblox.com/users/${trade.toUser.UserId}/profile`}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="truncate font-medium text-blue-300 transition-colors hover:text-blue-400 hover:underline"
                                                >
                                                  {getUserDisplay(trade.toUser.UserId.toString())}
                                                </a>
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Trade Date */}
                                        <div className="text-muted flex-shrink-0 text-sm">
                                          {formatDate(trade.toUser.TradeTime)}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-muted">This item has no trade history.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Dialog>
          )}
        </>
      )}
    </div>
  );
}
