'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CommentData } from '@/utils/api';
import { UserData } from '@/types/auth';
import { DiscordIcon } from '@/components/Icons/DiscordIcon';
import { ChatBubbleLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import Breadcrumb from '@/components/Layout/Breadcrumb';
import ChangelogComments from '@/components/PageComments/ChangelogComments';
import { deleteTradeAd } from '@/utils/trading';
import toast from 'react-hot-toast';
import TradeItemsImages from '@/components/trading/TradeItemsImages';
import TradeItemsWithValues from '@/components/trading/TradeItemsWithValues';
import { TradeAd } from '@/types/trading';
import TradeUserProfile from '@/components/trading/TradeUserProfile';
import TradeAdMetadata from '@/components/trading/TradeAdMetadata';
import { ConfirmDialog } from '@/components/UI/ConfirmDialog';
import { useAuthContext } from '@/contexts/AuthContext';
// Removed MUI Tabs in favor of calculator-style tabs

interface TradeDetailsClientProps {
  trade: TradeAd;
  initialComments?: CommentData[];
  initialUserMap?: Record<string, UserData>;
}

export default function TradeDetailsClient({
  trade,
  initialComments = [],
  initialUserMap = {},
}: TradeDetailsClientProps) {
  const discordChannelId = '1398359394726449352';
  const discordGuildId = '1286064050135896064';
  const router = useRouter();
  const { user } = useAuthContext();
  const currentUserId = user?.id || null;
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showOfferConfirm, setShowOfferConfirm] = useState(false);
  const [offerStatus, setOfferStatus] = useState<{
    loading: boolean;
    error: string | null;
    success: boolean;
  }>({
    loading: false,
    error: null,
    success: false,
  });
  const [activeTab, setActiveTab] = useState<'items' | 'comments'>('items');

  const handleMakeOffer = async () => {
    try {
      setOfferStatus({ loading: true, error: null, success: false });

      if (!currentUserId) {
        toast.error('You must be logged in to make an offer', {
          duration: 3000,
          position: 'bottom-right',
        });
        setOfferStatus({
          loading: false,
          error: 'You must be logged in to make an offer',
          success: false,
        });
        return;
      }

      const response = await fetch(`/api/trades/offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: trade?.id,
        }),
      });

      if (response.status === 409) {
        toast.error('You have already made an offer for this trade', {
          duration: 3000,
          position: 'bottom-right',
        });
        setOfferStatus({
          loading: false,
          error: 'You have already made an offer for this trade',
          success: false,
        });
      } else if (response.status === 403) {
        toast.error("The trade owner's settings do not allow direct messages", {
          duration: 3000,
          position: 'bottom-right',
        });
        setOfferStatus({
          loading: false,
          error: "The trade owner's settings do not allow direct messages",
          success: false,
        });
      } else if (!response.ok) {
        throw new Error('Failed to create offer');
      } else {
        toast.success('Offer sent successfully!', {
          duration: 3000,
          position: 'bottom-right',
        });
        setOfferStatus({
          loading: false,
          error: null,
          success: true,
        });
      }
    } catch (err) {
      console.error('Error creating offer:', err);
      toast.error('Failed to create offer. Please try again.', {
        duration: 3000,
        position: 'bottom-right',
      });
      setOfferStatus({
        loading: false,
        error: 'Failed to create offer. Please try again.',
        success: false,
      });
    }
  };

  const handleDelete = async () => {
    if (!trade) return;

    try {
      setIsDeleting(true);
      await deleteTradeAd(trade.id);
      toast.success('Trade ad deleted successfully');
      router.push('/trading');
    } catch (error) {
      console.error('Error deleting trade ad:', error);
      toast.error('Failed to delete trade ad');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Breadcrumb />
      <div className="container mx-auto mb-16">
        {/* Trade Card */}
        <div className="border-border-primary bg-secondary-bg rounded-lg border">
          {/* Header */}
          <div className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex w-full flex-col sm:flex-row sm:items-center sm:justify-between">
                      <h1 className="text-primary-text text-2xl font-bold">Trade #{trade.id}</h1>
                      <div className="mt-4 flex flex-col gap-2 sm:mt-0 sm:flex-row">
                        {trade && trade.status === 'Pending' && trade.author !== currentUserId && (
                          <button
                            onClick={() => setShowOfferConfirm(true)}
                            disabled={offerStatus.loading}
                            className={`flex items-center gap-1 rounded-lg px-3 py-1 text-sm transition-colors ${
                              offerStatus.loading
                                ? 'text-secondary-text cursor-not-allowed'
                                : offerStatus.success
                                  ? 'bg-status-success text-form-button-text hover:bg-status-success/80'
                                  : 'bg-button-info text-form-button-text hover:bg-button-info-hover'
                            }`}
                          >
                            <ChatBubbleLeftIcon className="h-4 w-4" />
                            {offerStatus.loading
                              ? 'Making Offer...'
                              : offerStatus.success
                                ? 'Offer Sent!'
                                : 'Make Offer'}
                          </button>
                        )}
                        {trade.author === currentUserId && (
                          <button
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={isDeleting}
                            className={`flex items-center gap-1 rounded-lg px-3 py-1 text-sm transition-colors ${
                              isDeleting
                                ? 'bg-status-error/50 text-form-button-text cursor-not-allowed'
                                : 'bg-status-error text-form-button-text hover:bg-status-error/80 cursor-pointer'
                            }`}
                          >
                            <TrashIcon className="h-4 w-4" />
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                        {/* View in Discord Button */}
                        {trade.message_id && (
                          <a
                            href={`https://discord.com/channels/${discordGuildId}/${discordChannelId}/${trade.message_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-button-info text-form-button-text hover:bg-button-info-hover flex items-center gap-1 rounded-lg px-3 py-1 text-sm transition-colors"
                          >
                            <DiscordIcon className="h-4 w-4" />
                            View in Discord
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <TradeAdMetadata
                      status={trade.status}
                      created_at={trade.created_at}
                      expires={trade.expires}
                    />
                  </div>
                </div>
              </div>
              {trade.user && <TradeUserProfile user={trade.user} />}
            </div>
          </div>

          {/* Trade Items */}
          <div className="p-6">
            {/* Item Images */}
            <TradeItemsImages offering={trade.offering} requesting={trade.requesting} />

            {/* Tabs - calculator style */}
            <div className="bg-primary-bg mb-6 rounded-lg p-4">
              <div className="flex flex-col space-y-1 rounded-lg p-1 sm:flex-row sm:space-y-0 sm:space-x-1">
                <button
                  onClick={() => setActiveTab('items')}
                  className={`${
                    activeTab === 'items'
                      ? 'bg-button-info text-form-button-text shadow-sm'
                      : 'text-secondary-text hover:bg-button-info/20 hover:text-primary-text hover:cursor-pointer'
                  } flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-all duration-200 sm:flex-1`}
                >
                  Items & Values
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`${
                    activeTab === 'comments'
                      ? 'bg-button-info text-form-button-text shadow-sm'
                      : 'text-secondary-text hover:bg-button-info/20 hover:text-primary-text hover:cursor-pointer'
                  } flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-all duration-200 sm:flex-1`}
                >
                  Comments
                </button>
              </div>
            </div>
            {/* Tab Content */}
            {activeTab === 'items' ? (
              <TradeItemsWithValues offering={trade.offering} requesting={trade.requesting} />
            ) : (
              <ChangelogComments
                changelogId={trade.id}
                changelogTitle={`Trade #${trade.id}`}
                type="trade"
                trade={trade}
                initialComments={initialComments}
                initialUserMap={initialUserMap}
              />
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Delete Trade Ad"
          message="Are you sure you want to delete this trade ad? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          confirmButtonClass="bg-status-error text-form-button-text hover:bg-status-error-hover"
        />

        {/* Offer Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showOfferConfirm}
          onClose={() => setShowOfferConfirm(false)}
          onConfirm={handleMakeOffer}
          title="Make Trade Offer"
          message={`Are you sure you want to make an offer for Trade #${trade.id}? This will notify ${trade.user?.username || 'the trade owner'} about your interest in trading for their ${trade.offering.length} items.`}
          confirmText="Make Offer"
          cancelText="Cancel"
          confirmButtonClass="bg-button-info text-form-button-text hover:bg-button-info-hover"
        />
      </div>
    </>
  );
}
