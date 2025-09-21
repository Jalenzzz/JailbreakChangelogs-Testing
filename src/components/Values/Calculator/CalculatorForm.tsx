'use client';

import React, { useState, useEffect } from 'react';
import { TradeItem } from '@/types/trading';
import { Button, Slider } from '@mui/material';
import { AvailableItemsGrid } from '../../trading/AvailableItemsGrid';
import { ArrowsRightLeftIcon, TrashIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

const Tooltip = dynamic(() => import('@mui/material/Tooltip'), { ssr: false });
import { CustomConfirmationModal } from '../../Modals/CustomConfirmationModal';
import Image from 'next/image';
import { getItemImagePath, handleImageError } from '@/utils/images';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { CiBoxList } from 'react-icons/ci';
import { TradeAdTooltip } from '../../trading/TradeAdTooltip';
import TotalSimilarItems from './TotalSimilarItems';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

/**
 * Parses numeric strings like "1.2m", "450k", "12,345", or "N/A".
 * - Returns 0 for null/undefined/"N/A".
 * - Multiplies suffixes: m -> 1_000_000, k -> 1_000.
 * Used by totals and comparisons; keep in sync with trade forms.
 */
const parseValueString = (valStr: string | number | null | undefined): number => {
  if (valStr === undefined || valStr === null) return 0;
  const cleanedValStr = String(valStr).toLowerCase().replace(/,/g, '');
  if (cleanedValStr === 'n/a') return 0;
  if (cleanedValStr.endsWith('m')) {
    return parseFloat(cleanedValStr) * 1_000_000;
  } else if (cleanedValStr.endsWith('k')) {
    return parseFloat(cleanedValStr) * 1_000;
  } else {
    return parseFloat(cleanedValStr);
  }
};

/** Formats a number with locale separators. */
const formatTotalValue = (total: number): string => {
  if (total === 0) return '0';
  return total.toLocaleString();
};

/**
 * Shared empty-state panel used across tabs.
 * Keep visual style consistent with `CustomConfirmationModal` and other surfaces.
 */
const EmptyState: React.FC<{ message: string; onBrowse: () => void }> = ({ message, onBrowse }) => {
  const handleClick = () => {
    onBrowse();
    // Scroll to items grid after a short delay to ensure tab switch completes
    setTimeout(() => {
      const itemsGrid = document.querySelector('[data-component="available-items-grid"]');
      if (itemsGrid) {
        itemsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="bg-secondary-bg rounded-lg p-12">
      <div className="text-center">
        <div className="mb-4">
          <svg
            className="text-secondary-text/50 mx-auto h-16 w-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 className="text-secondary-text mb-2 text-lg font-medium">No Items Selected</h3>
        <p className="text-secondary-text/70 mb-6">{message}</p>
        <button
          className="bg-button-info text-form-button-text hover:bg-button-info-hover inline-flex items-center gap-2 rounded-lg px-4 py-2 transition-colors hover:cursor-pointer"
          onClick={handleClick}
        >
          <CiBoxList className="h-4 w-4" />
          Browse Items
        </button>
      </div>
    </div>
  );
};

/**
 * Item grid for the calculator.
 * - Groups duplicates by `id` + `sub_name` and shows a quantity badge
 * - Uses a single modal as the action surface (toggle Clean/Duped, remove one/all)
 * - Value type selection is stored per side using `getItemKey`
 */
const CalculatorItemGrid: React.FC<{
  items: TradeItem[];
  onRemove?: (itemId: number, subName?: string) => void;
  onRemoveAll?: (itemId: number, subName?: string) => void;
  onValueTypeChange: (
    itemId: number,
    subName: string | undefined,
    valueType: 'cash' | 'duped',
  ) => void;
  getSelectedValueString: (item: TradeItem) => string;
  getSelectedValueType: (item: TradeItem) => 'cash' | 'duped';
  side?: 'offering' | 'requesting';
}> = ({ items, onRemove, onRemoveAll, onValueTypeChange, getSelectedValueType, side }) => {
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionItem, setActionItem] = useState<(TradeItem & { count?: number }) | null>(null);
  const openActionModal = (item: TradeItem & { count?: number }) => {
    setActionItem(item);
    setActionModalOpen(true);
  };

  const closeActionModal = () => {
    setActionModalOpen(false);
    setActionItem(null);
  };

  useLockBodyScroll(actionModalOpen);

  const groupItems = (items: TradeItem[]) => {
    const grouped = items.reduce(
      (acc, item) => {
        const key = item.sub_name ? `${item.id}-${item.sub_name}` : `${item.id}-base`;

        if (!acc[key]) {
          acc[key] = { ...item, count: 1 };
        } else {
          acc[key].count++;
        }
        return acc;
      },
      {} as Record<string, TradeItem & { count: number }>,
    );

    return Object.values(grouped);
  };

  if (items.length === 0) {
    const handleClick = () => {
      // Switch to items tab
      if (typeof window !== 'undefined') {
        window.location.hash = '';
      }
      // Scroll to items grid after a short delay to ensure tab switch completes
      setTimeout(() => {
        const itemsGrid = document.querySelector('[data-component="available-items-grid"]');
        if (itemsGrid) {
          itemsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    };

    const isOffering = side === 'offering';
    const borderColor = isOffering
      ? 'border-status-success/30 hover:border-status-success/60'
      : 'border-status-error/30 hover:border-status-error/60';

    return (
      <div
        className={`border-stroke bg-secondary-bg hover:bg-secondary-bg/80 cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${borderColor}`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <div className="mb-2">
          <svg
            className="text-secondary-text/50 mx-auto h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
        <p className="text-secondary-text text-sm font-medium">No items selected</p>
        <p className="text-secondary-text/60 mt-1 text-xs">Click to browse items</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg p-4">
      <div className="max-h-[480px] overflow-y-auto pr-1" aria-label="Selected items list">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {groupItems(items).map((item) => {
            const displayName = item.sub_name ? `${item.name} (${item.sub_name})` : item.name;
            const selectedType = getSelectedValueType(item);
            const isDupedSelected = selectedType === 'duped';

            return (
              <div key={`${item.id}-${item.sub_name || 'base'}`} className="group relative">
                <Tooltip
                  title={
                    <TradeAdTooltip
                      item={{
                        ...item,
                        name: displayName,
                        base_name: item.base_name || item.name,
                      }}
                    />
                  }
                  arrow
                  placement="bottom"
                  disableTouchListener
                  slotProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: 'var(--color-secondary-bg)',
                        color: 'var(--color-primary-text)',
                        border: '1px solid var(--color-border-primary)',
                        maxWidth: '400px',
                        width: 'auto',
                        minWidth: '300px',
                        '& .MuiTooltip-arrow': {
                          color: 'var(--color-secondary-bg)',
                        },
                      },
                    },
                  }}
                >
                  <div className="relative aspect-square">
                    <div
                      className="relative h-full w-full cursor-pointer overflow-hidden rounded-lg"
                      onClick={() => openActionModal(item)}
                    >
                      <Image
                        src={getItemImagePath(item.type, item.name, true)}
                        alt={item.name}
                        fill
                        className="object-cover"
                        onError={handleImageError}
                      />
                      {/* Status badge for Clean/Duped selection */}
                      <div
                        className={`text-form-button-text absolute top-1 left-1 rounded-full px-1.5 py-0.5 text-xs ${
                          isDupedSelected
                            ? 'border-status-error bg-status-error'
                            : 'border-status-success bg-status-success'
                        } border`}
                        aria-label={
                          isDupedSelected ? 'Duped value selected' : 'Clean value selected'
                        }
                      >
                        {isDupedSelected ? 'Duped' : 'Clean'}
                      </div>
                      <button
                        type="button"
                        aria-label="Edit item"
                        onClick={(e) => {
                          e.stopPropagation();
                          openActionModal(item);
                        }}
                        className="text-form-button-text absolute right-1 bottom-1 rounded-full border border-white/10 bg-black/50 p-1 hover:bg-black/60"
                      >
                        <EllipsisVerticalIcon className="h-4 w-4" />
                      </button>
                      {item.count > 1 && (
                        <div className="border-primary bg-primary/90 text-primary-foreground absolute top-1 right-1 rounded-full border px-1.5 py-0.5 text-xs">
                          ×{item.count}
                        </div>
                      )}
                      {/* Hover overlay removed; modal handles actions */}
                    </div>
                  </div>
                </Tooltip>
                {/* Inline footer actions removed; actions available via modal */}
              </div>
            );
          })}
        </div>
      </div>
      {/* Legacy context menu removed; modal is the single action surface */}

      {/* Action Modal styled like CustomConfirmationModal */}
      {actionModalOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            aria-hidden="true"
            onClick={closeActionModal}
          />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="modal-container bg-secondary-bg border-button-info mx-auto w-full max-w-sm rounded-lg border p-6 shadow-lg">
              <h2 className="text-primary-text mb-4 text-xl font-semibold">
                {actionItem
                  ? actionItem.sub_name
                    ? `${actionItem.name} (${actionItem.sub_name})`
                    : actionItem.name
                  : 'Item Actions'}
              </h2>
              {actionItem && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="border-primary-text text-primary-text flex items-center rounded-full border bg-transparent px-2 py-0.5 text-xs">
                      {actionItem.type}
                    </span>
                    {actionItem.count && actionItem.count > 1 && (
                      <span className="border-button-info bg-button-info/10 text-form-button-text inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
                        Quantity ×{actionItem.count}
                      </span>
                    )}
                  </div>
                  <div className="px-2 py-1">
                    <div className="flex flex-col gap-2">
                      <label className="flex cursor-pointer items-center gap-2">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={getSelectedValueType(actionItem) === 'cash'}
                            onChange={() => {
                              onValueTypeChange(actionItem.id, actionItem.sub_name, 'cash');
                            }}
                            className="sr-only"
                          />
                          <div
                            className={`border-secondary flex h-4 w-4 items-center justify-center rounded border ${
                              getSelectedValueType(actionItem) === 'cash'
                                ? 'bg-button-info border-button-info'
                                : 'bg-transparent'
                            }`}
                          >
                            {getSelectedValueType(actionItem) === 'cash' && (
                              <svg
                                className="text-form-button-text h-3 w-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className="text-secondary-text text-sm">Clean</span>
                      </label>
                      {actionItem.duped_value && actionItem.duped_value !== 'N/A' ? (
                        <label className="flex cursor-pointer items-center gap-2">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={getSelectedValueType(actionItem) === 'duped'}
                              onChange={() => {
                                onValueTypeChange(actionItem.id, actionItem.sub_name, 'duped');
                              }}
                              className="sr-only"
                            />
                            <div
                              className={`border-secondary flex h-4 w-4 items-center justify-center rounded border ${
                                getSelectedValueType(actionItem) === 'duped'
                                  ? 'bg-button-info border-button-info'
                                  : 'bg-transparent'
                              }`}
                            >
                              {getSelectedValueType(actionItem) === 'duped' && (
                                <svg
                                  className="text-form-button-text h-3 w-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>
                          <span className="text-secondary-text text-sm">Duped</span>
                        </label>
                      ) : (
                        <label className="flex cursor-not-allowed items-center gap-2 opacity-50">
                          <div className="border-secondary flex h-4 w-4 items-center justify-center rounded border bg-transparent">
                            <svg
                              className="text-quaternary-text h-3 w-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <span className="text-quaternary-text text-sm">Duped (N/A)</span>
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={closeActionModal}
                      className="text-secondary-text hover:text-primary-text cursor-pointer rounded border-none bg-transparent px-4 py-2 text-sm"
                    >
                      Close
                    </button>
                    {onRemove && (
                      <>
                        <button
                          onClick={() => {
                            onRemove(actionItem.id, actionItem.sub_name);
                            closeActionModal();
                          }}
                          className="bg-button-info text-form-button-text hover:bg-button-info-hover cursor-pointer rounded border-none px-3 py-2 text-sm"
                        >
                          {actionItem.count && actionItem.count > 1 ? 'Remove one' : 'Remove'}
                        </button>
                        {onRemoveAll && actionItem.count && actionItem.count > 1 && (
                          <button
                            onClick={() => {
                              onRemoveAll(actionItem.id, actionItem.sub_name);
                              closeActionModal();
                            }}
                            className="bg-button-info text-form-button-text hover:bg-button-info-hover cursor-pointer rounded border-none px-3 py-2 text-sm"
                          >
                            Remove all ×{actionItem.count}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Value comparison panel.
 * - Sums grouped items per side using the contributor-selected valuation basis
 * - Displays totals and their difference with directional badge
 * - Renders helpful empty state when no items selected
 */
const CalculatorValueComparison: React.FC<{
  offering: TradeItem[];
  requesting: TradeItem[];
  getSelectedValueString: (item: TradeItem, side: 'offering' | 'requesting') => string;
  getSelectedValue: (item: TradeItem, side: 'offering' | 'requesting') => number;
  getSelectedValueType: (item: TradeItem, side: 'offering' | 'requesting') => 'cash' | 'duped';
  onBrowseItems: () => void;
}> = ({ offering, requesting, getSelectedValue, getSelectedValueType, onBrowseItems }) => {
  const formatCurrencyValue = (value: number): string => {
    return value.toLocaleString();
  };

  const groupItems = (items: TradeItem[]) => {
    const grouped = items.reduce(
      (acc, item) => {
        const key = `${item.id}-${item.sub_name || 'base'}`;
        if (!acc[key]) {
          acc[key] = { ...item, count: 1 };
        } else {
          acc[key].count++;
        }
        return acc;
      },
      {} as Record<string, TradeItem & { count: number }>,
    );
    return Object.values(grouped);
  };

  const offeringTotal = groupItems(offering).reduce(
    (sum, item) => sum + getSelectedValue(item, 'offering') * item.count,
    0,
  );
  const requestingTotal = groupItems(requesting).reduce(
    (sum, item) => sum + getSelectedValue(item, 'requesting') * item.count,
    0,
  );
  const difference = offeringTotal - requestingTotal;

  // Check if there are any items selected
  if (offering.length === 0 && requesting.length === 0) {
    return (
      <EmptyState
        message={'Go to the "Browse Items" tab to select items and compare their values.'}
        onBrowse={onBrowseItems}
      />
    );
  }

  return (
    <div className="bg-secondary-bg border-border-primary hover:border-border-focus hover:shadow-card-shadow overflow-x-auto rounded-lg border p-8 transition-colors duration-200 hover:shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <h3 className="text-primary-text mb-2 text-2xl font-bold">Value Comparison</h3>
        <p className="text-secondary-text text-sm">
          Compare the total values of your offering and requesting items
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Offering Side */}
        <div className="relative">
          {/* Side Header */}
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="bg-status-success h-3 w-3 rounded-full"></div>
                <h4 className="text-primary-text text-lg font-semibold">Offering Side</h4>
              </div>
              <span className="bg-status-success/20 border-status-success/30 text-primary-text rounded-full border px-3 py-1 text-xs font-medium">
                Offering
              </span>
              <span className="bg-primary/10 border-primary/20 text-primary-text rounded-full border px-3 py-1 text-xs font-medium">
                {groupItems(offering).reduce((sum, item) => sum + item.count, 0)} item
                {groupItems(offering).reduce((sum, item) => sum + item.count, 0) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Items Container */}
          <div className="bg-status-success/5 space-y-4 rounded-xl p-6">
            {groupItems(offering).map((item, index, array) => {
              const selectedType = getSelectedValueType(item, 'offering');
              const isDupedSelected = selectedType === 'duped';
              const demand = item.demand ?? item.data?.demand ?? 'N/A';

              return (
                <div
                  key={`${item.id}-${item.sub_name || 'base'}`}
                  className={`bg-status-success/5 hover:bg-status-success/10 rounded-lg p-4 transition-all duration-200 hover:shadow-sm ${
                    index !== array.length - 1 ? 'mb-4' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Item Name */}
                      <div className="mb-3 flex items-center gap-2">
                        <h5 className="text-primary-text text-base font-semibold">
                          {item.sub_name ? `${item.name} (${item.sub_name})` : item.name}
                        </h5>
                        {item.count > 1 && (
                          <span className="bg-status-success/20 border-status-success/30 text-status-success rounded-full border px-2 py-1 text-xs font-medium">
                            ×{item.count}
                          </span>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="space-y-2">
                        {/* Type and Status */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-primary/10 border-primary/30 text-primary-text rounded-lg border px-2 py-1 text-xs font-medium">
                            {item.type}
                          </span>
                          {(item.is_limited === 1 || item.data?.is_limited === 1) && (
                            <span className="bg-primary/10 border-primary/30 text-primary-text rounded-lg border px-2 py-1 text-xs font-medium">
                              Limited
                            </span>
                          )}
                          {(item.is_seasonal === 1 || item.data?.is_seasonal === 1) && (
                            <span className="bg-primary/10 border-primary/30 text-primary-text rounded-lg border px-2 py-1 text-xs font-medium">
                              Seasonal
                            </span>
                          )}
                          <span
                            className={`rounded-lg px-2 py-1 text-xs font-medium ${
                              isDupedSelected
                                ? 'bg-status-error/10 text-primary-text'
                                : 'bg-status-success/10 text-primary-text'
                            }`}
                          >
                            {isDupedSelected ? 'Duped' : 'Clean'}
                          </span>
                        </div>

                        {/* Demand and Trend */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-secondary-bg/30 border-border-primary rounded-lg border p-2">
                            <div className="text-secondary-text mb-1 text-xs">Demand</div>
                            <div className="text-primary-text text-sm font-medium">
                              {demand === 'N/A' ? 'Unknown' : demand}
                            </div>
                          </div>
                          <div className="bg-secondary-bg/30 border-border-primary rounded-lg border p-2">
                            <div className="text-secondary-text mb-1 text-xs">Trend</div>
                            <div className="text-primary-text text-sm font-medium">
                              {!('trend' in item) || item.trend === null || item.trend === 'N/A'
                                ? 'Unknown'
                                : (item.trend as string)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Value */}
                    <div className="ml-4 text-right">
                      <div className="text-primary-text text-lg font-bold">
                        {formatCurrencyValue(getSelectedValue(item, 'offering'))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Total */}
            <div className="bg-status-success/5 mt-4 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-status-success text-base font-semibold">Total</span>
                <div className="text-right">
                  <div className="text-status-success text-xl font-bold">
                    {formatCurrencyValue(offeringTotal)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Requesting Side */}
        <div className="relative">
          {/* Side Header */}
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="bg-status-error h-3 w-3 rounded-full"></div>
                <h4 className="text-primary-text text-lg font-semibold">Requesting Side</h4>
              </div>
              <span className="bg-status-error/20 border-status-error/30 text-primary-text rounded-full border px-3 py-1 text-xs font-medium">
                Requesting
              </span>
              <span className="bg-primary/10 border-primary/20 text-primary-text rounded-full border px-3 py-1 text-xs font-medium">
                {groupItems(requesting).reduce((sum, item) => sum + item.count, 0)} item
                {groupItems(requesting).reduce((sum, item) => sum + item.count, 0) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Items Container */}
          <div className="bg-status-error/5 space-y-4 rounded-xl p-6">
            {groupItems(requesting).map((item, index, array) => {
              const selectedType = getSelectedValueType(item, 'requesting');
              const isDupedSelected = selectedType === 'duped';
              const demand = item.demand ?? item.data?.demand ?? 'N/A';

              return (
                <div
                  key={`${item.id}-${item.sub_name || 'base'}`}
                  className={`bg-status-error/5 hover:bg-status-error/10 rounded-lg p-4 transition-all duration-200 hover:shadow-sm ${
                    index !== array.length - 1 ? 'mb-4' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Item Name */}
                      <div className="mb-3 flex items-center gap-2">
                        <h5 className="text-primary-text text-base font-semibold">
                          {item.sub_name ? `${item.name} (${item.sub_name})` : item.name}
                        </h5>
                        {item.count > 1 && (
                          <span className="bg-status-error/20 border-status-error/30 text-status-error rounded-full border px-2 py-1 text-xs font-medium">
                            ×{item.count}
                          </span>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="space-y-2">
                        {/* Type and Status */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-primary/10 border-primary/30 text-primary-text rounded-lg border px-2 py-1 text-xs font-medium">
                            {item.type}
                          </span>
                          {(item.is_limited === 1 || item.data?.is_limited === 1) && (
                            <span className="bg-primary/10 border-primary/30 text-primary-text rounded-lg border px-2 py-1 text-xs font-medium">
                              Limited
                            </span>
                          )}
                          {(item.is_seasonal === 1 || item.data?.is_seasonal === 1) && (
                            <span className="bg-primary/10 border-primary/30 text-primary-text rounded-lg border px-2 py-1 text-xs font-medium">
                              Seasonal
                            </span>
                          )}
                          <span
                            className={`rounded-lg px-2 py-1 text-xs font-medium ${
                              isDupedSelected
                                ? 'bg-status-error/10 text-primary-text'
                                : 'bg-status-success/10 text-primary-text'
                            }`}
                          >
                            {isDupedSelected ? 'Duped' : 'Clean'}
                          </span>
                        </div>

                        {/* Demand and Trend */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-secondary-bg/30 border-border-primary rounded-lg border p-2">
                            <div className="text-secondary-text mb-1 text-xs">Demand</div>
                            <div className="text-primary-text text-sm font-medium">
                              {demand === 'N/A' ? 'Unknown' : demand}
                            </div>
                          </div>
                          <div className="bg-secondary-bg/30 border-border-primary rounded-lg border p-2">
                            <div className="text-secondary-text mb-1 text-xs">Trend</div>
                            <div className="text-primary-text text-sm font-medium">
                              {!('trend' in item) || item.trend === null || item.trend === 'N/A'
                                ? 'Unknown'
                                : (item.trend as string)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Value */}
                    <div className="ml-4 text-right">
                      <div className="text-primary-text text-lg font-bold">
                        {formatCurrencyValue(getSelectedValue(item, 'requesting'))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Total */}
            <div className="bg-status-error/5 mt-4 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-status-error text-base font-semibold">Total</span>
                <div className="text-right">
                  <div className="text-status-error text-xl font-bold">
                    {formatCurrencyValue(requestingTotal)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Difference */}
      <div className="mt-8">
        <div className="from-primary/3 to-primary/5 rounded-xl bg-gradient-to-r p-6">
          <h4 className="text-primary-text mb-4 text-lg font-semibold">Overall Difference</h4>
          <div className="flex items-center justify-between">
            <span className="text-secondary-text text-base">Value Difference</span>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold ${
                  difference < 0
                    ? 'bg-status-success/10 text-status-success'
                    : difference > 0
                      ? 'bg-status-error/10 text-status-error'
                      : 'bg-secondary-bg/50 text-primary-text'
                }`}
              >
                {difference !== 0 &&
                  (difference < 0 ? (
                    <FaArrowUp className="text-status-success" />
                  ) : (
                    <FaArrowDown className="text-status-error" />
                  ))}
                {formatCurrencyValue(Math.abs(difference))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CalculatorFormProps {
  initialItems?: TradeItem[];
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({ initialItems = [] }) => {
  const [offeringItems, setOfferingItems] = useState<TradeItem[]>([]);
  const [requestingItems, setRequestingItems] = useState<TradeItem[]>([]);
  const [activeTab, setActiveTab] = useState<'items' | 'values' | 'similar'>('items');
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [itemValueTypes, setItemValueTypes] = useState<Record<string, 'cash' | 'duped'>>({});
  const [totalBasis, setTotalBasis] = useState<'offering' | 'requesting'>('offering');
  const [offeringSimilarItemsRange, setOfferingSimilarItemsRange] = useState<number>(2_500_000);
  const [requestingSimilarItemsRange, setRequestingSimilarItemsRange] = useState<number>(2_500_000);
  const MAX_SIMILAR_ITEMS_RANGE = 10_000_000;

  useLockBodyScroll(showClearConfirmModal);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'comparison') {
        setActiveTab('values');
      } else if (hash === 'similar') {
        setActiveTab('similar');
      } else {
        setActiveTab('items');
      }
    };

    // Handle initial hash
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  /**
   * Restore prompt on mount if previously saved items exist in localStorage.
   * invalid JSON clears storage to avoid persistent errors.
   */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('calculatorItems');
      if (saved) {
        const { offering, requesting } = JSON.parse(saved);
        if ((offering && offering.length > 0) || (requesting && requesting.length > 0)) {
          setShowRestoreModal(true);
        }
      }
    } catch (error) {
      console.error('Failed to parse stored calculator items from localStorage:', error);
      localStorage.removeItem('calculatorItems');
    }
  }, []);

  const handleTabChange = (tab: 'items' | 'values' | 'similar') => {
    setActiveTab(tab);
    if (tab === 'values') {
      window.location.hash = 'comparison';
    } else if (tab === 'similar') {
      window.location.hash = 'similar';
    } else {
      const urlWithoutHash = window.location.pathname + window.location.search;
      window.history.replaceState(null, '', urlWithoutHash);
    }
  };

  /**
   * Persist current selections to localStorage so users can resume later.
   * Schema: { offering: TradeItem[], requesting: TradeItem[] }
   */
  useEffect(() => {
    if (offeringItems.length > 0 || requestingItems.length > 0) {
      saveItemsToLocalStorage(offeringItems, requestingItems);
    }
  }, [offeringItems, requestingItems]);

  const saveItemsToLocalStorage = (offering: TradeItem[], requesting: TradeItem[]) => {
    localStorage.setItem('calculatorItems', JSON.stringify({ offering, requesting }));
  };

  const handleRestoreItems = () => {
    const saved = localStorage.getItem('calculatorItems');
    if (saved) {
      try {
        const { offering, requesting } = JSON.parse(saved);
        setOfferingItems(offering || []);
        setRequestingItems(requesting || []);
        setShowRestoreModal(false);
      } catch (error) {
        console.error('Error restoring items:', error);
      }
    }
  };

  const handleStartNew = () => {
    setOfferingItems([]);
    setRequestingItems([]);
    setItemValueTypes({});
    localStorage.removeItem('calculatorItems');
    setShowRestoreModal(false);
    setShowClearConfirmModal(false);
  };

  /**
   * Computes totals and a Clean/Duped breakdown for a given side.
   * Respects per-item selection but coerces to Clean if Duped value is not available.
   */
  const calculateTotals = (items: TradeItem[], side: 'offering' | 'requesting') => {
    let totalValue = 0;
    let cleanSum = 0;
    let dupedSum = 0;
    let cleanCount = 0;
    let dupedCount = 0;

    items.forEach((item) => {
      const itemKey = getItemKey(item.id, item.sub_name, side);
      const rawType = itemValueTypes[itemKey] || 'cash';
      const dupedAvailable = !!(item.duped_value && item.duped_value !== 'N/A');
      const effectiveType = rawType === 'duped' && dupedAvailable ? 'duped' : 'cash';
      const value = parseValueString(effectiveType === 'cash' ? item.cash_value : item.duped_value);
      totalValue += value;
      if (effectiveType === 'duped') {
        dupedSum += value;
        dupedCount += 1;
      } else {
        cleanSum += value;
        cleanCount += 1;
      }
    });

    return {
      cashValue: formatTotalValue(totalValue),
      total: totalValue,
      breakdown: {
        clean: {
          count: cleanCount,
          sum: cleanSum,
          formatted: formatTotalValue(cleanSum),
        },
        duped: {
          count: dupedCount,
          sum: dupedSum,
          formatted: formatTotalValue(dupedSum),
        },
      },
    };
  };

  const handleAddItem = (item: TradeItem, side: 'offering' | 'requesting'): boolean => {
    if (side === 'offering' && offeringItems.length >= 40) {
      return false;
    }
    if (side === 'requesting' && requestingItems.length >= 40) {
      return false;
    }

    if (side === 'offering') {
      setOfferingItems((prev) => [...prev, item]);
    } else {
      setRequestingItems((prev) => [...prev, item]);
    }
    return true;
  };

  const handleRemoveItem = (itemId: number, side: 'offering' | 'requesting', subName?: string) => {
    if (side === 'offering') {
      const index = offeringItems.findIndex(
        (item) => item.id === itemId && (item.sub_name === subName || (!item.sub_name && !subName)),
      );
      if (index !== -1) {
        const newOfferingItems = [
          ...offeringItems.slice(0, index),
          ...offeringItems.slice(index + 1),
        ];
        setOfferingItems(newOfferingItems);
      }
    } else {
      const index = requestingItems.findIndex(
        (item) => item.id === itemId && (item.sub_name === subName || (!item.sub_name && !subName)),
      );
      if (index !== -1) {
        const newRequestingItems = [
          ...requestingItems.slice(0, index),
          ...requestingItems.slice(index + 1),
        ];
        setRequestingItems(newRequestingItems);
      }
    }
  };

  const handleRemoveAllItems = (
    itemId: number,
    side: 'offering' | 'requesting',
    subName?: string,
  ) => {
    if (side === 'offering') {
      const newOfferingItems = offeringItems.filter(
        (item) =>
          !(item.id === itemId && (item.sub_name === subName || (!item.sub_name && !subName))),
      );
      setOfferingItems(newOfferingItems);
    } else {
      const newRequestingItems = requestingItems.filter(
        (item) =>
          !(item.id === itemId && (item.sub_name === subName || (!item.sub_name && !subName))),
      );
      setRequestingItems(newRequestingItems);
    }
  };

  const handleSwapSides = () => {
    setOfferingItems(requestingItems);
    setRequestingItems(offeringItems);
  };

  const handleClearSides = (event?: React.MouseEvent) => {
    // If Shift key is held down, clear both sides immediately without showing modal
    if (event?.shiftKey) {
      handleStartNew();
      return;
    }

    setShowClearConfirmModal(true);
  };

  const handleMirrorItems = (fromSide: 'offering' | 'requesting') => {
    const sourceItems = fromSide === 'offering' ? offeringItems : requestingItems;
    const targetSide = fromSide === 'offering' ? 'requesting' : 'offering';

    if (targetSide === 'offering') {
      setOfferingItems(sourceItems);
    } else {
      setRequestingItems(sourceItems);
    }
  };

  // Helper function to get unique key for an item
  const getItemKey = (itemId: number, subName?: string, side?: 'offering' | 'requesting') => {
    const baseKey = `${itemId}-${subName || 'base'}`;
    return side ? `${side}-${baseKey}` : baseKey;
  };

  // Helper function to get selected value TYPE for an item
  const getSelectedValueType = (
    item: TradeItem,
    side: 'offering' | 'requesting',
  ): 'cash' | 'duped' => {
    const itemKey = getItemKey(item.id, item.sub_name, side);
    const rawType = itemValueTypes[itemKey] || 'cash';
    const dupedAvailable = !!(item.duped_value && item.duped_value !== 'N/A');
    return rawType === 'duped' && dupedAvailable ? 'duped' : 'cash';
  };

  // Helper function to get selected value for an item
  const getSelectedValue = (item: TradeItem, side: 'offering' | 'requesting'): number => {
    const selectedType = getSelectedValueType(item, side);
    return parseValueString(selectedType === 'cash' ? item.cash_value : item.duped_value);
  };

  // Helper function to get selected value string for display
  const getSelectedValueString = (item: TradeItem, side: 'offering' | 'requesting'): string => {
    const selectedType = getSelectedValueType(item, side);
    return selectedType === 'cash' ? item.cash_value : item.duped_value;
  };

  // Function to update value type for an item
  const updateItemValueType = (
    itemId: number,
    subName: string | undefined,
    valueType: 'cash' | 'duped',
    side: 'offering' | 'requesting',
  ) => {
    const itemKey = getItemKey(itemId, subName, side);
    setItemValueTypes((prev) => ({
      ...prev,
      [itemKey]: valueType,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Restore Modal */}
      <CustomConfirmationModal
        open={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        title="Restore Calculator Items?"
        message="Do you want to restore your previously added items or start a new calculation?"
        confirmText="Restore Items"
        cancelText="Start New"
        onConfirm={handleRestoreItems}
        onCancel={handleStartNew}
      />

      {/* Clear Confirmation Modal */}
      {/* Replaced single-confirm modal with multi-option modal */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            aria-hidden="true"
            onClick={() => setShowClearConfirmModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="modal-container bg-secondary-bg border-button-info mx-auto w-full max-w-sm rounded-lg border p-6 shadow-lg">
              <div className="modal-header text-primary-text mb-2 text-xl font-semibold">
                Clear Calculator?
              </div>
              <div className="modal-content mb-6">
                <p className="text-secondary-text">
                  Choose what to clear. This action cannot be undone.
                </p>
              </div>
              <div className="mb-4 grid grid-cols-1 gap-3">
                <button
                  onClick={() => {
                    setOfferingItems([]);
                    setItemValueTypes((prev) => {
                      const next = { ...prev };
                      Object.keys(next).forEach((k) => {
                        if (k.startsWith('offering-')) {
                          delete next[k];
                        }
                      });
                      return next;
                    });
                    if (requestingItems.length === 0) {
                      localStorage.removeItem('calculatorItems');
                    } else {
                      saveItemsToLocalStorage([], requestingItems);
                    }
                    setShowClearConfirmModal(false);
                  }}
                  className="border-button-success bg-button-success/10 text-button-success hover:bg-button-success/20 w-full rounded-md border px-4 py-2 text-sm font-medium transition-colors"
                >
                  Clear Offering
                </button>
                <button
                  onClick={() => {
                    setRequestingItems([]);
                    setItemValueTypes((prev) => {
                      const next = { ...prev };
                      Object.keys(next).forEach((k) => {
                        if (k.startsWith('requesting-')) {
                          delete next[k];
                        }
                      });
                      return next;
                    });
                    if (offeringItems.length === 0) {
                      localStorage.removeItem('calculatorItems');
                    } else {
                      saveItemsToLocalStorage(offeringItems, []);
                    }
                    setShowClearConfirmModal(false);
                  }}
                  className="border-button-danger bg-button-danger/10 text-button-danger hover:bg-button-danger/20 w-full rounded-md border px-4 py-2 text-sm font-medium transition-colors"
                >
                  Clear Requesting
                </button>
                <button
                  onClick={() => {
                    handleStartNew();
                  }}
                  className="bg-button-danger text-form-button-text hover:bg-button-danger-hover w-full rounded-md px-4 py-2 text-sm font-medium transition-colors"
                >
                  Clear Both
                </button>
              </div>
              <div className="modal-footer flex justify-end">
                <button
                  onClick={() => setShowClearConfirmModal(false)}
                  className="text-secondary-text hover:text-primary-text cursor-pointer rounded border-none bg-transparent px-4 py-2 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trade Sides */}
      <div className="space-y-4">
        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          <Tooltip
            title="Swap sides"
            arrow
            placement="top"
            slotProps={{
              tooltip: {
                sx: {
                  backgroundColor: 'var(--color-secondary-bg)',
                  color: 'var(--color-primary-text)',
                  '& .MuiTooltip-arrow': {
                    color: 'var(--color-secondary-bg)',
                  },
                },
              },
            }}
          >
            <Button
              variant="contained"
              onClick={handleSwapSides}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <ArrowsRightLeftIcon className="mr-1 h-5 w-5" />
              Swap Sides
            </Button>
          </Tooltip>
          <Tooltip
            title="Clear all items (hold Shift to clear both sides instantly)"
            arrow
            placement="top"
            slotProps={{
              tooltip: {
                sx: {
                  backgroundColor: 'var(--color-secondary-bg)',
                  color: 'var(--color-primary-text)',
                  '& .MuiTooltip-arrow': {
                    color: 'var(--color-secondary-bg)',
                  },
                },
              },
            }}
          >
            <Button
              variant="contained"
              onClick={handleClearSides}
              className="bg-status-error text-form-button-text hover:bg-status-error-hover"
            >
              <TrashIcon className="mr-1 h-5 w-5" />
              Clear
            </Button>
          </Tooltip>
        </div>

        {/* Pro tip about Shift+Clear */}
        <div className="text-center">
          <div className="text-secondary-text hidden items-center justify-center gap-1 text-xs lg:flex">
            💡 Pro tip: Hold Shift while clicking Clear to clear both sides instantly without
            confirmation
          </div>
        </div>

        {/* Trade Panels */}
        <div className="space-y-6 md:flex md:space-y-0 md:space-x-6">
          {/* Offering Items */}
          <div className="border-status-success bg-secondary-bg flex-1 rounded-lg border p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-secondary-text font-medium">Offering</h3>
                <span className="text-secondary-text/70 text-sm">({offeringItems.length}/40)</span>
              </div>
              <Tooltip
                title="Mirror to requesting"
                arrow
                placement="top"
                slotProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: 'var(--color-secondary-bg)',
                      color: 'var(--color-primary-text)',
                      '& .MuiTooltip-arrow': {
                        color: 'var(--color-secondary-bg)',
                      },
                    },
                  },
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => handleMirrorItems('offering')}
                  size="small"
                  className="border-status-success text-primary-text bg-status-success/15 hover:border-status-success hover:bg-status-success/25"
                >
                  <ArrowsRightLeftIcon className="mr-1 h-4 w-4" />
                  Mirror
                </Button>
              </Tooltip>
            </div>
            <CalculatorItemGrid
              items={offeringItems}
              onRemove={(id, subName) => handleRemoveItem(id, 'offering', subName)}
              onRemoveAll={(id, subName) => handleRemoveAllItems(id, 'offering', subName)}
              onValueTypeChange={(id, subName, valueType) =>
                updateItemValueType(id, subName, valueType, 'offering')
              }
              getSelectedValueString={(item) => getSelectedValueString(item, 'offering')}
              getSelectedValueType={(item) => getSelectedValueType(item, 'offering')}
              side="offering"
            />
            {(() => {
              const t = calculateTotals(offeringItems, 'offering');
              return (
                <div className="text-secondary-text/70 mt-4 flex flex-col flex-wrap items-start gap-2 text-xs sm:flex-row sm:items-center sm:gap-3 sm:text-sm">
                  <span>
                    Total: <span className="text-secondary-text font-bold">{t.cashValue}</span>
                  </span>
                  <span className="border-status-success/20 bg-status-success/80 text-form-button-text inline-flex items-center rounded-full border px-2 py-0.5">
                    {t.breakdown.clean.count} clean • {t.breakdown.clean.formatted}
                  </span>
                  <span className="border-status-error/20 bg-status-error/80 text-form-button-text inline-flex items-center rounded-full border px-2 py-0.5">
                    {t.breakdown.duped.count} duped • {t.breakdown.duped.formatted}
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Requesting Items */}
          <div className="bg-secondary-bg border-status-error flex-1 rounded-lg border p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-secondary-text font-medium">Requesting</h3>
                <span className="text-secondary-text/70 text-sm">
                  ({requestingItems.length}/40)
                </span>
              </div>
              <Tooltip
                title="Mirror to offering"
                arrow
                placement="top"
                slotProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: 'var(--color-secondary-bg)',
                      color: 'var(--color-primary-text)',
                      '& .MuiTooltip-arrow': {
                        color: 'var(--color-secondary-bg)',
                      },
                    },
                  },
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => handleMirrorItems('requesting')}
                  size="small"
                  className="text-primary-text border-status-error bg-status-error/15 hover:border-status-error-hover hover:bg-status-error/25"
                >
                  <ArrowsRightLeftIcon className="mr-1 h-4 w-4" />
                  Mirror
                </Button>
              </Tooltip>
            </div>
            <CalculatorItemGrid
              items={requestingItems}
              onRemove={(id, subName) => handleRemoveItem(id, 'requesting', subName)}
              onRemoveAll={(id, subName) => handleRemoveAllItems(id, 'requesting', subName)}
              onValueTypeChange={(id, subName, valueType) =>
                updateItemValueType(id, subName, valueType, 'requesting')
              }
              getSelectedValueString={(item) => getSelectedValueString(item, 'requesting')}
              getSelectedValueType={(item) => getSelectedValueType(item, 'requesting')}
              side="requesting"
            />
            {(() => {
              const t = calculateTotals(requestingItems, 'requesting');
              return (
                <div className="text-secondary-text/70 mt-4 flex flex-col flex-wrap items-start gap-2 text-xs sm:flex-row sm:items-center sm:gap-3 sm:text-sm">
                  <span>
                    Total: <span className="text-secondary-text font-bold">{t.cashValue}</span>
                  </span>
                  <span className="border-status-success/20 bg-status-success/80 text-form-button-text inline-flex items-center rounded-full border px-2 py-0.5">
                    {t.breakdown.clean.count} clean • {t.breakdown.clean.formatted}
                  </span>
                  <span className="border-status-error/20 bg-status-error/80 text-form-button-text inline-flex items-center rounded-full border px-2 py-0.5">
                    {t.breakdown.duped.count} duped • {t.breakdown.duped.formatted}
                  </span>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-stroke bg-secondary-bg mb-6 rounded-lg border">
        <nav className="px-6 py-4">
          <div className="flex flex-col space-y-1 rounded-lg p-1 sm:flex-row sm:space-y-0 sm:space-x-1">
            <button
              onClick={() => handleTabChange('items')}
              className={`${
                activeTab === 'items'
                  ? 'bg-button-info text-form-button-text shadow-sm'
                  : 'text-secondary-text hover:bg-button-info/20 hover:text-primary-text hover:cursor-pointer'
              } flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-all duration-200 sm:flex-1`}
            >
              Browse Items
            </button>
            <button
              onClick={() => handleTabChange('similar')}
              className={`${
                activeTab === 'similar'
                  ? 'bg-button-info text-form-button-text shadow-sm'
                  : 'text-secondary-text hover:bg-button-info/20 hover:text-primary-text hover:cursor-pointer'
              } flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-all duration-200 sm:flex-1`}
            >
              Similar by Total
            </button>
            <button
              onClick={() => handleTabChange('values')}
              className={`${
                activeTab === 'values'
                  ? 'bg-button-info text-form-button-text shadow-sm'
                  : 'text-secondary-text hover:bg-button-info/20 hover:text-primary-text hover:cursor-pointer'
              } flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-all duration-200 sm:flex-1`}
            >
              Value Comparison
            </button>
          </div>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'items' ? (
        <div className="mb-8">
          <AvailableItemsGrid
            items={initialItems.filter((i) => !i.is_sub)}
            onSelect={handleAddItem}
            selectedItems={[...offeringItems, ...requestingItems]}
            requireAuth={false}
          />
        </div>
      ) : activeTab === 'values' ? (
        <div className="mb-8">
          <CalculatorValueComparison
            offering={offeringItems}
            requesting={requestingItems}
            getSelectedValueString={(item, side) => getSelectedValueString(item, side)}
            getSelectedValue={(item, side) => getSelectedValue(item, side)}
            getSelectedValueType={(item, side) => getSelectedValueType(item, side)}
            onBrowseItems={() => handleTabChange('items')}
          />
        </div>
      ) : (
        <div className="mb-8">
          {/* Similar Items Near Total - Selector and Results */}
          {offeringItems.length === 0 && requestingItems.length === 0 ? (
            <div className="border-stroke bg-secondary-bg rounded-lg border p-4">
              <EmptyState
                message={
                  'Go to the "Browse Items" tab to select items and see similar items near your total.'
                }
                onBrowse={() => handleTabChange('items')}
              />
            </div>
          ) : (
            <>
              {(offeringItems.length === 0 || requestingItems.length === 0) &&
                !(offeringItems.length === 0 && requestingItems.length === 0) && (
                  <div
                    className={`bg-secondary-bg mb-4 rounded-lg border p-3 ${
                      offeringItems.length === 0 ? 'border-status-success' : 'border-status-error'
                    }`}
                  >
                    <p className="text-secondary-text text-sm">
                      {offeringItems.length === 0
                        ? 'Select at least 1 item for the Offering side.'
                        : 'Select at least 1 item for the Requesting side.'}
                    </p>
                  </div>
                )}
              <div className="mb-4 flex justify-center sm:justify-start">
                <div className="border-stroke bg-secondary-bg inline-flex gap-1 rounded-lg border p-2">
                  <button
                    onClick={() => setTotalBasis('offering')}
                    className={`cursor-pointer rounded-md px-3 py-1 text-sm font-medium ${
                      totalBasis === 'offering'
                        ? 'bg-status-success text-form-button-text'
                        : 'text-secondary-text hover:bg-secondary-bg/80 hover:text-primary-foreground'
                    }`}
                  >
                    Offering Total
                  </button>
                  <button
                    onClick={() => setTotalBasis('requesting')}
                    className={`cursor-pointer rounded-md px-3 py-1 text-sm font-medium ${
                      totalBasis === 'requesting'
                        ? 'bg-status-error text-form-button-text'
                        : 'text-secondary-text hover:bg-secondary-bg/80 hover:text-primary-foreground'
                    }`}
                  >
                    Requesting Total
                  </button>
                </div>
              </div>

              {(() => {
                const offeringTotal = offeringItems.reduce(
                  (sum, item) => sum + getSelectedValue(item, 'offering'),
                  0,
                );
                const requestingTotal = requestingItems.reduce(
                  (sum, item) => sum + getSelectedValue(item, 'requesting'),
                  0,
                );
                const total = totalBasis === 'offering' ? offeringTotal : requestingTotal;
                const title =
                  totalBasis === 'offering'
                    ? 'Similar Items Near Offering Total'
                    : 'Similar Items Near Requesting Total';
                const contextLabel = totalBasis === 'offering' ? 'Offering' : 'Requesting';
                const demandScale = [
                  'Close to none',
                  'Very Low',
                  'Low',
                  'Medium',
                  'Decent',
                  'High',
                  'Very High',
                  'Extremely High',
                ];
                const selectedSideItems =
                  totalBasis === 'offering' ? offeringItems : requestingItems;
                const demandIndices = selectedSideItems
                  .map((i) => i.demand ?? i.data?.demand ?? 'N/A')
                  .map((d) => demandScale.indexOf(d as (typeof demandScale)[number]))
                  .filter((idx) => idx >= 0);
                const avgDemandIndex =
                  demandIndices.length > 0
                    ? Math.round(demandIndices.reduce((a, b) => a + b, 0) / demandIndices.length)
                    : -1;
                const baselineDemand = avgDemandIndex >= 0 ? demandScale[avgDemandIndex] : null;

                // Summary of which values are used (Clean vs Duped)
                const sideKey: 'offering' | 'requesting' = totalBasis;
                let cleanCount = 0;
                let dupedCount = 0;
                selectedSideItems.forEach((it) => {
                  const k = getItemKey(it.id, it.sub_name, sideKey);
                  const vt = itemValueTypes[k] || 'cash';
                  const dupedAvailable = !!(it.duped_value && it.duped_value !== 'N/A');
                  if (vt === 'duped' && dupedAvailable) dupedCount++;
                  else cleanCount++;
                });

                return (
                  <>
                    <div className="mb-3 flex flex-col items-center gap-2 text-xs sm:flex-row sm:text-sm">
                      <span className="text-secondary-text">Using selected values</span>
                      <div className="flex items-center gap-2">
                        <span className="border-status-success/20 bg-status-success/80 text-form-button-text inline-flex items-center rounded-full border px-2 py-0.5">
                          {cleanCount} clean
                        </span>
                        <span className="border-status-error/20 bg-status-error/80 text-form-button-text inline-flex items-center rounded-full border px-2 py-0.5">
                          {dupedCount} duped
                        </span>
                      </div>
                    </div>

                    {/* Range controls */}
                    <div className="bg-secondary-bg border-border-primary hover:border-border-focus hover:shadow-card-shadow mb-4 rounded-lg border p-4 transition-colors duration-200 hover:shadow-lg">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-secondary-text text-sm">Range</span>
                          </div>
                        </div>
                        <Slider
                          value={
                            totalBasis === 'offering'
                              ? offeringSimilarItemsRange
                              : requestingSimilarItemsRange
                          }
                          min={0}
                          max={MAX_SIMILAR_ITEMS_RANGE}
                          step={50_000}
                          onChange={(_, v) => {
                            const val = Array.isArray(v) ? v[0] : v;
                            if (typeof val === 'number') {
                              if (totalBasis === 'offering') setOfferingSimilarItemsRange(val);
                              else setRequestingSimilarItemsRange(val);
                            }
                          }}
                          sx={{
                            color: 'var(--color-button-info)',
                            mt: 1,
                            '& .MuiSlider-markLabel': { color: 'var(--color-secondary-text)' },
                            '& .MuiSlider-mark': { backgroundColor: 'var(--color-secondary-text)' },
                          }}
                        />
                        <div className="text-secondary-text text-xs">
                          Current:{' '}
                          {(totalBasis === 'offering'
                            ? offeringSimilarItemsRange
                            : requestingSimilarItemsRange
                          ).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <TotalSimilarItems
                      targetValue={total}
                      items={initialItems}
                      excludeItems={totalBasis === 'offering' ? offeringItems : requestingItems}
                      typeFilter={null}
                      range={
                        totalBasis === 'offering'
                          ? offeringSimilarItemsRange
                          : requestingSimilarItemsRange
                      }
                      title={title}
                      contextLabel={contextLabel}
                      baselineDemand={baselineDemand}
                      enableDemandSort={true}
                      valuePreference={(function () {
                        const sideItems =
                          totalBasis === 'offering' ? offeringItems : requestingItems;
                        const sideKey: 'offering' | 'requesting' = totalBasis;
                        // If ALL selected items on this side are duped, compare using duped values, else use cash
                        if (sideItems.length > 0) {
                          const allDuped = sideItems.every((it) => {
                            const k = getItemKey(it.id, it.sub_name, sideKey);
                            const vt = itemValueTypes[k] || 'cash';
                            const dupedAvailable = !!(it.duped_value && it.duped_value !== 'N/A');
                            return vt === 'duped' && dupedAvailable;
                          });
                          return allDuped ? 'duped' : 'cash';
                        }
                        return 'cash';
                      })()}
                    />
                  </>
                );
              })()}
            </>
          )}
        </div>
      )}
    </div>
  );
};
