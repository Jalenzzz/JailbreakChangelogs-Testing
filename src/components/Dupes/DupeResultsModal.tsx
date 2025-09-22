'use client';

import React, { useEffect, useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { PUBLIC_API_URL } from '@/utils/api';
import Link from 'next/link';
import { formatTimestamp, formatRelativeDate } from '@/utils/timestamp';
import ReportDupeModal from './ReportDupeModal';

interface DupeResult {
  item_id: number;
  owner: string;
  user_id: number | null;
  proof: string | null;
  created_at: number;
}

interface ItemDetails {
  id: number;
  name: string;
  type: string;
  creator: string;
  is_seasonal: number;
  cash_value: string;
  duped_value: string;
  price: string;
  is_limited: number;
  notes: string;
  demand: string;
  description: string;
  health: number;
  tradable: number;
  last_updated: number;
  children?: Array<{
    id: number;
    parent: number;
    sub_name: string;
    created_at: number;
    data: {
      name: string;
      type: string;
      creator: string;
      is_seasonal: number | null;
      cash_value: string;
      duped_value: string;
      price: string;
      is_limited: number | null;
      duped_owners: string;
      notes: string;
      demand: string;
      description: string;
      health: number;
      tradable: boolean;
      last_updated: number;
    };
  }>;
}

interface Suggestion {
  message: string;
  suggestedName: string;
  similarity: number;
}

interface DupeResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: DupeResult[];
  loading: boolean;
  error: string | null;
  suggestion: Suggestion | null;
  ownerName: string;
  itemName: string;
  itemId: number;
}

const DupeResultsModal: React.FC<DupeResultsModalProps> = ({
  isOpen,
  onClose,
  results,
  loading,
  error,
  suggestion,
  ownerName,
  itemName,
  itemId,
}) => {
  const [itemDetails, setItemDetails] = useState<ItemDetails[]>([]);
  const [itemLoading, setItemLoading] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const uniqueItemsCount = [...new Set(results.map((result) => result.item_id))].length;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const fetchItemDetails = async () => {
      if (results.length > 0) {
        setItemLoading(true);
        try {
          // Get unique item IDs
          const uniqueItemIds = [...new Set(results.map((result) => result.item_id))];

          const itemPromises = uniqueItemIds.map((itemId) =>
            fetch(`${PUBLIC_API_URL}/items/get?id=${itemId}`).then((res) => res.json()),
          );
          const items = await Promise.all(itemPromises);
          setItemDetails(items);
        } catch (err) {
          console.error('Error fetching item details:', err);
        } finally {
          setItemLoading(false);
        }
      }
    };

    fetchItemDetails();
  }, [results]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        <div className="modal-container bg-secondary-bg border-button-info relative mx-4 w-full max-w-4xl rounded-lg border shadow-lg">
          <div className="modal-header text-primary-text flex items-center justify-between px-6 py-4 text-xl font-semibold">
            <h2>Dupe Check Results</h2>
            <button onClick={onClose} className="text-secondary-text hover:text-primary-text">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="modal-content p-6">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="border-button-info h-8 w-8 animate-spin rounded-full border-b-2" />
              </div>
            )}

            {error && !suggestion && (
              <div className="text-button-danger py-4 text-center">{error}</div>
            )}

            {suggestion && (
              <div className="text-status-warning py-2 text-center">
                <div className="flex flex-col items-center">
                  <ExclamationTriangleIcon className="mb-2 h-12 w-12" />
                  <div>
                    {suggestion.message}
                    <br />
                    Did you mean: <span className="font-bold">{suggestion.suggestedName}</span>? (
                    {suggestion.similarity.toFixed(1)}% match)
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && !suggestion && results.length === 0 && (
              <div className="space-y-4">
                <div className="text-status-success flex flex-col items-center justify-center">
                  <FaCheckCircle className="mb-2 h-12 w-12" />
                  <div className="text-center">
                    <div className="text-secondary-text">No dupes found for {ownerName}</div>
                    {itemName && (
                      <div className="text-secondary-text">No dupe record found for {itemName}</div>
                    )}
                  </div>
                </div>
                {itemName && (
                  <div className="flex justify-center">
                    <button
                      disabled
                      className="bg-button-secondary text-secondary-text border-button-secondary cursor-not-allowed rounded-lg border px-4 py-2"
                    >
                      Report {itemName} as duped (Disabled)
                    </button>
                  </div>
                )}
              </div>
            )}

            {!loading && !error && results.length > 0 && (
              <div className="space-y-4">
                {/* Header */}
                <div className="bg-button-danger/10 border-button-danger/20 rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <FaExclamationCircle className="text-button-danger h-6 w-6 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-primary-text text-lg font-semibold">
                        {uniqueItemsCount} Dupe Item{uniqueItemsCount !== 1 ? 's' : ''} Found
                      </h3>
                      <p className="text-secondary-text text-sm">
                        Owner:{' '}
                        <span className="text-primary-text font-medium">{results[0].owner}</span>
                      </p>
                      <p className="text-secondary-text mt-1 text-xs">
                        Last recorded dupe:{' '}
                        <span className="text-primary-text font-medium">
                          {formatTimestamp(
                            results.reduce((latest, current) =>
                              current.created_at > latest.created_at ? current : latest,
                            ).created_at,
                            {
                              format: 'long',
                            },
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {itemLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="border-button-info h-6 w-6 animate-spin rounded-full border-b-2" />
                  </div>
                ) : (
                  itemDetails.length > 0 && (
                    <div className="space-y-4">
                      {/* Items List */}
                      <div className="space-y-2">
                        <h4 className="text-primary-text text-sm font-medium">Dupe Items:</h4>
                        <div className="max-h-[300px] space-y-2 overflow-y-auto">
                          {itemDetails
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((item, index) => {
                              // Find the corresponding dupe result for this item to get the date
                              const dupeResult = results.find(
                                (result) => result.item_id === item.id,
                              );
                              return (
                                <Link
                                  key={`${item.id}-${index}`}
                                  href={`/item/${encodeURIComponent(item.type)}/${encodeURIComponent(item.name)}`}
                                  className="border-stroke bg-secondary-bg/50 hover:border-button-info hover:bg-primary-bg flex items-center justify-between rounded-lg border p-3 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex flex-col">
                                      <div className="flex items-center gap-2">
                                        <span className="text-primary-text font-medium">
                                          {item.name}
                                        </span>
                                        <span className="border-primary-text text-primary-text flex items-center rounded-full border bg-transparent px-2 py-0.5 text-xs">
                                          {item.type}
                                        </span>
                                      </div>
                                      {dupeResult && (
                                        <span className="text-secondary-text text-xs">
                                          Reported {formatRelativeDate(dupeResult.created_at)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-secondary-text text-xs">View Details</div>
                                </Link>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {itemName && (
        <ReportDupeModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          itemName={itemName.split(' [')[0]}
          itemType={itemName.match(/\[(.*?)\]/)?.[1] || ''}
          ownerName={ownerName}
          itemId={itemId}
          isOwnerNameReadOnly={true}
        />
      )}
    </>
  );
};

export default DupeResultsModal;
