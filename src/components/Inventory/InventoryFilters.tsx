'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

const Select = dynamic(() => import('react-select'), { ssr: false });

interface InventoryFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  showOnlyOriginal: boolean;
  showOnlyNonOriginal: boolean;
  availableCategories: string[];
  onFilterToggle: (checked: boolean) => void;
  onNonOriginalFilterToggle: (checked: boolean) => void;
}

export default function InventoryFilters({
  searchTerm,
  setSearchTerm,
  selectedCategories,
  setSelectedCategories,
  sortOrder,
  setSortOrder,
  showOnlyOriginal,
  showOnlyNonOriginal,
  availableCategories,
  onFilterToggle,
  onNonOriginalFilterToggle,
}: InventoryFiltersProps) {
  const [selectLoaded, setSelectLoaded] = useState(false);
  const MAX_SEARCH_LENGTH = 50;

  // Load Select component
  useEffect(() => {
    setSelectLoaded(true);
  }, []);

  const sortOptions = [
    {
      label: 'Random',
      options: [{ value: 'random', label: 'Random Order' }],
    },
    { value: 'duplicates', label: 'Group Duplicates' },
    {
      label: 'Alphabetically',
      options: [
        { value: 'alpha-asc', label: 'Name (A to Z)' },
        { value: 'alpha-desc', label: 'Name (Z to A)' },
      ],
    },
    {
      label: 'Activity',
      options: [
        {
          value: 'traded-desc',
          label: 'Monthly Traded (High to Low)',
        },
        {
          value: 'unique-desc',
          label: 'Monthly Unique (High to Low)',
        },
      ],
    },
    {
      label: 'Value',
      options: [
        { value: 'cash-desc', label: 'Cash Value (High to Low)' },
        { value: 'cash-asc', label: 'Cash Value (Low to High)' },
        {
          value: 'duped-desc',
          label: 'Duped Value (High to Low)',
        },
        {
          value: 'duped-asc',
          label: 'Duped Value (Low to High)',
        },
      ],
    },
    {
      label: 'Date',
      options: [
        {
          value: 'created-desc',
          label: 'Created On (Newest to Oldest)',
        },
        {
          value: 'created-asc',
          label: 'Created On (Oldest to Newest)',
        },
      ],
    },
  ];

  return (
    <div className="mb-4 flex flex-col gap-4">
      {/* Filter Checkboxes */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showOnlyOriginal}
            onChange={(e) => onFilterToggle(e.target.checked)}
            className="text-button-info focus:ring-button-info h-4 w-4 cursor-pointer rounded"
          />
          <span className="text-primary-text text-sm">Original Items Only</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showOnlyNonOriginal}
            onChange={(e) => onNonOriginalFilterToggle(e.target.checked)}
            className="text-button-info focus:ring-button-info h-4 w-4 cursor-pointer rounded"
          />
          <span className="text-primary-text text-sm">Non-Original Items Only</span>
        </label>
      </div>

      {/* Search, Category, and Sort Filters - Side by Side */}
      <div className="flex w-full flex-col gap-4 sm:flex-row">
        {/* Search Bar - First */}
        <div className="relative w-full sm:w-1/3">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxLength={MAX_SEARCH_LENGTH}
            className="text-primary-text border-border-primary bg-primary-bg placeholder-secondary-text focus:border-button-info min-h-[56px] w-full rounded-lg border px-4 py-3 pr-10 pl-10 transition-all duration-300 focus:outline-none"
          />
          <MagnifyingGlassIcon className="text-secondary-text absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="hover:text-primary-text text-secondary-text absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2"
              aria-label="Clear search"
            >
              <XMarkIcon />
            </button>
          )}
        </div>

        {/* Category Filter - Second */}
        <div className="w-full sm:w-1/3">
          {selectLoaded ? (
            <Select
              value={
                selectedCategories.length > 0
                  ? {
                      value: selectedCategories[0],
                      label: selectedCategories[0],
                    }
                  : null
              }
              onChange={(option) => {
                if (!option) {
                  setSelectedCategories([]);
                  return;
                }
                setSelectedCategories([(option as { value: string }).value]);
              }}
              options={availableCategories.map((cat) => ({
                value: cat,
                label: cat,
              }))}
              classNamePrefix="react-select"
              className="w-full"
              isMulti={false}
              isClearable={true}
              placeholder="Filter by category..."
              unstyled
              classNames={{
                control: () =>
                  'text-secondary-text flex items-center justify-between rounded-lg border border-border-primary bg-primary-bg p-3 min-h-[56px] hover:cursor-pointer focus-within:border-button-info',
                singleValue: () => 'text-secondary-text',
                placeholder: () => 'text-secondary-text',
                menu: () =>
                  'absolute z-[3000] mt-1 w-full rounded-lg border border-border-primary bg-secondary-bg shadow-lg',
                option: ({ isSelected, isFocused }) =>
                  `px-4 py-3 cursor-pointer ${
                    isSelected
                      ? 'bg-button-info text-form-button-text'
                      : isFocused
                        ? 'bg-quaternary-bg text-primary-text'
                        : 'bg-secondary-bg text-secondary-text'
                  }`,
                clearIndicator: () => 'text-secondary-text hover:text-primary-text cursor-pointer',
                dropdownIndicator: () =>
                  'text-secondary-text hover:text-primary-text cursor-pointer',
                groupHeading: () => 'px-4 py-2 text-primary-text font-semibold text-sm',
              }}
            />
          ) : (
            <div className="border-border-primary bg-secondary-bg h-10 w-full animate-pulse rounded-md border"></div>
          )}
        </div>

        {/* Sort Filter - Third */}
        <div className="w-full sm:w-1/3">
          {selectLoaded ? (
            <Select
              value={{
                value: sortOrder,
                label: (() => {
                  switch (sortOrder) {
                    case 'duplicates':
                      return 'Group Duplicates';
                    case 'alpha-asc':
                      return 'Name (A to Z)';
                    case 'alpha-desc':
                      return 'Name (Z to A)';
                    case 'traded-desc':
                      return 'Monthly Traded (High to Low)';
                    case 'unique-desc':
                      return 'Monthly Unique (High to Low)';
                    case 'cash-desc':
                      return 'Cash Value (High to Low)';
                    case 'cash-asc':
                      return 'Cash Value (Low to High)';
                    case 'duped-desc':
                      return 'Duped Value (High to Low)';
                    case 'duped-asc':
                      return 'Duped Value (Low to High)';
                    case 'created-asc':
                      return 'Created On (Oldest to Newest)';
                    case 'created-desc':
                      return 'Created On (Newest to Oldest)';
                    case 'random':
                      return 'Random Order';
                    default:
                      return 'Random Order';
                  }
                })(),
              }}
              onChange={(option) => {
                if (!option) {
                  setSortOrder('random');
                  return;
                }
                setSortOrder(
                  (
                    option as {
                      value:
                        | 'alpha-asc'
                        | 'alpha-desc'
                        | 'traded-desc'
                        | 'unique-desc'
                        | 'cash-desc'
                        | 'cash-asc'
                        | 'duped-desc'
                        | 'duped-asc'
                        | 'created-asc'
                        | 'created-desc'
                        | 'duplicates'
                        | 'random';
                    }
                  ).value,
                );
              }}
              options={sortOptions}
              classNamePrefix="react-select"
              className="w-full"
              isMulti={false}
              isClearable={true}
              placeholder="Sort by..."
              unstyled
              classNames={{
                control: () =>
                  'text-secondary-text flex items-center justify-between rounded-lg border border-border-primary bg-primary-bg p-3 min-h-[56px] hover:cursor-pointer focus-within:border-button-info',
                singleValue: () => 'text-secondary-text',
                placeholder: () => 'text-secondary-text',
                menu: () =>
                  'absolute z-[3000] mt-1 w-full rounded-lg border border-border-primary bg-secondary-bg shadow-lg',
                option: ({ isSelected, isFocused }) =>
                  `px-4 py-3 cursor-pointer ${
                    isSelected
                      ? 'bg-button-info text-form-button-text'
                      : isFocused
                        ? 'bg-quaternary-bg text-primary-text'
                        : 'bg-secondary-bg text-secondary-text'
                  }`,
                clearIndicator: () => 'text-secondary-text hover:text-primary-text cursor-pointer',
                dropdownIndicator: () =>
                  'text-secondary-text hover:text-primary-text cursor-pointer',
                groupHeading: () => 'px-4 py-2 text-primary-text font-semibold text-sm',
              }}
              isSearchable={false}
            />
          ) : (
            <div className="border-border-primary bg-secondary-bg h-10 w-full animate-pulse rounded-md border"></div>
          )}
        </div>
      </div>
    </div>
  );
}
