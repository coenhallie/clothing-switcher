import { ref, computed, onMounted, onUnmounted } from 'vue';
import { BREAKPOINTS } from '../constants/index.js';
import { createLogger } from '../utils/logger.js';

/**
 * Composable for detecting the platform (desktop vs mobile) and viewport characteristics
 * Detects both Tauri platform detection and viewport dimensions for reliable layout switching
 */
export function usePlatform() {
  const logger = createLogger('Platform');
  const viewportWidth = ref(0);
  const viewportHeight = ref(0);
  const isTauriMobile = ref(false);
  const isTauriDesktop = ref(false);

  /**
   * Check if running in Tauri environment
   */
  const checkTauriPlatform = async () => {
    try {
      // Check if Tauri API is available
      if (window.__TAURI__) {
        const { platform } = await import('@tauri-apps/plugin-os');
        const platformType = await platform();
        
        // Set platform flags based on Tauri platform detection
        isTauriMobile.value = platformType === 'android' || platformType === 'ios';
        isTauriDesktop.value = !isTauriMobile.value;
        
        logger.debug('Tauri platform detected:', platformType);
        logger.debug('Mobile:', isTauriMobile.value, 'Desktop:', isTauriDesktop.value);
      } else {
        // Not in Tauri environment - assume desktop web
        isTauriDesktop.value = true;
        logger.debug('Running in web browser (not Tauri)');
      }
    } catch (error) {
      logger.error('Error detecting Tauri platform:', error);
      // Fallback to desktop if detection fails
      isTauriDesktop.value = true;
    }
  };

  /**
   * Update viewport dimensions
   */
  const updateViewport = () => {
    viewportWidth.value = window.innerWidth;
    viewportHeight.value = window.innerHeight;
  };

  /**
   * Computed property to determine if mobile layout should be used
   * Uses both Tauri platform detection and viewport width
   */
  const isMobile = computed(() => {
    // Primary: Use Tauri platform detection if available
    if (isTauriMobile.value) {
      return true;
    }
    
    // Secondary: Fall back to viewport width for web or desktop Tauri
    return viewportWidth.value > 0 && viewportWidth.value < BREAKPOINTS.MOBILE;
  });

  /**
   * Computed property for desktop layout
   */
  const isDesktop = computed(() => !isMobile.value);

  /**
   * Computed property to check if running in any Tauri environment
   */
  const isTauri = computed(() => {
    return typeof window !== 'undefined' && !!window.__TAURI__;
  });

  /**
   * Computed property for touch capability detection
   */
  const isTouchDevice = computed(() => {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      isTauriMobile.value
    );
  });

  /**
   * Get safe area insets for mobile devices
   */
  const getSafeAreaInsets = () => {
    const style = getComputedStyle(document.documentElement);
    return {
      top: style.getPropertyValue('env(safe-area-inset-top)') || '0px',
      right: style.getPropertyValue('env(safe-area-inset-right)') || '0px',
      bottom: style.getPropertyValue('env(safe-area-inset-bottom)') || '0px',
      left: style.getPropertyValue('env(safe-area-inset-left)') || '0px',
    };
  };

  onMounted(() => {
    // Initial viewport setup
    updateViewport();
    
    // Check Tauri platform
    checkTauriPlatform();
    
    // Listen for viewport changes
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateViewport);
    window.removeEventListener('orientationchange', updateViewport);
  });

  return {
    // State
    viewportWidth,
    viewportHeight,
    isTauriMobile,
    isTauriDesktop,
    
    // Computed
    isMobile,
    isDesktop,
    isTouchDevice,
    
    // Methods
    getSafeAreaInsets,
  };
}