'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TradeItem } from '@/types/trading';
import { getItemImagePath, handleImageError } from '@/utils/images';
import { FaArrowCircleUp, FaArrowAltCircleDown } from 'react-icons/fa';
import { formatFullValue, demandOrder } from '@/utils/values';

interface TotalSimilarItemsProps {
  targetValue: number;
  items: TradeItem[];
  excludeItems?: TradeItem[];
  typeFilter?: string | null; // when null/undefined, include all types
  range?: number; // +/- range in raw value, default 2.5m
  title?: string;
  accentColor?: string;
  contextLabel?: string;
  baselineDemand?: string | null;
  enableDemandSort?: boolean;
  valuePreference?: 'cash' | 'duped';
}

const parseValue = (value: string): number => {
  if (!value || value === 'N/A') return 0;
  const lower = value.toLowerCase();
  const num = parseFloat(lower.replace(/[^0-9.]/g, ''));
  if (Number.isNaN(num)) return 0;
  if (lower.includes('k')) return num * 1_000;
  if (lower.includes('m')) return num * 1_000_000;
  if (lower.includes('b')) return num * 1_000_000_000;
  return num;
};

const getItemDemand = (item: TradeItem): string => {
  return item.demand ?? item.data?.demand ?? 'N/A';
};

const getDemandIndex = (demand: string): number => {
  return demandOrder.indexOf(demand as (typeof demandOrder)[number]);
};

export const TotalSimilarItems: React.FC<TotalSimilarItemsProps> = ({
  targetValue,
  items,
  excludeItems = [],
  typeFilter = null,
  range = 2_500_000,
  title,
  accentColor,
  contextLabel,
  baselineDemand = null,
  enableDemandSort = true,
  valuePreference = 'cash',
}) => {
  const [sortMode, setSortMode] = useState<'diff' | 'demand-desc' | 'demand-asc'>('diff');

  const candidates = useMemo(() => {
    if (!items?.length || targetValue <= 0) return [] as Array<{ item: TradeItem; diff: number }>;
    const excludeIdSet = new Set(excludeItems.map((i) => i.id));
    const pool = (
      typeFilter ? items.filter((i) => i.type.toLowerCase() === typeFilter.toLowerCase()) : items
    )
      .filter((i) => !excludeIdSet.has(i.id))
      .filter((i) =>
        valuePreference === 'duped' ? i.duped_value && i.duped_value !== 'N/A' : true,
      );
    const min = Math.max(0, targetValue - range);
    const max = targetValue + range;
    const withinRange = pool
      .map((item) => {
        const valueString =
          valuePreference === 'duped' && item.duped_value && item.duped_value !== 'N/A'
            ? item.duped_value
            : item.cash_value;
        const val = parseValue(valueString);
        return { item, val, diff: Math.abs(val - targetValue) };
      })
      .filter(({ val }) => val >= min && val <= max);

    let sorted;
    if (sortMode === 'demand-desc' || sortMode === 'demand-asc') {
      sorted = withinRange.sort((a, b) => {
        const aIdx = getDemandIndex(getItemDemand(a.item));
        const bIdx = getDemandIndex(getItemDemand(b.item));
        return sortMode === 'demand-desc' ? bIdx - aIdx : aIdx - bIdx;
      });
    } else {
      sorted = withinRange.sort((a, b) => a.diff - b.diff);
    }
    return sorted.slice(0, 12).map(({ item, diff }) => ({ item, diff }));
  }, [items, excludeItems, targetValue, range, typeFilter, sortMode, valuePreference]);

  if (targetValue <= 0) return null;

  const heading =
    title || (typeFilter ? `Similar ${typeFilter}s Near Total` : 'Similar Items Near Total');
  const baselineDemandIndex = baselineDemand ? getDemandIndex(baselineDemand) : -1;

  return (
    <div className="rounded-lg border p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-primary-text font-semibold">{heading}</h3>
          {contextLabel && (
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
              style={{
                backgroundColor:
                  contextLabel.toLowerCase() === 'offering'
                    ? 'var(--color-status-error)'
                    : accentColor || 'var(--color-button-info)',
              }}
            >
              {contextLabel}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {enableDemandSort && (
            <div className="border-border-primary inline-flex overflow-hidden rounded-md border">
              <button
                onClick={() => setSortMode('diff')}
                className={`px-2 py-1 text-xs ${sortMode === 'diff' ? 'bg-button-info text-white' : 'text-secondary-text hover:bg-secondary-bg hover:text-primary-text'}`}
              >
                Closest
              </button>
              <button
                onClick={() => setSortMode('demand-desc')}
                className={`px-2 py-1 text-xs ${sortMode === 'demand-desc' ? 'bg-button-info text-white' : 'text-secondary-text hover:bg-secondary-bg hover:text-primary-text'}`}
              >
                Demand ↓
              </button>
              <button
                onClick={() => setSortMode('demand-asc')}
                className={`px-2 py-1 text-xs ${sortMode === 'demand-asc' ? 'bg-button-info text-white' : 'text-secondary-text hover:bg-secondary-bg hover:text-primary-text'}`}
              >
                Demand ↑
              </button>
            </div>
          )}
        </div>
      </div>

      {candidates.length === 0 ? (
        <div className="text-secondary-text rounded-lg p-6 text-center text-sm">
          No items found within ±{range.toLocaleString()} of your total.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {candidates.map(({ item, diff }) => {
            const comparisonValueString =
              valuePreference === 'duped' && item.duped_value && item.duped_value !== 'N/A'
                ? item.duped_value
                : item.cash_value;
            const itemValue = parseValue(comparisonValueString);
            const isAbove = itemValue > targetValue;
            const itemDemand = getItemDemand(item);
            const itemDemandIndex = getDemandIndex(itemDemand);
            const demandDelta =
              baselineDemandIndex >= 0 && itemDemandIndex >= 0
                ? itemDemandIndex - baselineDemandIndex
                : null;
            const displayName = item.sub_name ? `${item.name} (${item.sub_name})` : item.name;
            return (
              <Link
                key={`${item.id}-${item.sub_name || 'base'}`}
                href={`/item/${item.type.toLowerCase()}/${item.name}${item.sub_name ? `?variant=${item.sub_name}` : ''}`}
                className="group"
              >
                <div className="border-border-primary bg-secondary-bg hover:border-button-info/30 overflow-hidden rounded-lg border transition-all duration-200 hover:shadow-lg">
                  <div className="relative aspect-video">
                    <Image
                      src={getItemImagePath(item.type, item.name, true)}
                      alt={displayName}
                      fill
                      className="object-cover"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-primary-text group-hover:text-link mr-2 line-clamp-1 font-medium transition-colors">
                        {displayName}
                      </h4>
                      <span className="border-primary-text text-primary-text flex items-center rounded-full border bg-transparent px-2 py-0.5 text-xs">
                        {item.type}
                      </span>
                    </div>
                    <div className="text-secondary-text/80 flex items-start justify-between text-xs">
                      <span className="flex flex-col space-y-1">
                        <span className="flex items-center gap-1">
                          <span className="text-secondary-text">Cash:</span>
                          <span
                            className="rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-white"
                            style={{ backgroundColor: 'var(--color-button-info)' }}
                          >
                            {formatFullValue(item.cash_value)}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-secondary-text">Duped:</span>
                          <span
                            className="rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-white"
                            style={{ backgroundColor: 'var(--color-button-info)' }}
                          >
                            {formatFullValue(item.duped_value)}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-secondary-text">Demand:</span>
                          <span
                            className="rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-white"
                            style={{ backgroundColor: 'var(--color-button-info)' }}
                          >
                            {itemDemand === 'N/A' ? 'Unknown' : itemDemand}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-secondary-text">Trend:</span>
                          <span
                            className="rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-white"
                            style={{ backgroundColor: 'var(--color-button-info)' }}
                          >
                            {!item.trend || item.trend === 'N/A' ? 'Unknown' : item.trend}
                          </span>
                        </span>
                      </span>
                      <span className="flex flex-col items-end">
                        {diff === 0 ? (
                          <span className="text-status-neutral inline-flex items-center gap-1">
                            <span>Same value</span>
                          </span>
                        ) : (
                          <span
                            className={`${isAbove ? 'text-status-success' : 'text-status-error'} inline-flex items-center gap-1`}
                          >
                            {isAbove ? (
                              <FaArrowCircleUp className="h-4 w-4" />
                            ) : (
                              <FaArrowAltCircleDown className="h-4 w-4" />
                            )}
                            <span>
                              {isAbove ? 'Above by' : 'Below by'} {diff.toLocaleString()}
                            </span>
                          </span>
                        )}
                        {demandDelta === null ? null : demandDelta === 0 ? (
                          <span className="text-secondary-text mt-1 inline-flex items-center gap-1">
                            <span>Same demand</span>
                          </span>
                        ) : (
                          <span
                            className={`mt-1 inline-flex items-center gap-1 ${demandDelta > 0 ? 'text-status-success' : 'text-status-error'}`}
                          >
                            {demandDelta > 0 ? (
                              <FaArrowCircleUp className="h-4 w-4" />
                            ) : (
                              <FaArrowAltCircleDown className="h-4 w-4" />
                            )}
                            <span>
                              {Math.abs(demandDelta)} level
                              {Math.abs(demandDelta) === 1 ? '' : 's'}{' '}
                              {demandDelta > 0 ? 'higher' : 'lower'}
                              {baselineDemand ? ` than ${baselineDemand}` : ''}
                            </span>
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TotalSimilarItems;
