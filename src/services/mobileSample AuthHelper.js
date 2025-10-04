/**
 * Mobile Authentication Helper for Tauri
 * 
 * This file contains helper functions for handling authentication
 * in Tauri mobile apps with Supabase OAuth deep linking.
 * 
 * INTEGRATION INSTRUCTIONS:
 * 1. Copy the functions you need into your existing authService.js
 * 2. Update your OAuth sign-in methods to use getRedirectUrl()
 * 3. Add deep link listener to your main.js (see below)
 */

import { supabase } from './supabaseClient';

/**
 * Detect if running in Tauri mobile environment
 */
export const isTauriMobile = () => {
  if (typeof window === 'undefined' || !window.__TAURI__) {
    return false;
  }
  
  try {
    const platform = window.__TAURI_INTERNALS__?.plugins?.os?.platform;
    return platform === 'ios' || platform === 'android';
  } catch {
    return false;
  }
};

/**
 * Get the appropriate redirect URL based on environment
 */
export const getRedirectUrl = () => {
  if (isTauriMobile()) {
    // Use custom URL scheme for mobile
    return 'switchfit://auth/callback';
  }
  // Use web URL for browser/desktop
  return `${window.location.origin}/auth/callback`;
};

/**
 * Sign in with OAuth provider (mobile-compatible)
 * 
 * Example usage:
 * const result = await signInWithProvider('google');
 * if (result.error) {
 *   console.error('Auth error:', result.error);
 * }
 */
export const signInWithProvider = async (provider) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: getRedirectUrl(),
        skipBrowserRedirect: isTauriMobile(),
      },
    });

    if (error) throw error;

    // For mobile, open auth URL in system browser
    if (isTauriMobile() && data?.url) {
      const { open } = await import('@tauri-apps/plugin-shell');
      await open(data.url);
    }

    return { data, error: null };
  } catch (error) {
    console.error('OAuth error:', error);
    return { data: null, error };
  }
};

/**
 * Handle deep link callback (call this when deep link is received)
 * 
 * @param {string} url - The deep link URL received
 * @returns {Promise<{success: boolean, error?: Error}>}
 */
export const handleDeepLinkAuth = async (url) => {
  try {
    console.log('Processing deep link:', url);
    
    // Parse URL fragments (Supabase returns tokens in URL fragment)
    const urlObj = new URL(url);
    const hashParams = new URLSearchParams(urlObj.hash.substring(1));
    
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const type = hashParams.get('type');
    
    if (!accessToken) {
      throw new Error('No access token in deep link');
    }

    // Set the session in Supabase
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) throw error;

    console.log('Session set successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Deep link auth error:', error);
    return { success: false, error };
  }
};

/**
 * Setup deep link listener (add this to your main.js)
 * 
 * Example for main.js:
 * 
 * import { setupDeepLinkListener } from './services/mobileAuthHelper';
 * 
 * if (window.__TAURI__) {
 *   setupDeepLinkListener();
 * }
 */
export const setupDeepLinkListener = async () => {
  try {
    const { appWindow } = await import('@tauri-apps/api/window');
    
    await appWindow.listen('deep-link', async (event) => {
      const url = event.payload;
      console.log('Deep link received:', url);
      
      // Check if it's an auth callback
      if (url.includes('auth/callback')) {
        const result = await handleDeepLinkAuth(url);
        
        if (result.success) {
          console.log('✅ Authentication successful via deep link');
          
          // Emit a custom event that your app can listen to
          window.dispatchEvent(new CustomEvent('auth-success', {
            detail: result.data
          }));
          
          // Optionally navigate to a specific route
          // router.push('/dashboard');
        } else {
          console.error('❌ Authentication failed:', result.error);
          
          window.dispatchEvent(new CustomEvent('auth-error', {
            detail: result.error
          }));
        }
      }
    });
    
    console.log('✅ Deep link listener setup complete');
  } catch (error) {
    console.error('Failed to setup deep link listener:', error);
  }
};

/**
 * Check current platform
 */
export const getCurrentPlatform = () => {
  if (!window.__TAURI__) return 'web';
  
  try {
    const platform = window.__TAURI_INTERNALS__?.plugins?.os?.platform;
    return platform || 'desktop';
  } catch {
    return 'desktop';
  }
};

/**
 * Example integration in your App.vue or main component:
 * 
 * <script setup>
 * import { onMounted } from 'vue';
 * import { setupDeepLinkListener } from './services/mobileAuthHelper';
 * 
 * onMounted(() => {
 *   if (window.__TAURI__) {
 *     setupDeepLinkListener();
 *     
 *     // Listen for auth success
 *     window.addEventListener('auth-success', (event) => {
 *       console.log('User authenticated:', event.detail);
 *       // Update your UI, redirect, etc.
 *     });
 *     
 *     // Listen for auth errors
 *     window.addEventListener('auth-error', (event) => {
 *       console.error('Auth error:', event.detail);
 *       // Show error message to user
 *     });
 *   }
 * });
 * </script>
 */