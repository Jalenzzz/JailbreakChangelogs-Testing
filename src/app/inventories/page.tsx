import InventoryCheckerClient from './InventoryCheckerClient';
import Breadcrumb from '@/components/Layout/Breadcrumb';

export default function InventoryCheckerPage() {
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
