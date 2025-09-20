import { TradeAdDetailsSkeleton } from '@/components/trading/TradeAdDetailsSkeleton';
import Breadcrumb from '@/components/Layout/Breadcrumb';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Loading() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto mb-8 px-4 sm:px-6">
        <Breadcrumb loading={true} />
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/trading"
            className="inline-flex items-center gap-2 text-blue-300 transition-colors hover:text-blue-400"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Trading
          </Link>
        </div>
        <TradeAdDetailsSkeleton />
      </div>
    </main>
  );
}
