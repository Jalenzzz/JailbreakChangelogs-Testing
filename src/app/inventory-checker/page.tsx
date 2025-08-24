import { fetchInventoryData, fetchRobloxUser, fetchRobloxAvatars } from '@/utils/api';
import { notFound } from 'next/navigation';
import InventoryCheckerClient from './InventoryCheckerClient';
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
        <div className="max-w-4xl mx-auto">
          <Breadcrumb />
          <h1 className="text-3xl font-bold mb-6">Inventory Checker</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Enter a Roblox ID to check their Jailbreak inventory.
          </p>
          <InventoryCheckerClient />
        </div>
      </div>
    );
  }

  // Validate that id is a valid number
  const robloxId = parseInt(id);
  if (isNaN(robloxId) || robloxId <= 0) {
    notFound();
  }

  // Fetch inventory data server-side with caching
  const inventoryData = await fetchInventoryData(id);

  if (!inventoryData) {
    notFound();
  }

  // Fetch Roblox user data for original owners with caching (only for numeric IDs)
  const uniqueOwnerIds = Array.from(new Set(
    inventoryData.data
      .filter((item: { info: Array<{ title: string; value: string }> }) => item.info.some((info: { title: string }) => info.title === 'Original Owner'))
      .map((item: { info: Array<{ title: string; value: string }> }) => {
        const ownerInfo = item.info.find((info: { title: string }) => info.title === 'Original Owner');
        return ownerInfo?.value;
      })
      .filter((value: string | undefined): value is string => Boolean(value))
  ));

  const robloxUsers: Record<string, { displayName?: string; name?: string }> = {};
  const robloxAvatars: Record<string, string> = {};
  
  // Fetch user data for each unique owner ID with caching (only numeric IDs)
  for (const ownerId of uniqueOwnerIds) {
    if (ownerId && typeof ownerId === 'string') {
      // Only try to fetch if it's a numeric ID
      if (/^\d+$/.test(ownerId)) {
        const userData = await fetchRobloxUser(ownerId);
        if (userData) {
          robloxUsers[ownerId] = userData;
        }
      } else {
        // For usernames, just store the username as-is
        robloxUsers[ownerId] = { displayName: ownerId, name: ownerId };
      }
    }
  }
  
  // Fetch avatars for numeric user IDs only
  const numericOwnerIds = uniqueOwnerIds.filter((id): id is string => typeof id === 'string' && /^\d+$/.test(id));
  if (numericOwnerIds.length > 0) {
    const avatarData = await fetchRobloxAvatars(numericOwnerIds);
    if (avatarData && avatarData.data && Array.isArray(avatarData.data)) {
      avatarData.data.forEach((avatar: { state: string; imageUrl?: string; targetId: number }) => {
        if (avatar.state === 'Completed' && avatar.imageUrl) {
          robloxAvatars[avatar.targetId.toString()] = avatar.imageUrl;
        }
      });
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb />
        <h1 className="text-3xl font-bold mb-6">Inventory Checker</h1>
        <InventoryCheckerClient initialData={inventoryData} robloxId={id} robloxUsers={robloxUsers} robloxAvatars={robloxAvatars} />
      </div>
    </div>
  );
}
