import { Suspense } from 'react';
import { DupeFinderItem, Item } from '@/types';
import DupeFinderResults from './DupeFinderResults';
import { UserDataService } from '@/services/userDataService';

interface DupeUserDataStreamerProps {
  robloxId: string;
  dupeData: DupeFinderItem[]; // Dupe finder data
  items: Item[]; // Items data passed from server
}

// Loading fallback component
function DupeUserDataLoadingFallback({ robloxId, dupeData, items }: DupeUserDataStreamerProps) {
  return (
    <DupeFinderResults
      initialData={dupeData}
      robloxId={robloxId}
      robloxUsers={{}}
      robloxAvatars={{}}
      userConnectionData={null}
      items={items}
    />
  );
}

// Component that fetches user data in parallel with optimized batching
async function DupeUserDataFetcher({ robloxId, dupeData, items }: DupeUserDataStreamerProps) {
  // Extract user IDs from dupe finder data
  const userIds = UserDataService.extractUserIdsFromDupeData(dupeData, robloxId);

  // Apply frequency-based prioritization for large dupe searches
  const MAX_USERS_TO_FETCH = 1000;
  const finalUserIds = UserDataService.prioritizeUsersByFrequency(
    userIds,
    dupeData as unknown as Array<Record<string, unknown>>,
    'latest_owner',
    MAX_USERS_TO_FETCH,
    'DUPE_FINDER',
  );

  // Fetch user data using the shared service
  const userDataResult = await UserDataService.fetchUserData(finalUserIds, {
    maxUsers: MAX_USERS_TO_FETCH,
    includeUserConnection: true,
    includeDupeData: false,
    context: 'DUPE_FINDER',
  });

  return (
    <DupeFinderResults
      initialData={dupeData}
      robloxId={robloxId}
      robloxUsers={userDataResult.robloxUsers}
      robloxAvatars={userDataResult.robloxAvatars}
      userConnectionData={userDataResult.userConnectionData || null}
      items={items}
    />
  );
}

export default function DupeUserDataStreamer({
  robloxId,
  dupeData,
  items,
}: DupeUserDataStreamerProps) {
  return (
    <Suspense
      fallback={
        <DupeUserDataLoadingFallback robloxId={robloxId} dupeData={dupeData} items={items} />
      }
    >
      <DupeUserDataFetcher robloxId={robloxId} dupeData={dupeData} items={items} />
    </Suspense>
  );
}
