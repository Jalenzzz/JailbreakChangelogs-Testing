import { Suspense } from 'react';
import InventoryCheckerClient from './InventoryCheckerClient';
import InventoryDataStreamer from './InventoryDataStreamer';
import Breadcrumb from '@/components/Layout/Breadcrumb';

// ISR Configuration - revalidate every 5 minutes
export const revalidate = 300;

interface InventoryCheckerPageProps {
  searchParams: {
    id?: string;
  };
}

export default async function InventoryCheckerPage({ searchParams }: InventoryCheckerPageProps) {
  const params = await searchParams;
  const { id } = params;

  if (!id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb />
        <h1 className="text-3xl font-bold mb-6">Inventory Checker</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Enter a Roblox ID to check their Jailbreak inventory.
        </p>
        <InventoryCheckerClient />
      </div>
    );
  }

  // Validate that id is a valid number
  const robloxId = parseInt(id);
  if (isNaN(robloxId) || robloxId <= 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb />
        <h1 className="text-3xl font-bold mb-6">Inventory Checker</h1>
        <InventoryCheckerClient robloxId={id} error="Invalid Roblox ID. Please enter a valid numeric ID." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb />
      <h1 className="text-3xl font-bold mb-6">Inventory Checker</h1>
      <Suspense fallback={<InventoryCheckerClient robloxId={id} isLoading={true} />}>
        <InventoryDataStreamer robloxId={id} />
      </Suspense>
    </div>
  );
}
