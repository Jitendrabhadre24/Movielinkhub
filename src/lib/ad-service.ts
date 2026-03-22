'use client';

/**
 * ADSTERRA POPUNDER SERVICE
 * Handles the secure injection and triggering of popunder ads.
 */

const POPUNDER_STORAGE_KEY = 'movielink_last_ad_trigger';
const AD_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 Hours

// Replace this with your actual Adsterra script source URL
const ADSTERRA_SCRIPT_SRC = '//pl25946864.highperformanceformat.com/51/93/b5/5193b5894170889985c5b29b69b8979c.js';

export function triggerAdsterraPopunder() {
  if (typeof window === 'undefined') return;

  const lastTrigger = localStorage.getItem(POPUNDER_STORAGE_KEY);
  const now = Date.now();

  // Check if ad was shown in the last 24 hours
  if (lastTrigger && now - parseInt(lastTrigger) < AD_COOLDOWN_MS) {
    return;
  }

  // Add 1.5 second delay after user interaction for high conversion
  setTimeout(() => {
    try {
      // Inject the Adsterra script dynamically
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = ADSTERRA_SCRIPT_SRC;
      script.setAttribute('data-cfasync', 'false');
      script.async = true;
      
      document.body.appendChild(script);

      // Update storage to prevent multiple popups
      localStorage.setItem(POPUNDER_STORAGE_KEY, now.toString());
      
      console.log('AD_SYSTEM: Secure pipeline established.');
    } catch (e) {
      console.error('AD_SYSTEM: Pipeline failure.', e);
    }
  }, 1500);
}
