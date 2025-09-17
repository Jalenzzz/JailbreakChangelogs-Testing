'use client';

import { useState, useEffect } from 'react';
import { useBotsPolling } from '@/hooks/useBotsPolling';
import { type ConnectedBot } from '@/utils/api';
import { fetchRobloxDataForBots, fetchRobloxDataForUser } from '@/app/api/bots/actions';
import { type RobloxUser, type RobloxAvatar } from '@/types';
import { useOptimizedRealTimeRelativeDate } from '@/hooks/useSharedTimer';
import { formatCustomDate } from '@/utils/timestamp';
import Image from 'next/image';

export default function ConnectedBotsPolling() {
  const { botsData, queueInfo, error, isLoading, retryCount, pollingStopped } =
    useBotsPolling(30000);
  const [botUsersData, setBotUsersData] = useState<Record<string, RobloxUser> | null>(null);
  const [botAvatarsData, setBotAvatarsData] = useState<Record<string, RobloxAvatar>>({});
  const [lastProcessedUserData, setLastProcessedUserData] = useState<Record<
    string,
    RobloxUser
  > | null>(null);
  const [lastProcessedAvatarData, setLastProcessedAvatarData] = useState<
    Record<string, RobloxAvatar>
  >({});
  const [loading, setLoading] = useState(true);

  // Get relative time for last scanned user
  const lastScannedRelativeTime = useOptimizedRealTimeRelativeDate(
    queueInfo?.last_dequeue?.data?.last_updated || 0,
    'last-scanned',
  );

  // Filter active bots (last 30 seconds) and sort alphabetically by display name
  const activeBots =
    botsData?.recent_heartbeats
      ?.filter((bot) => {
        const now = Math.floor(Date.now() / 1000);
        const thirtySecondsAgo = now - 30;
        return bot.last_heartbeat >= thirtySecondsAgo;
      })
      .sort((a, b) => {
        // Get display names for sorting, fallback to bot ID
        const nameA = botUsersData?.[a.id]?.displayName || botUsersData?.[a.id]?.name || a.id;
        const nameB = botUsersData?.[b.id]?.displayName || botUsersData?.[b.id]?.name || b.id;
        return nameA.localeCompare(nameB);
      }) || [];

  // Fetch Roblox data for bots only once (they don't change)
  useEffect(() => {
    const fetchBotRobloxData = async () => {
      if (!botsData || !botsData.recent_heartbeats || botsData.recent_heartbeats.length === 0) {
        setBotUsersData(null);
        setBotAvatarsData({});
        setLoading(false);
        return;
      }

      // Create a stable set of bot IDs (sorted to avoid re-fetching due to order changes)
      const botIds = [...new Set(botsData.recent_heartbeats.map((bot) => bot.id))].sort();

      // Check if we already have data for these bots
      if (botUsersData && Object.keys(botUsersData).length > 0) {
        const existingBotIds = Object.keys(botUsersData).sort();
        if (JSON.stringify(existingBotIds) === JSON.stringify(botIds)) {
          console.log('[CLIENT] Bot data already cached, skipping fetch');
          setLoading(false);
          return;
        }
      }

      console.log('[CLIENT] Fetching bot data (one-time):', botIds);
      setLoading(true);

      if (botIds.length > 0) {
        try {
          const result = await fetchRobloxDataForBots(botIds);

          if (result.success && result.data) {
            setBotUsersData(result.data.usersData);
            setBotAvatarsData(result.data.avatarsData);
            console.log('[CLIENT] Bot data fetched successfully');
          } else {
            console.error('[CLIENT] Failed to fetch bot data:', result.error);
            setBotUsersData(null);
            setBotAvatarsData({});
          }
        } catch (error) {
          console.error('[CLIENT] Failed to fetch bot Roblox data:', error);
          setBotUsersData(null);
          setBotAvatarsData({});
        }
      }

      setLoading(false);
    };

    fetchBotRobloxData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botsData?.recent_heartbeats?.length]); // Only depend on the number of bots, not the data itself

  // Fetch Roblox data for last processed user (changes every 30s)
  useEffect(() => {
    const fetchLastProcessedData = async () => {
      if (!queueInfo?.last_dequeue?.user_id) {
        setLastProcessedUserData(null);
        setLastProcessedAvatarData({});
        return;
      }

      const userId = queueInfo.last_dequeue.user_id;
      console.log('[CLIENT] Fetching last processed user data:', userId);

      try {
        const result = await fetchRobloxDataForUser(userId);

        if (result.success && result.data) {
          setLastProcessedUserData(result.data.usersData);
          setLastProcessedAvatarData(result.data.avatarsData);
          console.log('[CLIENT] Last processed user data fetched successfully');
        } else {
          console.error('[CLIENT] Failed to fetch last processed user data:', result.error);
          setLastProcessedUserData(null);
          setLastProcessedAvatarData({});
        }
      } catch (error) {
        console.error('[CLIENT] Failed to fetch last processed Roblox data:', error);
        setLastProcessedUserData(null);
        setLastProcessedAvatarData({});
      }
    };

    fetchLastProcessedData();
  }, [queueInfo?.last_dequeue?.user_id]); // Only when last processed user changes

  if (error) {
    return (
      <div className="mt-6">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-300">Active Bots</h2>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gray-500"></div>
            <span className="text-xs font-medium tracking-wide text-gray-500 uppercase">
              OFFLINE
            </span>
          </div>
        </div>
        <div className="rounded-lg border border-[#2E3944] bg-[#212A31] p-4 shadow-sm">
          <div className="py-8 text-center">
            <div className="mb-2 text-lg font-medium text-red-400">Error loading bots</div>
            <div className="mb-2 text-sm text-gray-500">{error}</div>
            {retryCount < 3 ? (
              <div className="text-sm text-blue-400">
                Auto-retrying in 5 seconds... (attempt {retryCount + 1}/3)
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Failed after 3 attempts. Will retry on next scheduled update.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loading && !botsData) {
    return (
      <div className="mt-6">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-300">Active Bots</h2>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500"></div>
            <span className="text-xs font-medium tracking-wide text-yellow-400 uppercase">
              CONNECTING
            </span>
          </div>
        </div>
        <div className="rounded-lg border border-[#2E3944] bg-[#212A31] p-4 shadow-sm">
          <div className="py-8 text-center">
            <div className="mb-2 text-lg font-medium text-gray-400">Loading bots...</div>
            <div className="text-sm text-gray-500">Fetching bot data</div>
          </div>
        </div>
      </div>
    );
  }

  if (activeBots.length === 0) {
    return (
      <div className="mt-6">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-300">Active Bots</h2>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gray-500"></div>
            <span className="text-xs font-medium tracking-wide text-gray-500 uppercase">
              OFFLINE
            </span>
          </div>
        </div>
        <div className="rounded-lg border border-[#2E3944] bg-[#212A31] p-4 shadow-sm">
          <div className="py-8 text-center">
            <div className="mb-2 text-lg font-medium text-gray-400">
              {pollingStopped ? 'Bots offline' : 'No bots active'}
            </div>
            <div className="text-sm text-gray-500">
              {pollingStopped
                ? 'No inventory scanning bots have been active for 2+ minutes. Please check back in a bit.'
                : 'No inventory scanning bots have been active in the last 30 seconds'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-xl font-bold text-gray-300">Active Bots</h2>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
          <span className="text-xs font-medium tracking-wide text-red-400 uppercase">LIVE</span>
        </div>
      </div>
      <div className="rounded-lg border border-[#2E3944] bg-[#212A31] p-4 shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"></div>
              <span className="text-sm text-blue-400">Updating...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Queue Stats */}
            {queueInfo && (
              <div className="mb-4 space-y-2 text-sm">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                  <span className="text-gray-400">Queue Length:</span>
                  <span className="font-bold text-white">
                    {queueInfo.queue_length.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                  <span className="text-gray-400">Current Delay:</span>
                  <span className="font-bold text-white">
                    {queueInfo.current_delay.toFixed(2)}s
                  </span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                  <span className="text-gray-400">Last Scanned:</span>
                  <div className="flex items-center gap-2">
                    {/* Avatar for last processed user */}
                    <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-gray-600">
                      {lastProcessedAvatarData &&
                      Object.values(lastProcessedAvatarData).find(
                        (avatar: RobloxAvatar) =>
                          avatar?.targetId?.toString() === queueInfo.last_dequeue.user_id,
                      )?.imageUrl ? (
                        <Image
                          src={
                            Object.values(lastProcessedAvatarData).find(
                              (avatar: RobloxAvatar) =>
                                avatar?.targetId?.toString() === queueInfo.last_dequeue.user_id,
                            )?.imageUrl || ''
                          }
                          alt="Last processed user avatar"
                          width={24}
                          height={24}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-white">
                          {(
                            lastProcessedUserData?.[queueInfo.last_dequeue.user_id]?.displayName ||
                            lastProcessedUserData?.[queueInfo.last_dequeue.user_id]?.name ||
                            queueInfo.last_dequeue.user_id
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <a
                      href={`https://www.roblox.com/users/${queueInfo.last_dequeue.user_id}/profile`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-blue-300 transition-colors hover:text-blue-200"
                    >
                      {lastProcessedUserData?.[queueInfo.last_dequeue.user_id]?.displayName ||
                        lastProcessedUserData?.[queueInfo.last_dequeue.user_id]?.name ||
                        queueInfo.last_dequeue.user_id}
                    </a>
                    {/* Show which bot scanned this user and timestamp */}
                    {(() => {
                      const botId = queueInfo.last_dequeue.data.bot_id;
                      const botUserData = botUsersData?.[botId];
                      if (botUserData) {
                        const botDisplayName =
                          botUserData.displayName || botUserData.name || `Bot ${botId}`;
                        return (
                          <span className="text-xs text-gray-400">
                            (scanned by{' '}
                            <a
                              href={`https://www.roblox.com/users/${botId}/profile`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-300 transition-colors hover:text-blue-200"
                            >
                              {botDisplayName}
                            </a>
                            ) • {lastScannedRelativeTime}
                          </span>
                        );
                      }
                      return (
                        <span className="text-xs text-gray-400">• {lastScannedRelativeTime}</span>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Bot List */}
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {activeBots.map((bot: ConnectedBot) => (
                <BotStatusCard
                  key={bot.id}
                  bot={bot}
                  usersData={botUsersData}
                  avatarsData={botAvatarsData}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BotStatusCard({
  bot,
  usersData,
  avatarsData,
}: {
  bot: ConnectedBot;
  usersData: Record<string, RobloxUser> | null;
  avatarsData: Record<string, RobloxAvatar>;
}) {
  const userData = usersData?.[bot.id];
  const displayName = userData?.displayName || userData?.name || `Bot ${bot.id}`;
  const username = userData?.name || bot.id;

  const relativeTime = useOptimizedRealTimeRelativeDate(
    bot.last_heartbeat,
    `bot-${bot.id}-heartbeat`,
  );

  const fullDate = formatCustomDate(bot.last_heartbeat);

  const avatarData =
    avatarsData && typeof avatarsData === 'object'
      ? Object.values(avatarsData).find(
          (avatar: RobloxAvatar) =>
            typeof avatar === 'object' &&
            avatar !== null &&
            'targetId' in avatar &&
            avatar.targetId?.toString() === bot.id,
        )
      : null;

  const avatarUrl = avatarData?.imageUrl || null;

  return (
    <div className="rounded-lg border border-[#2E3944] bg-[#212A31] p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-600">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`${displayName} avatar`}
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold text-white">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div>
            <a
              href={`https://www.roblox.com/users/${bot.id}/profile`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-300 transition-colors hover:text-blue-200"
            >
              {displayName}
            </a>
            <div className="text-xs text-gray-400">@{username}</div>
          </div>
        </div>

        <div className="sm:text-right">
          <div className="mb-1 text-xs text-gray-400">
            Last updated: {fullDate} ({relativeTime})
          </div>
          {bot.current_job && (
            <div className="text-xs text-blue-400">
              <div>Latest Job ID</div>
              <div className="font-mono text-xs break-all">{bot.current_job}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
