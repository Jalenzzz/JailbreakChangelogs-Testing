interface User {
  id: string;
  username: string;
  avatar: string;
  global_name: string;
  usernumber: number;
  accent_color: string;
  custom_avatar?: string;
  presence?: {
    status: "Online" | "Offline";
    last_updated: number;
  };
}

export interface Changelog {
  id: number;
  title: string;
  sections: string;
  image_url: string;
}

export interface Reward {
  id: number;
  season_number: number;
  item: string;
  requirement: string;
  link: string;
  exclusive: string;
  bonus: string;
}

export interface Season {
  season: number;
  title: string;
  description: string;
  is_current: number;
  start_date: number;
  end_date: number;
  rewards: Reward[];
}

import { Item, ItemDetails } from "@/types";
import { UserData } from "@/types/auth";

export const BASE_API_URL =
  process.env.NEXT_PHASE === 'phase-production-build' || process.env.RAILWAY_ENVIRONMENT_NAME !== 'production'
    ? process.env.NEXT_PUBLIC_API_URL
    : process.env.RAILWAY_INTERNAL_API_URL;

export const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
export const INVENTORY_API_URL = process.env.NEXT_PUBLIC_INVENTORY_API_URL;
export interface OnlineUser {
  id: string;
  username: string;
  global_name: string;
  avatar: string;
  created_at: string;
  premiumtype: number;
  usernumber: number;
  last_seen: number;
}

export const fetchUsers = async () => {
  const response = await fetch(`${BASE_API_URL}/users/list`);
  const data = await response.json();
  return data.sort((a: User, b: User) => a.usernumber - b.usernumber);
};

export async function fetchUserById(id: string) {
  try {
    const response = await fetch(`${BASE_API_URL}/users/get?id=${id}&nocache=true`);
    const data = await response.json();
    
    if (!response.ok) {
      // Handle banned users specifically without logging the error response
      if (response.status === 403) {
        const errorMessage = data.detail || 'This user is banned from Jailbreak Changelogs.';
        throw new Error(`BANNED_USER: ${errorMessage}`);
      }
      
      // Log error response for other types of errors
      console.error('Error response:', {
        status: response.status,
        statusText: response.statusText,
        data: JSON.stringify(data, null, 2)
      });
      
      if (data.detail) {
        throw new Error(`Failed to fetch user: ${response.status} - ${JSON.stringify(data.detail)}`);
      }
      throw new Error(`Failed to fetch user: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    
    // Re-throw BANNED_USER errors so calling code can handle them
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.startsWith('BANNED_USER:')) {
      throw error;
    }
    
    return null;
  }
}

export async function fetchUserByIdForOG(id: string) {
  try {
    const fields = [
      'id',
      'username', 
      'global_name',
      'usernumber',
      'accent_color',
      'avatar',
      'banner',
      'custom_avatar',
      'custom_banner',
      'settings'
    ].join(',');
    
    const response = await fetch(`${BASE_API_URL}/users/get?id=${id}&fields=${fields}`);
    const data = await response.json();
    
    if (!response.ok) {
      // Handle banned users specifically without logging the error response
      if (response.status === 403) {
        const errorMessage = data.detail || 'This user is banned from Jailbreak Changelogs.';
        throw new Error(`BANNED_USER: ${errorMessage}`);
      }
      
      // Log error response for other types of errors
      console.error('Error response:', {
        status: response.status,
        statusText: response.statusText,
        data: JSON.stringify(data, null, 2)
      });
      
      if (data.detail) {
        throw new Error(`Failed to fetch user: ${response.status} - ${JSON.stringify(data.detail)}`);
      }
      throw new Error(`Failed to fetch user: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching user by ID for OG:', error);
    
    // Re-throw BANNED_USER errors so calling code can handle them
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.startsWith('BANNED_USER:')) {
      throw error;
    }
    
    return null;
  }
}

export async function fetchUserByIdForMetadata(id: string) {
  try {
    const fields = [
      'accent_color',
      'global_name',
      'username'
    ].join(',');
    
    const response = await fetch(`${BASE_API_URL}/users/get?id=${id}&fields=${fields}`);
    const data = await response.json();
    
    if (!response.ok) {
      // Handle banned users specifically without logging the error response
      if (response.status === 403) {
        const errorMessage = data.detail || 'This user is banned from Jailbreak Changelogs.';
        throw new Error(`BANNED_USER: ${errorMessage}`);
      }
      
      // Log error response for other types of errors
      console.error('Error response:', {
        status: response.status,
        statusText: response.statusText,
        data: JSON.stringify(data, null, 2)
      });
      
      if (data.detail) {
        throw new Error(`Failed to fetch user: ${response.status} - ${JSON.stringify(data.detail)}`);
      }
      throw new Error(`Failed to fetch user: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching user by ID for metadata:', error);
    
    // Re-throw BANNED_USER errors so calling code can handle them
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.startsWith('BANNED_USER:')) {
      throw error;
    }
    
    return null;
  }
}

export const fetchUsersForList = async () => {
  const fields = [
    'id',
    'username',
    'global_name',
    'avatar',
    'usernumber',
    'accent_color',
    'custom_avatar',
    'settings',
    'premiumtype',
    'created_at',
    'roblox_id',
    'roblox_username',
    'roblox_display_name',
    'roblox_avatar',
    'roblox_join_date'
  ].join(',');
  
  const response = await fetch(`${BASE_API_URL}/users/list?fields=${fields}&nocache=true`);
  const data = await response.json();
  return data.sort((a: User, b: User) => a.usernumber - b.usernumber);
};

export async function fetchItems() {
  try {
    const response = await fetch(`${BASE_API_URL}/items/list`);
    if (!response.ok) throw new Error("Failed to fetch items");
    const data = await response.json();
    return data as Item[];
  } catch (err) {
    console.error('[SERVER] Error fetching items:', err);
    return [];
  }
}

export async function fetchLastUpdated(items: Item[]) {
  try {
    if (!items || items.length === 0) {
      console.log('No items provided for last updated');
      return null;
    }

    // Create an array of all items including sub-items
    const allItems = items.reduce((acc: Item[], item) => {
      acc.push(item);
      if (item.children && Array.isArray(item.children)) {
        item.children.forEach(child => {
          if (child.data) {
            acc.push({
              ...item,
              last_updated: child.data.last_updated,
              name: child.sub_name
            });
          }
        });
      }
      return acc;
    }, []);

    // Sort all items by last_updated in descending order and get the most recent
    const mostRecentItem = [...allItems].sort((a, b) => {
      const aTime = a.last_updated < 10000000000 ? a.last_updated * 1000 : a.last_updated;
      const bTime = b.last_updated < 10000000000 ? b.last_updated * 1000 : b.last_updated;
      return bTime - aTime;
    })[0];

    // Return the raw timestamp (in ms)
    const rawTimestamp = mostRecentItem.last_updated < 10000000000 ? mostRecentItem.last_updated * 1000 : mostRecentItem.last_updated;
    return rawTimestamp;
  } catch (err) {
    console.error('Error getting last updated time:', err);
    return null;
  }
}

export async function fetchItem(type: string, name: string): Promise<ItemDetails | null> {
  try {
    const itemName = decodeURIComponent(name);
    const itemType = decodeURIComponent(type);
    
    const response = await fetch(
      `${BASE_API_URL}/items/get?name=${encodeURIComponent(itemName)}&type=${encodeURIComponent(itemType)}`
    );
    
    if (!response.ok) {
      console.log('[SERVER] Item not found:', { type: itemType, name: itemName });
      return null;
    }
    
    const data = await response.json();
    return data as ItemDetails;
  } catch (err) {
    console.error('[SERVER] Error fetching item:', err);
    return null;
  }
}

export async function fetchChangelogList(): Promise<Changelog[]> {
  const response = await fetch(`${BASE_API_URL}/changelogs/list`);
  if (!response.ok) throw new Error('Failed to fetch changelog list');
  return response.json();
}

export async function fetchChangelog(id: string): Promise<Changelog> {
  const response = await fetch(`${BASE_API_URL}/changelogs/get?id=${id}`);
  if (!response.ok) throw new Error('Failed to fetch changelog');
  return response.json();
}

export async function fetchLatestChangelog(): Promise<Changelog> {
  const response = await fetch(`${BASE_API_URL}/changelogs/latest`);
  if (!response.ok) throw new Error('Failed to fetch latest changelog');
  return response.json();
}

export async function fetchItemsChangelog(id: string) {
  try {
    const response = await fetch(`${BASE_API_URL}/items/changelogs/get?id=${id}`);
    
    if (response.status === 404) {
      console.log(`[SERVER] Items changelog ${id} not found`);
      return null;
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch items changelog');
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('[SERVER] Error fetching items changelog:', err);
    return null;
  }
}

export async function fetchItemChanges(id: string) {
  try {
    const response = await fetch(`${BASE_API_URL}/item/changes?id=${id}`);
    if (response.status === 404) {
      console.log(`[SERVER] Item changes for item ${id} not found`);
      return [] as unknown[];
    }
    if (!response.ok) {
      throw new Error('Failed to fetch item changes');
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('[SERVER] Error fetching item changes:', err);
    return [] as unknown[];
  }
}

export async function fetchTradeAds() {
  try {
    const response = await fetch(`${BASE_API_URL}/trades/list?nocache=true`);
    
    if (response.status === 404) {
      // 404 means no trade ads found (all expired)
      return [];
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch trade ads');
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('[SERVER] Error fetching trade ads:', err);
    return [];
  }
}

export async function fetchTradeAd(id: string) {
  try {
    const response = await fetch(`${BASE_API_URL}/trades/get?id=${id}`);
    
    if (response.status === 404) {
      console.log(`[SERVER] Trade ad ${id} not found`);
      return null;
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch trade ad');
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('[SERVER] Error fetching trade ad:', err);
    return null;
  }
}

export async function fetchUsersBatch(userIds: string[]) {
  try {
    if (userIds.length === 0) {
      return {};
    }
    
    const response = await fetch(`${BASE_API_URL}/users/get/batch?ids=${userIds.join(',')}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch users batch');
    }
    
    const userDataArray = await response.json();
    const userMap = userDataArray.reduce((acc: Record<string, UserData>, user: UserData) => {
      acc[user.id] = user;
      return acc;
    }, {});
    
    return userMap;
  } catch (err) {
    console.error('[SERVER] Error fetching users batch:', err);
    return {};
  }
}

export async function fetchDupes() {
  try {
    const response = await fetch(`${BASE_API_URL}/dupes/list`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch dupes');
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('[SERVER] Error fetching dupes:', err);
    return [];
  }
}

export async function fetchLatestSeason() {
  try {
    const response = await fetch(`${BASE_API_URL}/seasons/latest`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch latest season');
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('[SERVER] Error fetching latest season:', err);
    return null;
  }
}

export async function fetchSeasonsList() {
  try {
    const response = await fetch(`${BASE_API_URL}/seasons/list`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch seasons list');
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('[SERVER] Error fetching seasons list:', err);
    return [];
  }
}

export async function fetchSeason(id: string) {
  try {
    const response = await fetch(`${BASE_API_URL}/seasons/get?id=${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch season');
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('[SERVER] Error fetching season:', err);
    return null;
  }
}

export async function fetchOnlineUsers(): Promise<OnlineUser[]> {
  try {
    const response = await fetch(`${BASE_API_URL}/users/list/online`);
    if (!response.ok) {
      throw new Error('Failed to fetch online users');
    }
    const data = await response.json();
    const list = Array.isArray(data) ? (data as OnlineUser[]) : [];
    return list;
  } catch (err) {
    console.error('[SERVER] Error fetching online users:', err);
    return [];
  }
}

export async function fetchItemFavorites(id: string) {
  try {
    const response = await fetch(`${BASE_API_URL}/item/favorites?id=${id}`);
    
    if (response.status === 404) {
      console.log(`[SERVER] Item favorites ${id} not found`);
      return null;
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch item favorites');
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('[SERVER] Error fetching item favorites:', err);
    return null;
  }
}

export async function fetchUserFavorites(userId: string) {
  try {
    const response = await fetch(`${PUBLIC_API_URL}/favorites/get?user=${userId}`);
    
    if (response.status === 404) {
      console.log(`[CLIENT] User favorites ${userId} not found`);
      return null;
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch user favorites');
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('[CLIENT] Error fetching user favorites:', err);
    return null;
  }
}

export async function fetchRandomItem() {
  try {
    const response = await fetch(`${BASE_API_URL}/items/random`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch random item');
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('[SERVER] Error fetching random item:', err);
    throw err;
  }
}

export async function fetchItemHistory(id: string) {
  try {
    const response = await fetch(`${PUBLIC_API_URL}/item/history?id=${id}`);
    
    if (response.status === 404) {
      console.log(`[CLIENT] Value history for Item ${id} not found`);
      return null;
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch item history');
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('[CLIENT] Error fetching item history:', err);
    return null;
  }
}

export async function fetchItemsByType(type: string) {
  try {
    const response = await fetch(`${BASE_API_URL}/items/get?type=${encodeURIComponent(type)}`);
    
    if (response.status === 404) {
      console.log(`[SERVER] Items with type ${type} not found`);
      return null;
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch items by type');
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('[SERVER] Error fetching items by type:', err);
    return null;
  }
}

export interface CommentData {
  id: number;
  author: string;
  content: string;
  date: string;
  item_id: number;
  item_type: string;
  user_id: string;
  edited_at: string | null;
  owner: string;
}

export async function fetchComments(type: string, id: string, itemType?: string) {
  try {
    const commentType = type === 'item' ? itemType : type;
    const response = await fetch(`${BASE_API_URL}/comments/get?type=${commentType}&id=${id}&nocache=true`);
    
    if (response.status === 404) {
      console.log(`[SERVER] Comments for ${commentType} ${id} not found`);
      return { comments: [], userMap: {} };
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }
    
    const data = await response.json();
    const commentsArray = Array.isArray(data) ? data : [];
    
    // Fetch user data for comments server-side
    if (commentsArray.length > 0) {
      const userIds = Array.from(new Set(commentsArray.map(comment => comment.user_id))).filter(Boolean) as string[];
      const userMap = await fetchUsersBatch(userIds);
      return { comments: commentsArray, userMap };
    }
    
    return { comments: commentsArray, userMap: {} };
  } catch (err) {
    console.error('[SERVER] Error fetching comments:', err);
    return { comments: [], userMap: {} };
  }
}

export async function fetchInventoryData(robloxId: string) {
  console.log('[SERVER] fetchInventoryData called with robloxId:', robloxId);
  try {
    const response = await fetch(`${INVENTORY_API_URL}/user?id=${robloxId}`, {
      headers: {
        'User-Agent': 'JailbreakChangelogs-InventoryChecker/1.0'
      }
    });
    
    if (!response.ok) {
      console.error(`[SERVER] Inventory API returned ${response.status} for ID: ${robloxId}`);
      if (response.status === 404) {
        return { error: 'not_found', message: 'This user has not been scanned by our bots yet. Their inventory data is not available.' };
      }
      throw new Error(`Failed to fetch inventory data: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('[SERVER] Error fetching inventory data:', err);
    return { error: 'fetch_error', message: 'Failed to fetch inventory data. Please try again.' };
  }
}

export async function fetchRobloxUsersBatch(userIds: string[]) {
  try {
    // Validate input
    if (!userIds || userIds.length === 0) {
      console.log('[SERVER] fetchRobloxUsersBatch: No userIds provided, returning empty data');
      return { data: [] };
    }
    
    // Filter out any invalid IDs and convert to numbers
    const validUserIds = userIds
      .filter(id => id && typeof id === 'string' && /^\d+$/.test(id))
      .map(id => parseInt(id, 10));
    
    if (validUserIds.length === 0) {
      console.warn('[SERVER] fetchRobloxUsersBatch: No valid userIds found after filtering, returning empty data');
      return { data: [] };
    }
    
    // Roblox API has a limit on how many user IDs can be requested at once
    // Let's batch them into chunks of 100 (safe limit for batch requests)
    const batchSize = 100;
    const allUserData: Array<{ hasVerifiedBadge: boolean; id: number; name: string; displayName: string }> = [];
    
    for (let i = 0; i < validUserIds.length; i += batchSize) {
      const batch = validUserIds.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
  
      try {
        const response = await fetch('https://users.roproxy.com/v1/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'JailbreakChangelogs-InventoryChecker/1.0'
          },
          body: JSON.stringify({ userIds: batch }),
          next: { revalidate: 3600 } // Cache for 1 hour
        });
        
        if (!response.ok) {
          console.error(`[SERVER] fetchRobloxUsersBatch: Batch ${batchNumber} failed with status ${response.status} ${response.statusText}`);
          continue; // Skip this batch and continue with others
        }
        
        const data = await response.json();
        if (data && data.data && Array.isArray(data.data)) {
          allUserData.push(...data.data);
        } else {
          console.warn(`[SERVER] fetchRobloxUsersBatch: Batch ${batchNumber} returned invalid data structure:`, data);
        }
      } catch (batchErr) {
        console.error(`[SERVER] fetchRobloxUsersBatch: Error processing batch ${batchNumber}:`, batchErr);
        continue; // Skip this batch and continue with others
      }
      
      // Add a small delay between batches to be respectful to the API
      if (i + batchSize < validUserIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return { data: allUserData };
  } catch (err) {
    console.error('[SERVER] fetchRobloxUsersBatch: Unexpected error:', err);
    return null;
  }
}

export async function fetchRobloxUser(robloxId: string) {
  try {
    // Use the batch endpoint for single user as well
    const result = await fetchRobloxUsersBatch([robloxId]);
    
    if (!result || !result.data || result.data.length === 0) {
      throw new Error(`Failed to fetch Roblox user: ${robloxId}`);
    }
    
    return result.data[0];
  } catch (err) {
    console.error(`[SERVER] Error fetching Roblox user ${robloxId}:`, err);
    return null;
  }
}



export async function fetchRobloxAvatars(userIds: string[]) {
  try {
    // Validate input
    if (!userIds || userIds.length === 0) {
      console.log('[SERVER] fetchRobloxAvatars: No userIds provided, returning empty data');
      return { data: [] };
    }
    
    // Filter out any invalid IDs
    const validUserIds = userIds.filter(id => id && typeof id === 'string' && /^\d+$/.test(id));
    
    if (validUserIds.length === 0) {
      console.warn('[SERVER] fetchRobloxAvatars: No valid userIds found after filtering, returning empty data');
      return { data: [] };
    }
    
    // Roblox API has a limit on how many user IDs can be requested at once
    // Let's batch them into chunks of 50 (safe limit)
    const batchSize = 50;
    const allAvatarData: Array<{ state: string; imageUrl?: string; targetId: number }> = [];
    
    for (let i = 0; i < validUserIds.length; i += batchSize) {
      const batch = validUserIds.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
  
      try {
        const response = await fetch(`https://thumbnails.roproxy.com/v1/users/avatar-headshot?userIds=${batch.join(',')}&size=420x420&format=Webp&isCircular=true`, {
          next: { revalidate: 3600 }, // Cache for 1 hour
          headers: {
            'User-Agent': 'JailbreakChangelogs-InventoryChecker/1.0'
          }
        });
        
        if (!response.ok) {
          console.error(`[SERVER] fetchRobloxAvatars: Batch ${batchNumber} failed with status ${response.status} ${response.statusText}`);
          continue; // Skip this batch and continue with others
        }
        
        const data = await response.json();
        if (data && data.data && Array.isArray(data.data)) {
          allAvatarData.push(...data.data);
        } else {
          console.warn(`[SERVER] fetchRobloxAvatars: Batch ${batchNumber} returned invalid data structure:`, data);
        }
      } catch (batchErr) {
        console.error(`[SERVER] fetchRobloxAvatars: Error processing batch ${batchNumber}:`, batchErr);
        continue; // Skip this batch and continue with others
      }
      
      // Add a small delay between batches to be respectful to the API
      if (i + batchSize < validUserIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return { data: allAvatarData };
  } catch (err) {
    console.error('[SERVER] fetchRobloxAvatars: Unexpected error:', err);
    return null;
  }
}