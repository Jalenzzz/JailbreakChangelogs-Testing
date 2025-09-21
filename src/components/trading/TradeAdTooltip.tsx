import React from 'react';
import Link from 'next/link';
import { TradeItem } from '@/types/trading';
import { getItemTypeColor, getDemandColor, getTrendColor } from '@/utils/badgeColors';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { formatFullValue } from '@/utils/values';

interface TradeAdTooltipProps {
  item: TradeItem;
}

export const TradeAdTooltip: React.FC<TradeAdTooltipProps> = ({ item }) => {
  const categoryIcon = getCategoryIcon(item.type);
  const demand = item.demand ?? item.data?.demand ?? 'N/A';
  const trend = item.trend ?? item.data?.trend ?? null;

  return (
    <div className="bg-secondary-bg border-stroke rounded-lg border p-4">
      <div className="flex gap-3">
        {/* Item Icon */}
        <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg">
          {categoryIcon && (
            <div className="bg-quaternary-bg rounded-full p-3">
              <categoryIcon.Icon className="text-primary-text h-8 w-8" />
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between">
            <Link
              href={`/item/${item.type.toLowerCase()}/${item.base_name || item.name}${item.sub_name ? `?variant=${item.sub_name}` : ''}`}
              className="text-primary-text hover:text-link-hover truncate text-lg font-semibold transition-colors"
            >
              {item.base_name && item.sub_name ? `${item.base_name} (${item.sub_name})` : item.name}
            </Link>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span
                className="text-form-button-text inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ backgroundColor: getItemTypeColor(item.type) }}
              >
                {item.type}
              </span>
              {item.is_limited === 1 && (
                <span className="border-status-warning bg-status-warning/10 text-status-warning rounded-full border px-2 py-0.5 text-xs">
                  Limited
                </span>
              )}
              {item.is_seasonal === 1 && (
                <span className="border-status-info bg-status-info/10 text-status-info rounded-full border px-2 py-0.5 text-xs">
                  Seasonal
                </span>
              )}
              {item.tradable !== 1 && (
                <span className="text-form-button-text border-button-danger bg-button-danger flex-shrink-0 rounded-full border px-1.5 py-0.5 text-xs">
                  Non-Tradable
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-secondary-text text-xs tracking-wider uppercase">Cash:</span>
              <span className="bg-button-info text-form-button-text rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap">
                {item.cash_value === null || item.cash_value === 'N/A'
                  ? 'N/A'
                  : formatFullValue(item.cash_value)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-secondary-text text-xs tracking-wider uppercase">Duped:</span>
              <span className="bg-button-info text-form-button-text rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap">
                {item.duped_value === null || item.duped_value === 'N/A'
                  ? 'N/A'
                  : formatFullValue(item.duped_value)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-secondary-text text-xs tracking-wider uppercase">Demand:</span>
              <span
                className={`text-form-button-text rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${getDemandColor(demand)}`}
              >
                {demand === 'N/A' ? 'Unknown' : demand}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-secondary-text text-xs tracking-wider uppercase">Trend:</span>
              <span
                className={`text-form-button-text rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${getTrendColor(trend || 'Unknown')}`}
              >
                {!trend || trend === 'N/A' ? 'Unknown' : trend}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
