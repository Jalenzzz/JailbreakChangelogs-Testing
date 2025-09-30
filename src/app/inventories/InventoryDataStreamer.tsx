import { Suspense } from 'react';
import {
  fetchInventoryData,
  fetchRobloxUserByUsername,
  fetchLatestSeason,
  fetchComments,
  fetchItems,
} from '@/utils/api';
import { CommentData } from '@/utils/api';
import { UserData } from '@/types/auth';
import InventoryCheckerClient from './InventoryCheckerClient';
import UserDataStreamer from './UserDataStreamer';

interface InventoryDataStreamerProps {
  robloxId: string;
  initialComments?: CommentData[];
  initialCommentUserMap?: Record<string, UserData>;
}

// Component that fetches inventory data
async function InventoryDataFetcher({
  robloxId,
  initialComments,
  initialCommentUserMap,
}: InventoryDataStreamerProps) {
  // Check if the input is a username (not a number) or a Roblox ID
  const isUsername = !/^\d+$/.test(robloxId);

  let actualRobloxId = robloxId;

  // If it's a username, try to get the Roblox ID first
  if (isUsername) {
    try {
      const userData = await fetchRobloxUserByUsername(robloxId);
      if (userData && userData.id) {
        actualRobloxId = userData.id.toString();

        // Fetch comments for the resolved ID if we don't have initial comments
        if (!initialComments || initialComments.length === 0) {
          const commentsData = await fetchComments('inventory', actualRobloxId);
          initialComments = commentsData.comments;
          initialCommentUserMap = commentsData.userMap;
        }
      } else {
        const truncatedUsername =
          robloxId.length > 50 ? `${robloxId.substring(0, 47)}...` : robloxId;
        return (
          <InventoryCheckerClient
            robloxId={robloxId}
            error={`Username "${truncatedUsername}" not found. Please check the spelling and try again.`}
            initialComments={initialComments}
            initialCommentUserMap={initialCommentUserMap}
          />
        );
      }
    } catch (error) {
      console.error('Error fetching user by username:', error);
      const truncatedUsername = robloxId.length > 50 ? `${robloxId.substring(0, 47)}...` : robloxId;

      // Check if it's a 502 error specifically for the username lookup
      const isServerError =
        error instanceof Error && error.message.includes('Failed to fetch user: 502');

      const errorMessage = isServerError
        ? `Server error while searching for "${truncatedUsername}". Please try searching by Roblox ID instead, or try again later.`
        : `Failed to find user "${truncatedUsername}". Please check the spelling and try again, or try searching by Roblox ID instead.`;

      return (
        <InventoryCheckerClient
          robloxId={robloxId}
          error={errorMessage}
          initialComments={initialComments}
          initialCommentUserMap={initialCommentUserMap}
        />
      );
    }
  }

  const [result, currentSeason, items] = await Promise.all([
    fetchInventoryData(actualRobloxId),
    fetchLatestSeason(),
    fetchItems(),
  ]);

  // Check if the result contains an error
  if ((result && typeof result === 'object' && 'error' in result) || typeof result === 'string') {
    const errorMessage =
      typeof result === 'string' ? result : (result as { message?: string }).message;
    return (
      <InventoryCheckerClient
        robloxId={actualRobloxId}
        error={errorMessage}
        initialComments={initialComments}
        initialCommentUserMap={initialCommentUserMap}
      />
    );
  }

  // Check if no data was returned
  if (!result) {
    return (
      <InventoryCheckerClient
        robloxId={actualRobloxId}
        error="Failed to fetch inventory data. Please try again."
        initialComments={initialComments}
        initialCommentUserMap={initialCommentUserMap}
      />
    );
  }

  return (
    <Suspense
      fallback={
        <InventoryCheckerClient
          robloxId={actualRobloxId}
          initialData={result}
          isLoading={true}
          initialComments={initialComments}
          initialCommentUserMap={initialCommentUserMap}
        />
      }
    >
      <UserDataStreamer
        robloxId={actualRobloxId}
        inventoryData={result}
        currentSeason={currentSeason}
        initialComments={initialComments}
        initialCommentUserMap={initialCommentUserMap}
        items={items}
      />
    </Suspense>
  );
}

export default function InventoryDataStreamer({
  robloxId,
  initialComments,
  initialCommentUserMap,
}: InventoryDataStreamerProps) {
  return (
    <InventoryDataFetcher
      robloxId={robloxId}
      initialComments={initialComments}
      initialCommentUserMap={initialCommentUserMap}
    />
  );
}
