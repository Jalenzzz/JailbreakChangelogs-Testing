import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import InventoryCheckerClient from '../InventoryCheckerClient';
import InventoryDataStreamer from '../InventoryDataStreamer';
import Breadcrumb from '@/components/Layout/Breadcrumb';

// ISR Configuration - revalidate every 5 minutes
export const revalidate = 300;

interface InventoryCheckerPageProps {
  params: Promise<{
    userid: string;
  }>;
}

export default async function InventoryCheckerPage({ params }: InventoryCheckerPageProps) {
  const { userid } = await params;

  // Validate that userid is a valid number
  const robloxId = parseInt(userid);
  if (isNaN(robloxId) || robloxId <= 0) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb />
      <h1 className="text-3xl font-bold mb-6">Inventory Checker</h1>
      <Suspense fallback={<InventoryCheckerClient robloxId={userid} isLoading={true} />}>
        <InventoryDataStreamer robloxId={userid} />
      </Suspense>
    </div>
  );
}
