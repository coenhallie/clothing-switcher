/**
 * Deep Link Handler for Tauri Mobile Platforms
 * 
 * Handles custom URL scheme redirects for OAuth and magic link authentication
 * on iOS and Android via Tauri's deep link API.
 * 
 * Supported URL schemes:
 * - switchfit://auth/callback
 * - com.switchfit.studio://auth/callback
 * 
 * @see MOBILE_DEEP_LINKING_GUIDE.md
 * @see docs/supabase-auth-configuration.md
 */

/**
 * Parse deep link URL and extract authentication parameters
 * @param {string} url - Deep link URL (e.g., "switchfit://auth/callback#access_token=xxx")
 * @returns {Object} Parsed URL components and parameters
 */
function parseDeepLinkUrl(url) {
  try {
    console.log('[DeepLink] Parsing URL:', url);
    
    // Extract the path and parameters from custom scheme URL
    // Format: scheme://path#hash or scheme://path?query
    const urlMatch = url.match(/^[^:]+:\/\/([^#?]+)([#?].*)?$/);
    
    if (!urlMatch) {
      throw new Error('Invalid deep link URL format');
    }
    
    const path = `/${urlMatch[1]}`; // e.g., "/auth/callback"
    const paramsString = urlMatch[2] || ''; // e.g., "#access_token=xxx" or "?token_hash=xxx"
    
    // Parse hash parameters (OAuth typically uses fragment/hash)
    const hashParams = new URLSearchParams(
      paramsString.startsWith('#') ? paramsString.substring(1) : ''
    );
    
    // Parse query parameters (magic links may use query string)
    const queryParams = new URLSearchParams(
      paramsString.startsWith('?') ? paramsString.substring(1) : ''
    );
    
    // Combine all parameters
    const params = {};
    
    // Extract from hash (OAuth flow)
    for (const [key, value] of hashParams.entries()) {
      params[key] = value;
    }
    
    // Extract from query (magic link flow)
    for (const [key, value] of queryParams.entries()) {
      params[key] = value;
    }
    
    console.log('[DeepLink] Parsed path:', path);
    console.log('[DeepLink] Parsed params:', Object.keys(params));
    
    return { path, params };
  } catch (error) {
    console.error('[DeepLink] URL parsing error:', error);
    throw error;
  }
}

/**
 * Handle authentication callback from deep link
 * @param {Object} router - Vue Router instance
 * @param {Object} params - Parsed URL parameters
 */
async function handleAuthCallback(router, params) {
  console.log('[DeepLink] Handling auth callback');
  
  // Extract common auth parameters
  const {
    access_token,
    refresh_token,
    token_hash,
    type,
    error,
    error_description,
  } = params;
  
  // Navigate to AuthCallback view with parameters
  // The AuthCallback component will handle the actual session setup
  await router.push({
    path: '/auth/callback',
    query: {
      access_token,
      refresh_token,
      token_hash,
      type,
      error,
      error_description,
    },
  });
  
  console.log('[DeepLink] Navigated to /auth/callback');
}

/**
 * Handle email confirmation deep link
 * @param {Object} router - Vue Router instance
 * @param {Object} params - Parsed URL parameters
 */
async function handleAuthConfirm(router, params) {
  console.log('[DeepLink] Handling auth confirmation');
  
  // TODO: Implement dedicated confirmation handler
  // For now, route to callback which handles token_hash
  await handleAuthCallback(router, params);
}

/**
 * Handle password reset deep link
 * @param {Object} router - Vue Router instance
 * @param {Object} params - Parsed URL parameters
 */
async function handleAuthResetPassword(router, params) {
  console.log('[DeepLink] Handling password reset');
  
  // TODO: Implement dedicated password reset handler
  // Should navigate to a password reset form with token
  await handleAuthCallback(router, params);
}

/**
 * Route deep link to appropriate handler based on path
 * @param {Object} router - Vue Router instance
 * @param {string} path - URL path
 * @param {Object} params - Parsed URL parameters
 */
async function routeDeepLink(router, path, params) {
  console.log('[DeepLink] Routing deep link:', path);
  
  // Handle errors in URL
  if (params.error) {
    console.error('[DeepLink] Error in deep link:', params.error, params.error_description);
    // Still navigate to callback to show error to user
    await handleAuthCallback(router, params);
    return;
  }
  
  // Route based on path
  if (path === '/auth/callback') {
    await handleAuthCallback(router, params);
  } else if (path === '/auth/confirm') {
    await handleAuthConfirm(router, params);
  } else if (path === '/auth/reset-password') {
    await handleAuthResetPassword(router, params);
  } else {
    console.warn('[DeepLink] Unknown deep link path:', path);
    // Default to callback handler
    await handleAuthCallback(router, params);
  }
}

/**
 * Initialize deep link listener for Tauri mobile platforms
 * Sets up event listener for incoming deep links and routes them appropriately
 * 
 * @param {Object} router - Vue Router instance
 * @returns {Promise<Function|null>} Cleanup function to remove listener, or null if not on Tauri
 * 
 * @example
 * // In main.js after router is created
 * if (window.__TAURI__) {
 *   initializeDeepLinkListener(router);
 * }
 */
export async function initializeDeepLinkListener(router) {
  // Only initialize on Tauri platforms
  if (!window.__TAURI__) {
    console.log('[DeepLink] Not running in Tauri, skipping deep link listener');
    return null;
  }
  
  try {
    console.log('[DeepLink] Initializing deep link listener for mobile platforms');
    
    // Import Tauri deep link plugin
    // Using dynamic import to avoid errors in non-Tauri environments
    const { onOpenUrl } = await import('@tauri-apps/plugin-deep-link');
    
    // Set up deep link listener
    const unlisten = await onOpenUrl((urls) => {
      console.log('[DeepLink] Deep link received:', urls);
      
      // Handle array of URLs (typically just one)
      for (const url of urls) {
        try {
          // Parse the deep link URL
          const { path, params } = parseDeepLinkUrl(url);
          
          // Route to appropriate handler
          routeDeepLink(router, path, params).catch((error) => {
            console.error('[DeepLink] Routing error:', error);
          });
        } catch (error) {
          console.error('[DeepLink] Failed to process deep link:', url, error);
        }
      }
    });
    
    console.log('[DeepLink] Deep link listener initialized successfully');
    
    // Return cleanup function
    return unlisten;
  } catch (error) {
    console.error('[DeepLink] Failed to initialize deep link listener:', error);
    // Don't throw - gracefully degrade if deep link plugin isn't available
    return null;
  }
}

/**
 * TODO: Future enhancements per docs/supabase-auth-configuration.md
 * 
 * 1. iOS Universal Links configuration
 *    - Create .well-known/apple-app-site-association file
 *    - Configure associated domains in iOS entitlements
 *    - See MOBILE_DEEP_LINKING_GUIDE.md#ios-universal-links-setup
 * 
 * 2. Android App Links configuration
 *    - Create .well-known/assetlinks.json file
 *    - Add intent filters with autoVerify to AndroidManifest.xml
 *    - See MOBILE_DEEP_LINKING_GUIDE.md#android-app-links-setup
 * 
 * 3. Enhanced error handling
 *    - Add user-friendly error messages
 *    - Implement retry logic for failed auth attempts
 *    - Add analytics/logging for deep link events
 * 
 * 4. Security improvements
 *    - Validate redirect URLs against whitelist
 *    - Add CSRF protection for auth flows
 *    - Implement state parameter validation
 * 
 * 5. Testing infrastructure
 *    - Add unit tests for URL parsing
 *    - Create integration tests for auth flows
 *    - Add deep link testing documentation
 */

export default {
  initializeDeepLinkListener,
};