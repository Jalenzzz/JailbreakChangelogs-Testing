import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Breadcrumb from '@/components/Layout/Breadcrumb';
import DupeReportHeader from '@/components/Dupes/DupeReportHeader';
import DupeSearchForm from '@/components/Dupes/DupeSearchForm';
import { fetchItems, fetchDupes } from '@/utils/api';
import { formatTimestamp } from '@/utils/timestamp';
import Loading from './loading';
import { Item, DupeResult } from '@/types';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function DupeCalculatorPage() {
  return (
    <main className="mb-8 min-h-screen">
      <div className="container mx-auto px-4">
        <Breadcrumb />
        <DupeReportHeader />

        <div className="border-border-primary hover:border-border-focus bg-secondary-bg rounded-lg border p-6">
          <div className="mb-6">
            <h2 className="text-secondary-text text-xl font-semibold">Search for Duped Items</h2>
          </div>

          {/* Stats Card */}
          <div className="border-tertiary-bg bg-tertiary-bg mb-6 rounded-lg border p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-primary-text text-lg font-semibold">Total Dupes Reported</h3>
                <p className="text-secondary-text text-sm">All dupe reports in our database</p>
              </div>
              <Suspense
                fallback={<div className="bg-quaternary-bg h-8 w-16 animate-pulse rounded" />}
              >
                <DupeStatsWrapper />
              </Suspense>
            </div>
          </div>

          <Suspense fallback={<Loading />}>
            <DupeSearchFormWrapper />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

async function DupeStatsWrapper() {
  const dupes = await fetchDupes();
  const totalDupes = Array.isArray(dupes) ? dupes.length : 0;

  // Find the most recent dupe report
  const lastReportedDupe =
    Array.isArray(dupes) && dupes.length > 0
      ? dupes.reduce((latest, current) =>
          current.created_at > latest.created_at ? current : latest,
        )
      : null;

  return (
    <div className="text-center sm:text-right">
      <div className="text-primary-text text-2xl font-bold">{totalDupes.toLocaleString()}</div>
      {lastReportedDupe && (
        <div className="text-secondary-text mt-1 text-xs">
          Last reported: {formatTimestamp(lastReportedDupe.created_at, { format: 'long' })}
        </div>
      )}
    </div>
  );
}

async function DupeSearchFormWrapper() {
  const [items, dupes] = await Promise.all([fetchItems(), fetchDupes()]);
  const safeDupes = Array.isArray(dupes) ? (dupes as DupeResult[]) : [];
  const safeItems = Array.isArray(items) ? (items as Item[]) : [];

  return <DupeSearchForm initialItems={safeItems} initialDupes={safeDupes} />;
}
