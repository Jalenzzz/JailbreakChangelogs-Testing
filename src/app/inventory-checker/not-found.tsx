import Link from 'next/link';

export default function InventoryCheckerNotFound() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-4">Inventory Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The inventory for this Roblox ID could not be found. This could be because:
          </p>
          <ul className="text-left max-w-md mx-auto mb-6 space-y-2 text-gray-600 dark:text-gray-400">
            <li>• The Roblox ID is invalid</li>
            <li>• The player&apos;s inventory is private</li>
            <li>• The player hasn&apos;t played Jailbreak</li>
            <li>• The data is temporarily unavailable</li>
          </ul>
          <Link
            href="/inventory-checker"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
          >
            Try Another ID
          </Link>
        </div>
      </div>
    </div>
  );
}
