'use client';

import { Pagination } from '@mui/material';
import OGItemCard from './OGItemCard';

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

interface OGItemsGridProps {
  paginatedData: OGItem[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  getUserDisplay: (userId: string) => string;
  getUserAvatar: (userId: string) => string;
  getHasVerifiedBadge: (userId: string) => boolean;
  onCardClick: (item: OGItem) => void;
  itemCounts?: Map<string, number>;
  duplicateOrders?: Map<string, number>;
}

export default function OGItemsGrid({
  paginatedData,
  currentPage,
  totalPages,
  onPageChange,
  getUserDisplay,
  getUserAvatar,
  getHasVerifiedBadge,
  onCardClick,
  itemCounts = new Map(),
  duplicateOrders = new Map(),
}: OGItemsGridProps) {
  if (paginatedData.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-secondary-text">No items found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Items Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedData.map((item, index) => {
          const itemKey = `${item.categoryTitle}-${item.title}`;
          const duplicateCount = itemCounts.get(itemKey) || 1;
          const uniqueKey = `${item.id}-${item.user_id}-${item.logged_at}`;
          const duplicateOrder = duplicateOrders.get(uniqueKey) || 1;

          return (
            <OGItemCard
              key={`${item.id}-${item.user_id}-${item.timesTraded}-${item.uniqueCirculation}-${index}`}
              item={item}
              getUserDisplay={getUserDisplay}
              getUserAvatar={getUserAvatar}
              getHasVerifiedBadge={getHasVerifiedBadge}
              onCardClick={onCardClick}
              duplicateCount={duplicateCount}
              duplicateOrder={duplicateOrder}
            />
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => onPageChange(page)}
            color="primary"
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
    </div>
  );
}
