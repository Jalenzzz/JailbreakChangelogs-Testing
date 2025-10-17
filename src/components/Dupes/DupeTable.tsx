'use client';

import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Icon } from '../UI/IconWrapper';
import { formatRelativeDate, formatCustomDate } from '@/utils/timestamp';
import { getCategoryColor } from '@/utils/categoryIcons';
import { Tooltip } from '@mui/material';
import { TradeAdTooltip } from '../trading/TradeAdTooltip';
import Link from 'next/link';
import type { Item, DupeResult } from '@/types';

interface DupeTableProps {
  initialItems: Item[];
  initialDupes: DupeResult[];
}

interface DupeTableRow {
  id: string; // Unique ID for each row (item_id + owner combination)
  item_id: number;
  name: string;
  type: string;
  creator: string;
  is_seasonal: number | null;
  is_limited: number | null;
  cash_value: string;
  duped_value: string;
  price: string;
  tradable: boolean;
  trend: string | null;
  demand: string;
  last_updated: number;
  owner: string;
  user_id: number | null;
  proof: string | null;
  created_at: number;
}

const columnHelper = createColumnHelper<DupeTableRow>();

const DupeTable: React.FC<DupeTableProps> = ({ initialItems, initialDupes }) => {
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'created_at',
      desc: true,
    },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Transform data for table - create a row for each individual dupe report
  const tableData = useMemo(() => {
    const itemMap = new Map<number, Item>();
    initialItems.forEach((item) => {
      itemMap.set(item.id, item);
    });

    // Create a row for each individual dupe report
    return initialDupes
      .map((dupe): DupeTableRow | null => {
        const item = itemMap.get(dupe.item_id);
        if (!item) return null;

        return {
          id: `${dupe.item_id}-${dupe.owner}-${dupe.created_at}`, // Unique ID
          item_id: item.id,
          name: item.name,
          type: item.type,
          creator: item.creator,
          is_seasonal: item.is_seasonal,
          is_limited: item.is_limited,
          cash_value: item.cash_value,
          duped_value: item.duped_value,
          price: item.price,
          tradable: Boolean(item.tradable),
          trend: item.trend,
          demand: item.demand,
          last_updated: item.last_updated,
          owner: dupe.owner,
          user_id: dupe.user_id,
          proof: dupe.proof,
          created_at: dupe.created_at,
        };
      })
      .filter(Boolean) as DupeTableRow[];
  }, [initialItems, initialDupes]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Item Name',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-2">
              <Tooltip
                title={
                  <TradeAdTooltip
                    item={{
                      id: item.item_id,
                      name: item.name,
                      type: item.type,
                      is_seasonal: item.is_seasonal || 0,
                      is_limited: item.is_limited || 0,
                      cash_value: item.cash_value,
                      duped_value: item.duped_value,
                      trend: item.trend,
                      tradable: item.tradable ? 1 : 0,
                      base_name: item.name,
                      is_sub: false,
                      demand: item.demand,
                      data: {
                        name: item.name,
                        type: item.type,
                        creator: item.creator,
                        is_seasonal: item.is_seasonal,
                        cash_value: item.cash_value,
                        duped_value: item.duped_value,
                        price: item.price,
                        is_limited: item.is_limited,
                        duped_owners: '',
                        notes: '',
                        demand: item.demand,
                        trend: item.trend,
                        description: '',
                        health: 0,
                        tradable: item.tradable,
                        last_updated: item.last_updated,
                      },
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
                <Link
                  href={`/item/${encodeURIComponent(item.type)}/${encodeURIComponent(item.name)}`}
                  className="text-primary-text hover:text-link-hover font-medium transition-colors hover:underline"
                >
                  {item.name}
                </Link>
              </Tooltip>
              <span
                className="text-primary-text flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
                style={{
                  borderColor: getCategoryColor(item.type),
                  backgroundColor: getCategoryColor(item.type) + '20',
                }}
              >
                {item.type}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor('owner', {
        header: 'Dupe Owner',
        cell: ({ row }) => {
          const owner = row.original.owner;
          return <span className="text-primary-text font-medium">{owner}</span>;
        },
      }),
      columnHelper.accessor('created_at', {
        header: 'Reported',
        cell: ({ row }) => {
          const reportDate = row.original.created_at;

          return (
            <Tooltip
              title={formatCustomDate(reportDate)}
              placement="top"
              arrow
              slotProps={{
                tooltip: {
                  sx: {
                    backgroundColor: 'var(--color-primary-bg)',
                    color: 'var(--color-secondary-text)',
                    fontSize: '0.75rem',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px var(--color-card-shadow)',
                    '& .MuiTooltip-arrow': {
                      color: 'var(--color-primary-bg)',
                    },
                  },
                },
              }}
            >
              <span className="text-secondary-text cursor-help text-sm">
                {formatRelativeDate(reportDate)}
              </span>
            </Tooltip>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      sorting: [
        {
          id: 'created_at',
          desc: true,
        },
      ],
    },
  });

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search items or owners..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="text-primary-text border-border-primary hover:border-border-focus bg-primary-bg placeholder-secondary-text focus:border-button-info w-full rounded-lg border px-4 py-2 pr-10 pl-10 transition-all duration-300 focus:outline-none"
        />
        <Icon
          icon="material-symbols:search"
          className="text-secondary-text absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2"
          inline={true}
        />
        {globalFilter && (
          <button
            onClick={() => setGlobalFilter('')}
            className="hover:text-primary-text text-secondary-text absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 cursor-pointer"
            aria-label="Clear search"
          >
            <Icon icon="material-symbols:close" className="h-5 w-5" inline={true} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="border-border-primary bg-secondary-bg overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-border-primary bg-tertiary-bg border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-secondary-text px-4 py-3 text-left text-sm font-medium"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-1 ${
                            header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <div className="flex flex-col">
                              <Icon
                                icon="material-symbols:keyboard-arrow-up"
                                className={`h-3 w-3 ${
                                  header.column.getIsSorted() === 'asc'
                                    ? 'text-primary-text'
                                    : 'text-secondary-text'
                                }`}
                                inline={true}
                              />
                              <Icon
                                icon="material-symbols:keyboard-arrow-down"
                                className={`-mt-1 h-3 w-3 ${
                                  header.column.getIsSorted() === 'desc'
                                    ? 'text-primary-text'
                                    : 'text-secondary-text'
                                }`}
                                inline={true}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`border-border-primary border-b transition-colors last:border-b-0 ${
                    index % 2 === 0 ? 'bg-primary-bg' : 'bg-secondary-bg'
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DupeTable;
