'use client';

import { Pagination } from '@mui/material';
import InventoryItemCard from './InventoryItemCard';
import { Item } from '@/types';
import { InventoryItem } from '@/app/inventories/types';

interface InventoryItemsGridProps {
  filteredItems: Array<{
    item: InventoryItem;
    itemData: Item;
  }>;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  getUserDisplay: (userId: string) => string;
  getUserAvatar: (userId: string) => string;
  onCardClick: (item: InventoryItem) => void;
  isLoading?: boolean;
  userId: string;
  itemCounts?: Map<string, number>;
  duplicateOrders?: Map<string, number>;
}

export default function InventoryItemsGrid({
  filteredItems,
  currentPage,
  totalPages,
  onPageChange,
  getUserDisplay,
  getUserAvatar,
  onCardClick,
  isLoading = false,
  userId,
  itemCounts = new Map(),
  duplicateOrders = new Map(),
}: InventoryItemsGridProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="rounded-lg border bg-[#37424D] p-4">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded"></div>
                  <div className="h-3 w-1/2 rounded"></div>
                  <div className="h-3 w-1/3 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted">No items found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Items Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredItems.map(({ item, itemData }) => {
          const itemKey = `${item.categoryTitle}-${item.title}`;
          const duplicateCount = itemCounts.get(itemKey) || 1;
          const uniqueKey = `${item.id}-${item.timesTraded}-${item.uniqueCirculation}`;
          const duplicateOrder = duplicateOrders.get(uniqueKey) || 1;

          return (
            <InventoryItemCard
              key={item.id}
              item={item}
              itemData={itemData}
              getUserDisplay={getUserDisplay}
              getUserAvatar={getUserAvatar}
              onCardClick={onCardClick}
              duplicateCount={duplicateCount}
              duplicateOrder={duplicateOrder}
              userId={userId}
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
                color: '#D3D9D4',
                '&.Mui-selected': {
                  backgroundColor: '#5865F2',
                  color: '#FFFFFF',
                },
                '&:hover': {},
              },
              '& .MuiPaginationItem-ellipsis': {
                color: '#D3D9D4',
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
