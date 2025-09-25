'use client';

import React, { useState, useEffect } from 'react';
import { TradeAd } from '@/types/trading';
import { UserData } from '@/types/auth';
import { TradeItem } from '@/types/trading';
import { TradeAdCard } from './TradeAdCard';
import { TradeAdTabs } from './TradeAdTabs';
import { Pagination, Button } from '@mui/material';
import { Masonry } from '@mui/lab';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';
import { deleteTradeAd } from '@/utils/trading';
import toast from 'react-hot-toast';
import { TradeAdForm } from './TradeAdForm';
import { ConfirmDialog } from '@/components/UI/ConfirmDialog';
import { useAuthContext } from '@/contexts/AuthContext';

interface TradeAdsProps {
  initialTradeAds: (TradeAd & { user: UserData | null })[];
  initialItems?: TradeItem[];
}

export default function TradeAds({ initialTradeAds, initialItems = [] }: TradeAdsProps) {
  const { user } = useAuthContext();
  const [tradeAds, setTradeAds] =
    useState<(TradeAd & { user: UserData | null })[]>(initialTradeAds);
  const [items] = useState<TradeItem[]>(initialItems);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'view' | 'create' | 'edit'>('view');
  const [offerStatuses, setOfferStatuses] = useState<
    Record<number, { loading: boolean; error: string | null; success: boolean }>
  >({});
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedTradeAd, setSelectedTradeAd] = useState<TradeAd | null>(null);
  const [showOfferConfirm, setShowOfferConfirm] = useState<number | null>(null);
  const itemsPerPage = 6;

  // Get current user ID from auth state
  const currentUserId = user?.id || null;

  const getDemandForItem = (it: TradeItem): string | undefined => {
    if (it.demand) return it.demand;
    if (it.data?.demand) return it.data.demand;
    const match = items.find((base) => base.id === it.id);
    if (!match) return undefined;
    const subName = it.sub_name as string | undefined;
    if (subName && Array.isArray(match.children)) {
      const child = match.children.find((c) => c.sub_name === subName);
      if (child?.data?.demand) return child.data.demand;
    }
    return match.demand;
  };

  const getTrendForItem = (it: TradeItem): string | undefined => {
    if (it.trend && it.trend !== 'N/A') return it.trend;
    const dataTrend = it.data?.trend;
    if (dataTrend && dataTrend !== 'N/A') return dataTrend;
    const match = items.find((base) => base.id === it.id);
    if (!match) return undefined;
    const subName = it.sub_name as string | undefined;
    if (subName && Array.isArray(match.children)) {
      const child = match.children.find((c) => c.sub_name === subName);
      const childTrend = child?.data?.trend;
      if (childTrend && childTrend !== 'N/A') return childTrend;
    }
    return match.trend ?? undefined;
  };

  const refreshTradeAds = async () => {
    try {
      setError(null);

      // Clear the hash before reloading to avoid staying on create/edit tabs
      window.location.hash = '';
      // Simple refresh - just reload the page to get fresh server-side data
      window.location.reload();
    } catch (err) {
      console.error('Error refreshing trade ads:', err);
      setError('Failed to refresh trade ads');
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'create' || hash === 'edit') {
        setActiveTab(hash);
      } else {
        setActiveTab('view');
      }
    };

    // Handle initial hash
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleTabChange = (tab: 'view' | 'create' | 'edit') => {
    setActiveTab(tab);
    if (tab === 'view') {
      window.history.pushState(null, '', window.location.pathname);
    } else {
      window.location.hash = tab;
    }
  };

  const handleMakeOffer = async (tradeId: number) => {
    try {
      setOfferStatuses((prev) => ({
        ...prev,
        [tradeId]: { loading: true, error: null, success: false },
      }));

      if (!currentUserId) {
        toast.error('You must be logged in to make an offer', {
          duration: 3000,
          position: 'bottom-right',
        });
        setOfferStatuses((prev) => ({
          ...prev,
          [tradeId]: {
            loading: false,
            error: 'You must be logged in to make an offer',
            success: false,
          },
        }));
        return;
      }

      const response = await fetch('/api/trades/offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: tradeId }),
      });

      if (response.status === 409) {
        toast.error('You have already made an offer for this trade', {
          duration: 3000,
          position: 'bottom-right',
        });
        setOfferStatuses((prev) => ({
          ...prev,
          [tradeId]: {
            loading: false,
            error: 'You have already made an offer for this trade',
            success: false,
          },
        }));
      } else if (response.status === 403) {
        toast.error("The trade owner's settings do not allow direct messages", {
          duration: 3000,
          position: 'bottom-right',
        });
        setOfferStatuses((prev) => ({
          ...prev,
          [tradeId]: {
            loading: false,
            error: "The trade owner's settings do not allow direct messages",
            success: false,
          },
        }));
      } else if (!response.ok) {
        throw new Error('Failed to create offer');
      } else {
        toast.success('Offer sent successfully!', {
          duration: 3000,
          position: 'bottom-right',
        });
        setOfferStatuses((prev) => ({
          ...prev,
          [tradeId]: {
            loading: false,
            error: null,
            success: true,
          },
        }));
      }
    } catch (err) {
      console.error('Error creating offer:', err);
      toast.error('Failed to create offer. Please try again.', {
        duration: 3000,
        position: 'bottom-right',
      });
      setOfferStatuses((prev) => ({
        ...prev,
        [tradeId]: {
          loading: false,
          error: 'Failed to create offer. Please try again.',
          success: false,
        },
      }));
    } finally {
      setShowOfferConfirm(null);
    }
  };

  const handleOfferClick = async (tradeId: number) => {
    setShowOfferConfirm(tradeId);
  };

  const handleDeleteTrade = async (tradeId: number) => {
    try {
      // Remove the trade from the list immediately to prevent UI flicker
      setTradeAds((prevAds) => prevAds.filter((ad) => ad.id !== tradeId));
      await deleteTradeAd(tradeId);
      toast.success('Trade ad deleted successfully');
    } catch (error) {
      console.error('Error deleting trade ad:', error);
      toast.error('Failed to delete trade ad');
      // Refresh the trade ads list to ensure consistency
      refreshTradeAds();
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'));
    setPage(1); // Reset to first page when changing sort order
  };

  const handleEditTrade = (trade: TradeAd) => {
    setSelectedTradeAd(trade);
    setActiveTab('edit');
  };

  const userTradeAds = tradeAds.filter((trade) => trade.author === currentUserId);

  if (error) {
    return (
      <div className="mt-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (tradeAds.length === 0) {
    return (
      <div className="mt-8">
        <TradeAdTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          hasTradeAds={userTradeAds.length > 0}
        />
        {activeTab === 'view' && (
          <div className="mb-8 rounded-lg border p-6 text-center">
            <h3 className="text-tertiary-text mb-4 text-lg font-medium">No Trade Ads Available</h3>
            <p className="text-tertiary-text/70 mb-8">This page seems empty at the moment.</p>
            <div className="flex justify-center gap-4">
              <Button
                variant="contained"
                onClick={refreshTradeAds}
                sx={{
                  backgroundColor: 'var(--color-button-info)',
                  '&:hover': {
                    backgroundColor: 'var(--color-button-info-hover)',
                  },
                }}
              >
                Refresh List
              </Button>
              <Button
                variant="contained"
                onClick={() => handleTabChange('create')}
                sx={{
                  backgroundColor: 'var(--color-button-info)',
                  '&:hover': {
                    backgroundColor: 'var(--color-button-info-hover)',
                  },
                }}
              >
                Create A Trade Ad
              </Button>
            </div>
          </div>
        )}
        {activeTab === 'create' && (
          <TradeAdForm
            onSuccess={() => {
              refreshTradeAds();
              window.history.pushState(null, '', window.location.pathname);
              setActiveTab('view');
              setSelectedTradeAd(null);
            }}
            editMode={false}
            items={items}
          />
        )}
      </div>
    );
  }

  const sortedTradeAds = [...tradeAds]
    .filter((trade) => trade.user && trade.user.roblox_id && trade.user.roblox_username)
    .sort((a, b) => {
      return sortOrder === 'newest' ? b.created_at - a.created_at : a.created_at - b.created_at;
    });

  // Calculate pagination
  const totalPages = Math.ceil(sortedTradeAds.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageItems = sortedTradeAds.slice(startIndex, endIndex);

  return (
    <div className="mt-8">
      <TradeAdTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        hasTradeAds={userTradeAds.length > 0}
      />

      {activeTab === 'view' ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-secondary-text">
              Showing {sortedTradeAds.length}{' '}
              {sortedTradeAds.length === 1 ? 'trade ad' : 'trade ads'}
            </p>
            <button
              onClick={toggleSortOrder}
              className="border-border-primary hover:border-border-focus bg-button-info text-form-button-text hover:bg-button-info-hover flex cursor-pointer items-center gap-1 rounded-lg border px-3 py-1.5 text-sm transition-colors"
            >
              {sortOrder === 'newest' ? (
                <ArrowDownIcon className="h-4 w-4" />
              ) : (
                <ArrowUpIcon className="h-4 w-4" />
              )}
              {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
            </button>
          </div>
          <Masonry
            columns={{ xs: 1, sm: 2, md: 2, lg: 3 }}
            spacing={2}
            sx={{ width: 'auto', margin: 0 }}
          >
            {currentPageItems.map((trade) => {
              const enrichedTrade: TradeAd = {
                ...trade,
                offering: trade.offering.map((it) => ({
                  ...it,
                  demand: getDemandForItem(it) || it.demand,
                  trend: getTrendForItem(it) || it.trend,
                })),
                requesting: trade.requesting.map((it) => ({
                  ...it,
                  demand: getDemandForItem(it) || it.demand,
                  trend: getTrendForItem(it) || it.trend,
                })),
              };
              return (
                <TradeAdCard
                  key={trade.id}
                  trade={enrichedTrade}
                  onMakeOffer={() => handleOfferClick(trade.id)}
                  offerStatus={offerStatuses[trade.id]}
                  currentUserId={currentUserId}
                  onDelete={() => handleDeleteTrade(trade.id)}
                  onEdit={() => handleEditTrade(trade)}
                />
              );
            })}
          </Masonry>
          {totalPages > 1 && (
            <div className="mt-8 mb-8 flex justify-center">
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: 'var(--color-primary-text)',
                    '&.Mui-selected': {
                      backgroundColor: 'var(--color-button-info)',
                      color: 'var(--color-form-button-text)',
                      '&:hover': {
                        backgroundColor: 'var(--color-button-info-hover)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'var(--color-quaternary-bg)',
                    },
                  },
                  '& .MuiPaginationItem-icon': {
                    color: 'var(--color-primary-text)',
                  },
                }}
              />
            </div>
          )}
        </>
      ) : activeTab === 'edit' && !selectedTradeAd ? (
        <div className="border-border-primary bg-secondary-bg mb-8 rounded-lg border p-6 text-center">
          <p className="text-secondary-text mb-4">
            Please click the edit button on the trade ad you want to modify
          </p>
          <Button
            variant="contained"
            onClick={() => handleTabChange('view')}
            sx={{
              backgroundColor: 'var(--color-button-info)',
              color: 'var(--color-form-button-text)',
              '&:hover': {
                backgroundColor: 'var(--color-button-info-hover)',
              },
            }}
          >
            Back to View
          </Button>
        </div>
      ) : (
        <TradeAdForm
          onSuccess={() => {
            refreshTradeAds();
            window.history.pushState(null, '', window.location.pathname);
            setActiveTab('view');
            setSelectedTradeAd(null);
          }}
          editMode={activeTab === 'edit'}
          tradeAd={selectedTradeAd || undefined}
          items={items}
        />
      )}

      {/* Offer Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showOfferConfirm !== null}
        onClose={() => setShowOfferConfirm(null)}
        onConfirm={() => showOfferConfirm !== null && handleMakeOffer(showOfferConfirm)}
        title="Make Trade Offer"
        message={
          showOfferConfirm !== null
            ? `Are you sure you want to make an offer for Trade #${showOfferConfirm}? This will notify ${tradeAds.find((t) => t.id === showOfferConfirm)?.user?.username || 'the trade owner'} about your interest in trading for their ${tradeAds.find((t) => t.id === showOfferConfirm)?.offering.length || 0} items.`
            : ''
        }
        confirmText="Make Offer"
        cancelText="Cancel"
        confirmButtonClass="bg-button-info hover:bg-button-info-hover"
      />
    </div>
  );
}
