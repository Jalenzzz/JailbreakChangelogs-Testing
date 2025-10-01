/**
 * Fisher-Yates shuffle algorithm implementation
 * This algorithm provides an unbiased way to shuffle an array
 * @param array - The array to shuffle
 * @returns A new shuffled array (doesn't mutate the original)
 */
export function fisherYatesShuffle<T>(array: T[]): T[] {
  // Create a copy of the array to avoid mutating the original
  const shuffled = [...array];

  // Start from the last element and work backwards
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Generate a random index between 0 and i (inclusive)
    const randomIndex = Math.floor(Math.random() * (i + 1));

    // Swap elements at positions i and randomIndex
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  return shuffled;
}

/**
 * Generate a shuffled array of background image URLs
 * @param count - Number of background images available (default: 27)
 * @param baseUrl - Base URL for the background images
 * @returns Array of shuffled background image URLs
 */
export function generateShuffledBackgroundImages(
  count: number = 27,
  baseUrl: string = 'https://assets.jailbreakchangelogs.xyz/assets/backgrounds',
): string[] {
  // Generate array of image URLs
  const imageUrls = Array.from({ length: count }, (_, i) => `${baseUrl}/background${i + 1}.webp`);

  // Shuffle the array using Fisher-Yates algorithm
  return fisherYatesShuffle(imageUrls);
}
