'use client';

/**
 * ADSTERRA POPUNDER SERVICE
 * Handles the secure triggering of popunder ads based on user interaction.
 */

const POPUNDER_STORAGE_KEY = 'adShown';

export function triggerAdsterraPopunder() {
  if (typeof window === 'undefined') return;

  const lastTrigger = localStorage.getItem(POPUNDER_STORAGE_KEY);
  
  // Check if ad was shown in the current session/24h context
  if (lastTrigger === "true") {
    return;
  }

  try {
    // Adsterra trigger check
    // @ts-ignore
    if (typeof window.popunder === "function") {
      // @ts-ignore
      window.popunder();
      localStorage.setItem(POPUNDER_STORAGE_KEY, "true");
      console.log('AD_SYSTEM: Secure pipeline established.');
    } else {
      // Fallback: If popunder function is not exposed, the script usually
      // works on the next click event automatically. We track intended trigger.
      localStorage.setItem(POPUNDER_STORAGE_KEY, "true");
    }
  } catch (e) {
    console.error('AD_SYSTEM: Pipeline failure.', e);
  }
}
