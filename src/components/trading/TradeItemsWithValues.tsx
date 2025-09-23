import React, { useState } from 'react';
import { TradeItem } from '@/types/trading';
import Link from 'next/link';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { getCategoryColor } from '@/utils/categoryIcons';

interface TradeItemsWithValuesProps {
  offering: TradeItem[];
  requesting: TradeItem[];
}

const getItemData = (item: TradeItem): TradeItem => {
  if ('data' in item && item.data) {
    return {
      ...item.data,
      id: item.id,
      is_sub: 'sub_name' in item,
      sub_name: 'sub_name' in item ? item.sub_name : undefined,
      tradable: item.data.tradable ? 1 : 0,
      is_limited: item.data.is_limited ?? 0,
      name: 'sub_name' in item ? `${item.data.name} (${item.sub_name})` : item.data.name,
      base_name: item.data.name,
    };
  }
  return item;
};

const groupItems = (items: TradeItem[]) => {
  const grouped = items.reduce(
    (acc, item) => {
      const itemData = getItemData(item);
      const key = `${item.id}-${itemData.name}-${itemData.type}`;
      if (!acc[key]) {
        acc[key] = { ...itemData, count: 1 };
      } else {
        acc[key].count++;
      }
      return acc;
    },
    {} as Record<string, TradeItem & { count: number }>,
  );

  return Object.values(grouped);
};

const parseCurrencyValue = (value: string | number): number => {
  if (!value || value === 'N/A') return 0;

  const stringValue = String(value);

  // Remove any non-numeric characters except decimal point and k/m
  const cleanValue = stringValue.toLowerCase().replace(/[^0-9.kms]/g, '');

  // Extract the numeric part and suffix
  const match = cleanValue.match(/^([0-9.]+)([km]?)$/);
  if (!match) return 0;

  const [, num, suffix] = match;
  const numericValue = parseFloat(num);

  // Apply multiplier based on suffix
  switch (suffix) {
    case 'k':
      return numericValue * 1000;
    case 'm':
      return numericValue * 1000000;
    default:
      return numericValue;
  }
};

const formatFullValue = (value: number): string => {
  return value.toLocaleString();
};

interface ItemRowProps {
  item: TradeItem & { count: number };
  side: 'offering' | 'requesting';
  isFirst?: boolean;
}

const ItemRow: React.FC<ItemRowProps> = ({ item, side, isFirst = false }) => {
  const [isExpanded, setIsExpanded] = useState(isFirst);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`hover:border-border-focus rounded-lg border p-4 transition-colors hover:cursor-pointer ${
        side === 'offering'
          ? 'bg-status-success/5 border-status-success/30 hover:bg-status-success/10'
          : 'bg-status-error/5 border-status-error/30 hover:bg-status-error/10'
      }`}
      onClick={toggleExpanded}
    >
      {/* Main Item Info */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div
            className={`h-2 w-2 flex-shrink-0 rounded-full ${
              side === 'offering' ? 'bg-status-success' : 'bg-status-error'
            }`}
          ></div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <Link
                href={`/item/${item.type.toLowerCase()}/${item.base_name || item.name}${'sub_name' in item ? `?variant=${item.sub_name}` : ''}`}
                className="text-link hover:text-link-hover font-medium transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {item.name}
              </Link>
              {item.count > 1 && (
                <span className="bg-primary/10 border-primary/30 text-primary-text ml-2 rounded-lg border px-2 py-1 text-xs font-medium">
                  ×{item.count}
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className="text-primary-text flex items-center rounded-lg border px-2 py-1 text-xs font-medium"
                style={{
                  borderColor: getCategoryColor(item.type),
                  backgroundColor: getCategoryColor(item.type) + '20', // Add 20% opacity
                }}
              >
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
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleExpanded}
            className="text-secondary-text hover:text-primary-text p-1 transition-colors"
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-border-primary mt-4 border-t pt-4">
          <div className="space-y-2">
            {/* Cash Value */}
            <div className="bg-primary-bg flex items-center justify-between rounded-lg p-2">
              <span className="text-secondary-text text-xs font-medium">Cash Value</span>
              <span className="bg-button-info text-form-button-text rounded-lg px-2 py-1 text-xs font-bold">
                {item.cash_value === null || item.cash_value === 'N/A'
                  ? 'N/A'
                  : formatFullValue(parseCurrencyValue(item.cash_value))}
              </span>
            </div>

            {/* Duped Value */}
            <div className="bg-primary-bg flex items-center justify-between rounded-lg p-2">
              <span className="text-secondary-text text-xs font-medium">Duped Value</span>
              <span className="bg-button-info text-form-button-text rounded-lg px-2 py-1 text-xs font-bold">
                {item.duped_value === null || item.duped_value === 'N/A'
                  ? 'N/A'
                  : formatFullValue(parseCurrencyValue(item.duped_value))}
              </span>
            </div>

            {/* Demand */}
            <div className="bg-primary-bg flex items-center justify-between rounded-lg p-2">
              <span className="text-secondary-text text-xs font-medium">Demand</span>
              <span className="bg-button-info text-form-button-text rounded-lg px-2 py-1 text-xs font-bold">
                {item.demand || 'N/A'}
              </span>
            </div>

            {/* Trend */}
            <div className="bg-primary-bg flex items-center justify-between rounded-lg p-2">
              <span className="text-secondary-text text-xs font-medium">Trend</span>
              <span className="bg-button-info text-form-button-text rounded-lg px-2 py-1 text-xs font-bold">
                {item.trend || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function TradeItemsWithValues({ offering, requesting }: TradeItemsWithValuesProps) {
  const offeringItems = groupItems(offering);
  const requestingItems = groupItems(requesting);

  // Calculate totals
  const offeringTotalCash = offeringItems.reduce((sum, item) => {
    return sum + parseCurrencyValue(item.cash_value) * item.count;
  }, 0);
  const offeringTotalDuped = offeringItems.reduce((sum, item) => {
    return sum + parseCurrencyValue(item.duped_value) * item.count;
  }, 0);
  const requestingTotalCash = requestingItems.reduce((sum, item) => {
    return sum + parseCurrencyValue(item.cash_value) * item.count;
  }, 0);
  const requestingTotalDuped = requestingItems.reduce((sum, item) => {
    return sum + parseCurrencyValue(item.duped_value) * item.count;
  }, 0);

  const cashDifference = offeringTotalCash - requestingTotalCash;
  const dupedDifference = offeringTotalDuped - requestingTotalDuped;

  return (
    <div className="space-y-6">
      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Offering Side */}
        <div className="relative">
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="bg-status-success h-3 w-3 rounded-full"></div>
                <h3 className="text-primary-text text-lg font-semibold">Offering Side</h3>
              </div>
              <span className="bg-status-success/20 border-status-success/30 text-primary-text rounded-full border px-3 py-1 text-xs font-medium">
                Offering
              </span>
              <span className="bg-primary/10 border-primary/20 text-primary-text rounded-full border px-3 py-1 text-xs font-medium">
                {offeringItems.reduce((sum, item) => sum + item.count, 0)} item
                {offeringItems.reduce((sum, item) => sum + item.count, 0) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Items Container */}
          <div className="bg-status-success/5 space-y-4 rounded-xl p-6">
            {offeringItems.map((item, index) => (
              <ItemRow
                key={`${item.id}-${item.name}-${item.type}`}
                item={item}
                side="offering"
                isFirst={index === 0}
              />
            ))}
          </div>

          {/* Offering Total */}
          <div className="bg-status-success/5 border-status-success/30 mt-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-primary-text font-semibold">Total</span>
              <div className="text-right">
                <div className="text-primary-text font-semibold">
                  Cash: {formatFullValue(offeringTotalCash)}
                </div>
                <div className="text-primary-text font-semibold">
                  Duped: {formatFullValue(offeringTotalDuped)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Requesting Side */}
        <div className="relative">
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="bg-status-error h-3 w-3 rounded-full"></div>
                <h3 className="text-primary-text text-lg font-semibold">Requesting Side</h3>
              </div>
              <span className="bg-status-error/20 border-status-error/30 text-primary-text rounded-full border px-3 py-1 text-xs font-medium">
                Requesting
              </span>
              <span className="bg-primary/10 border-primary/20 text-primary-text rounded-full border px-3 py-1 text-xs font-medium">
                {requestingItems.reduce((sum, item) => sum + item.count, 0)} item
                {requestingItems.reduce((sum, item) => sum + item.count, 0) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Items Container */}
          <div className="bg-status-error/5 space-y-4 rounded-xl p-6">
            {requestingItems.map((item, index) => (
              <ItemRow
                key={`${item.id}-${item.name}-${item.type}`}
                item={item}
                side="requesting"
                isFirst={index === 0}
              />
            ))}
          </div>

          {/* Requesting Total */}
          <div className="bg-status-error/5 border-status-error/30 mt-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-primary-text font-semibold">Total</span>
              <div className="text-right">
                <div className="text-primary-text font-semibold">
                  Cash: {formatFullValue(requestingTotalCash)}
                </div>
                <div className="text-primary-text font-semibold">
                  Duped: {formatFullValue(requestingTotalDuped)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Difference */}
      <div className="bg-secondary-bg border-border-primary rounded-lg border p-6">
        <h4 className="text-primary-text mb-4 text-lg font-semibold">Overall Difference</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="text-center">
            <div className="text-secondary-text text-sm">Cash Value Difference</div>
            <div
              className={`text-lg font-semibold ${cashDifference >= 0 ? 'text-status-success' : 'text-status-error'}`}
            >
              {cashDifference >= 0 ? '+' : ''}
              {formatFullValue(cashDifference)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-secondary-text text-sm">Duped Value Difference</div>
            <div
              className={`text-lg font-semibold ${dupedDifference >= 0 ? 'text-status-success' : 'text-status-error'}`}
            >
              {dupedDifference >= 0 ? '+' : ''}
              {formatFullValue(dupedDifference)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
