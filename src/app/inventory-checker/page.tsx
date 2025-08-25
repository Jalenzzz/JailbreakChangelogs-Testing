import { fetchInventoryData, fetchRobloxUser, fetchRobloxAvatars } from '@/utils/api';
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

  // Fetch inventory data server-side with caching
  const inventoryData = await fetchInventoryData(id);

  if (!inventoryData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb />
        <h1 className="text-3xl font-bold mb-6">Inventory Checker</h1>
        <InventoryCheckerClient robloxId={id} error="Invalid Roblox ID. Please enter a valid numeric ID." />
      </div>
    );
  }

  // Fetch Roblox user data for the main user and original owners with caching (only for numeric IDs)
  const uniqueOwnerIds = Array.from(new Set(
    inventoryData.data
      .filter((item: { info: Array<{ title: string; value: string }> }) => item.info.some((info: { title: string }) => info.title === 'Original Owner'))
      .map((item: { info: Array<{ title: string; value: string }> }) => {
        const ownerInfo = item.info.find((info: { title: string }) => info.title === 'Original Owner');
        return ownerInfo?.value;
      })
      .filter((value: string | undefined): value is string => Boolean(value))
  ));

  // Add the main user ID to the list of IDs to fetch
  const allUserIds = [...uniqueOwnerIds, id];

  const robloxUsers: Record<string, { displayName?: string; name?: string }> = {};
  const robloxAvatars: Record<string, string> = {};
  
  // Fetch user data for each unique owner ID and main user with caching (only numeric IDs)
  for (const userId of allUserIds) {
    if (userId && typeof userId === 'string') {
      // Only try to fetch if it's a numeric ID
      if (/^\d+$/.test(userId)) {
        const userData = await fetchRobloxUser(userId);
        if (userData) {
          robloxUsers[userId] = userData;
        }
      } else {
        // For usernames, just store the username as-is
        robloxUsers[userId] = { displayName: userId, name: userId };
      }
    }
  }
  
  // Fetch avatars for numeric user IDs only
  const numericUserIds = allUserIds.filter((userId): userId is string => typeof userId === 'string' && /^\d+$/.test(userId));
  if (numericUserIds.length > 0) {
    const avatarData = await fetchRobloxAvatars(numericUserIds);
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
      <Breadcrumb />
      <h1 className="text-3xl font-bold mb-6">Inventory Checker</h1>
      <InventoryCheckerClient initialData={inventoryData} robloxId={id} robloxUsers={robloxUsers} robloxAvatars={robloxAvatars} />
    </div>
  );
}
