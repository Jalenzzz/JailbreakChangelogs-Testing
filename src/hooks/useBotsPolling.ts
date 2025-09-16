'use client';

import { useState, useEffect, useCallback } from 'react';
import { pollBotsData } from '@/app/api/bots/actions';
import { type ConnectedBotsResponse, type QueueInfo } from '@/utils/api';

interface BotsPollingData {
  botsData: ConnectedBotsResponse | null;
  queueInfo: QueueInfo | null;
  lastUpdated: number;
  error: string | null;
  isLoading: boolean;
  retryCount: number;
  consecutiveEmptyResults: number;
  pollingStopped: boolean;
}

export function useBotsPolling(intervalMs: number = 30000) {
  const [data, setData] = useState<BotsPollingData>({
    botsData: null,
    queueInfo: null,
    lastUpdated: 0,
    error: null,
    isLoading: true,
    retryCount: 0,
    consecutiveEmptyResults: 0,
    pollingStopped: false,
  });

  const fetchData = useCallback(async () => {
    const timestamp = new Date().toISOString();
    console.log(`[POLLING] Starting data fetch at ${timestamp}`);

    // Set loading state
    setData((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await pollBotsData();

      if (result.success && result.data) {
        const activeBotsCount =
          result.data.botsData?.recent_heartbeats?.filter((bot) => {
            const now = Math.floor(Date.now() / 1000);
            const thirtySecondsAgo = now - 30;
            return bot.last_heartbeat >= thirtySecondsAgo;
          }).length || 0;

        console.log(`[POLLING] Successfully fetched data at ${timestamp}:`, {
          botsCount: result.data.botsData?.recent_heartbeats?.length || 0,
          activeBotsCount,
          queueLength: result.data.queueInfo?.queue_length || 0,
          lastProcessed: result.data.queueInfo?.last_dequeue?.user_id || 'none',
        });

        setData((prev) => {
          const newConsecutiveEmpty = activeBotsCount === 0 ? prev.consecutiveEmptyResults + 1 : 0;
          const shouldStopPolling = newConsecutiveEmpty >= 4;

          if (shouldStopPolling) {
            console.log(
              `[POLLING] Stopping polling after ${newConsecutiveEmpty} consecutive empty results (2 minutes)`,
            );
          }

          return {
            botsData: result.data.botsData,
            queueInfo: result.data.queueInfo,
            lastUpdated: Date.now(),
            error: null,
            isLoading: false,
            retryCount: 0,
            consecutiveEmptyResults: newConsecutiveEmpty,
            pollingStopped: shouldStopPolling,
          };
        });
      } else {
        console.error(`[POLLING] Failed to fetch data at ${timestamp}:`, result.error);
        setData((prev) => ({
          ...prev,
          error: result.error || 'Unknown error',
          isLoading: false,
          retryCount: prev.retryCount + 1,
        }));
      }
    } catch (error) {
      console.error(`[POLLING] Network error at ${timestamp}:`, error);
      setData((prev) => ({
        ...prev,
        error: 'Network error',
        isLoading: false,
        retryCount: prev.retryCount + 1,
      }));
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up polling interval only if polling hasn't been stopped
    const interval = setInterval(() => {
      if (!data.pollingStopped) {
        fetchData();
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [fetchData, intervalMs, data.pollingStopped]);

  // Auto-retry on error
  useEffect(() => {
    if (data.error && data.retryCount < 3) {
      console.log(`[POLLING] Auto-retrying in 5 seconds (attempt ${data.retryCount + 1}/3)`);
      const retryTimeout = setTimeout(() => {
        fetchData();
      }, 5000);

      return () => clearTimeout(retryTimeout);
    }
  }, [data.error, data.retryCount, fetchData]);

  return {
    ...data,
    refetch: fetchData,
  };
}
