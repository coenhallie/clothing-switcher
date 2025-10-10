/**
 * Platform Detection Utility
 * 
 * Provides synchronous platform detection for use in contexts where Vue composables
 * are not available (e.g., router guards). This is a critical fix for mobile auth
 * redirect failure where usePlatform() composable doesn't work outside component context.
 * 
 * Root cause: usePlatform() relies on Vue lifecycle hooks that never execute in router guards
 * Solution: Synchronous detection using window.__TAURI__ and user agent/viewport fallbacks
 */

/**
 * Synchronously detect the platform without relying on Vue composables
 * @returns {{ isMobile: boolean, platform: string }}
 */
export function detectPlatformSync() {
  // Check if we're in a Tauri mobile environment
  const isTauriMobile = typeof window !== 'undefined' && 
                        window.__TAURI__ && 
                        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  
  if (isTauriMobile) {
    console.log('[PlatformDetection] Detected Tauri mobile environment');
    return {
      isMobile: true,
      platform: 'tauri-mobile'
    };
  }
  
  // Fallback to viewport width detection for web browsers
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const isMobileViewport = viewportWidth < 768;
  
  console.log('[PlatformDetection] Detected via viewport:', {
    width: viewportWidth,
    isMobile: isMobileViewport,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
  });
  
  return {
    isMobile: isMobileViewport,
    platform: isMobileViewport ? 'mobile-web' : 'desktop-web'
  };
}