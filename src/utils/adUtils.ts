/**
 * Utility functions for ad management and reloading
 */

/**
 * Clears all ad content from elements with data-ad="true" attribute
 */
export function clearAdContent(): void {
  const adDivs = document.querySelectorAll('[data-ad="true"]');
  adDivs.forEach((div) => {
    const insElement = div.querySelector('ins.adsbygoogle');
    if (insElement) {
      insElement.innerHTML = '';
      insElement.removeAttribute('data-ad-status');
    }
  });
}

/**
 * Reloads all ads by clearing the adsbygoogle array and pushing new ads
 */
export function reloadAds(): void {
  try {
    // Clear existing ads
    clearAdContent();

    // Reload ads with proper loaded property check
    setTimeout(() => {
      // Check if adsbygoogle is loaded before pushing new ads
      if (window.adsbygoogle && !(window.adsbygoogle as { loaded?: boolean }).loaded) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    }, 100);
  } catch (error) {
    console.warn('Failed to reload ads:', error);
  }
}

/**
 * Triggers ad reload after a route change
 * This is a convenience function that combines clearing and reloading
 */
export function triggerAdReload(): void {
  reloadAds();
}
