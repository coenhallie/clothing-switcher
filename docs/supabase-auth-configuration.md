# Supabase Auth Configuration & Implementation Guide

## Executive Summary

This document details the complete Supabase Auth configuration required to support SwitchFit's mobile-first authentication experience while maintaining desktop compatibility. It covers dashboard settings, SDK configuration, session management strategies, and implementation patterns for email/password, magic link, and social authentication across web, Tauri desktop, and Tauri mobile platforms.

---

## Table of Contents

1. [Current State Audit](#1-current-state-audit)
2. [Supabase Dashboard Configuration](#2-supabase-dashboard-configuration)
3. [Environment Variables](#3-environment-variables)
4. [SDK Configuration Updates](#4-sdk-configuration-updates)
5. [Platform-Specific Session Handling](#5-platform-specific-session-handling)
6. [Authentication Methods Implementation](#6-authentication-methods-implementation)
7. [Router Integration](#7-router-integration)
8. [Security & Recovery Flows](#8-security--recovery-flows)
9. [Deep Link Handling](#9-deep-link-handling)
10. [Implementation Checklist](#10-implementation-checklist)

---

## 1. Current State Audit

### 1.1 Existing Implementation

**Files Reviewed:**
- [`src/services/supabaseClient.js`](src/services/supabaseClient.js) - Supabase client initialization
- [`src/services/authService.js`](src/services/authService.js) - Authentication service layer
- [`src/stores/authStore.js`](src/stores/authStore.js) - Pinia auth state management
- [`src/router/index.js`](src/router/index.js) - Vue Router configuration
- [`src/services/mobileSample AuthHelper.js`](src/services/mobileSample%20AuthHelper.js) - Sample mobile auth helpers (not integrated)

### 1.2 Current Capabilities

✅ **Implemented:**
- Email/password sign-up and sign-in
- Session persistence via `localStorage`
- Auto token refresh enabled
- Session detection in URL
- Auth state change listeners
- User profile metadata storage
- Credits initialization on signup
- Password reset request
- Password update functionality

❌ **Missing:**
- Magic link authentication
- Social provider authentication (Google, Apple, GitHub)
- Mobile deep link handling
- Secure storage for mobile platforms
- Auth callback route
- Email confirmation flow
- Password recovery UI integration
- Platform-aware redirect URLs
- Session migration between platforms

### 1.3 Current Configuration

```javascript
// src/services/supabaseClient.js (current)
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,  // ⚠️ Only localStorage
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
    },
  },
});
```

**Issues:**
- Hardcoded to `localStorage` (not suitable for mobile secure storage)
- No platform detection for storage strategy
- No custom redirect URL handling
- Missing OAuth configuration

---

## 2. Supabase Dashboard Configuration

### 2.1 Authentication Settings

**Navigation:** Supabase Dashboard → Authentication → Settings

#### Site URL
```
Production: https://switchfit.app
Development: http://localhost:5173
```

#### Redirect URLs (Add all of these)

```
# Web/Desktop URLs
https://switchfit.app/auth/callback
https://switchfit.app/auth/confirm
https://switchfit.app/auth/reset-password
http://localhost:5173/auth/callback
http://localhost:5173/auth/confirm
http://localhost:5173/auth/reset-password

# Tauri Mobile Custom Scheme URLs
switchfit://auth/callback
switchfit://auth/confirm
switchfit://auth/reset-password
com.switchfit.studio://auth/callback
com.switchfit.studio://auth/confirm
com.switchfit.studio://auth/reset-password
```

**Important:** All URLs must be whitelisted in Supabase for security. Deep links will only work if registered here.

### 2.2 Email Templates

**Navigation:** Supabase Dashboard → Authentication → Email Templates

#### Confirm Signup Template

**Subject:** `Confirm your SwitchFit account`

**Body:**
```html
<h2>Welcome to SwitchFit!</h2>
<p>Click the link below to confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
<p>Or copy this link: {{ .ConfirmationURL }}</p>
```

**Confirmation URL:** `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`

#### Magic Link Template

**Subject:** `Your SwitchFit magic link`

**Body:**
```html
<h2>Sign in to SwitchFit</h2>
<p>Click the link below to sign in instantly:</p>
<p><a href="{{ .ConfirmationURL }}">Sign In</a></p>
<p>This link expires in 1 hour.</p>
<p>Or copy this link: {{ .ConfirmationURL }}</p>
```

**Magic Link URL:** `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=magiclink`

#### Reset Password Template

**Subject:** `Reset your SwitchFit password`

**Body:**
```html
<h2>Password Reset Request</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>This link expires in 1 hour.</p>
<p>If you didn't request this, you can safely ignore this email.</p>
```

**Reset URL:** `{{ .SiteURL }}/auth/reset-password?token_hash={{ .TokenHash }}&type=recovery`

### 2.3 Auth Providers Configuration

#### Email Provider
**Navigation:** Authentication → Providers → Email

```yaml
Enable Email provider: true
Confirm email: true (recommended for production)
Secure email change: true
Enable email OTP: false (use magic links instead)
```

#### Magic Link (Email-based)
Enable in the Email provider settings:
```yaml
Enable Magic Link: true
Magic Link expiry: 3600 seconds (1 hour)
```

#### Google OAuth
**Navigation:** Authentication → Providers → Google

1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/)
2. Add authorized redirect URIs:
   - `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
3. Configure in Supabase:

```yaml
Enable Google provider: true
Client ID: [FROM GOOGLE CONSOLE]
Client Secret: [FROM GOOGLE CONSOLE]
Redirect URL: https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
Skip nonce check: false
```

**Additional Scopes:**
```
email
profile
openid
```

#### Apple OAuth
**Navigation:** Authentication → Providers → Apple

1. Create an App ID and Service ID in [Apple Developer Portal](https://developer.apple.com/)
2. Configure Sign In with Apple
3. Add in Supabase:

```yaml
Enable Apple provider: true
Client ID (Services ID): com.switchfit.studio.signin
Team ID: [YOUR-APPLE-TEAM-ID]
Key ID: [YOUR-KEY-ID]
Private Key: [DOWNLOAD FROM APPLE]
```

**Return URLs for Apple:**
- `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`

### 2.4 Security Settings

**Navigation:** Authentication → Settings

```yaml
# JWT Settings
JWT expiry limit: 3600 (1 hour)
Refresh token expiry: 604800 (7 days)

# Rate Limiting
Rate limit for email signups: 10 per hour
Rate limit for token refresh: 30 per hour

# Security
Disable signup: false
Enable anonymous sign-ins: false
Enable custom SMTP: false (use Supabase SMTP for now)

# Session Management
Minimum password length: 8
Enforce password strength: true
Allow disposable email addresses: false
```

### 2.5 Row Level Security (RLS) Policies

Ensure these policies exist for auth-protected tables:

```sql
-- Credits table
CREATE POLICY "Users can view own credits"
  ON credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits"
  ON credits FOR UPDATE
  USING (auth.uid() = user_id);

-- Gallery images
CREATE POLICY "Users can view own gallery"
  ON gallery_images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gallery"
  ON gallery_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Credit transactions
CREATE POLICY "Users can view own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 3. Environment Variables

### 3.1 Required Variables

Update [`.env.example`](.env.example) and create local `.env`:

```bash
# Supabase Core
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Site URLs (for email templates)
VITE_SITE_URL_PRODUCTION=https://switchfit.app
VITE_SITE_URL_DEVELOPMENT=http://localhost:5173

# OAuth Provider IDs (optional, for better UX)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_APPLE_CLIENT_ID=com.switchfit.studio.signin

# Deep Link Schemes
VITE_MOBILE_SCHEME=switchfit
VITE_MOBILE_PACKAGE=com.switchfit.studio

# Feature Flags
VITE_ENABLE_MAGIC_LINK=true
VITE_ENABLE_SOCIAL_AUTH=true
VITE_ENABLE_EMAIL_CONFIRMATION=true
```

### 3.2 Platform Detection Variables

These are runtime-detected, not environment variables:

```javascript
// Runtime platform detection
const platform = {
  isWeb: !window.__TAURI__,
  isDesktop: window.__TAURI__ && !isMobile(),
  isMobile: window.__TAURI__ && isMobile(),
  isTauriIOS: window.__TAURI_INTERNALS__?.plugins?.os?.platform === 'ios',
  isTauriAndroid: window.__TAURI_INTERNALS__?.plugins?.os?.platform === 'android',
};
```

---

## 4. SDK Configuration Updates

### 4.1 Platform-Aware Supabase Client

Update [`src/services/supabaseClient.js`](src/services/supabaseClient.js):

```javascript
import { createClient } from '@supabase/supabase-js';

// Platform detection
const isTauri = () => typeof window !== 'undefined' && window.__TAURI__;
const isTauriMobile = () => {
  if (!isTauri()) return false;
  try {
    const platform = window.__TAURI_INTERNALS__?.plugins?.os?.platform;
    return platform === 'ios' || platform === 'android';
  } catch {
    return false;
  }
};

// Get platform-appropriate storage
const getStorage = () => {
  if (isTauriMobile()) {
    // For Tauri mobile, we'll need to implement secure storage
    // For now, use localStorage with a TODO to migrate
    console.warn('⚠️ Using localStorage on mobile - TODO: implement secure storage');
    return window.localStorage;
  }
  // Web and desktop use localStorage
  return window.localStorage;
};

// Get environment-appropriate site URL
const getSiteUrl = () => {
  const isDev = import.meta.env.DEV;
  if (isDev) {
    return import.meta.env.VITE_SITE_URL_DEVELOPMENT || 'http://localhost:5173';
  }
  return import.meta.env.VITE_SITE_URL_PRODUCTION || window.location.origin;
};

// Get platform-appropriate redirect URL
const getRedirectUrl = (path = '/auth/callback') => {
  if (isTauriMobile()) {
    const scheme = import.meta.env.VITE_MOBILE_SCHEME || 'switchfit';
    return `${scheme}:/${path}`;
  }
  return `${getSiteUrl()}${path}`;
};

// Enhanced Supabase client configuration
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      // Auto-refresh tokens before expiry
      autoRefreshToken: true,
      
      // Persist session across page reloads
      persistSession: true,
      
      // Detect sessions from URL (for OAuth callbacks)
      detectSessionInUrl: true,
      
      // Platform-appropriate storage
      storage: getStorage(),
      
      // Flow type for email confirmations
      flowType: 'pkce', // More secure than implicit
      
      // Debug mode (development only)
      debug: import.meta.env.DEV,
    },
    
    global: {
      headers: {
        'X-Client-Info': isTauriMobile() 
          ? 'supabase-js-mobile' 
          : isTauri() 
            ? 'supabase-js-desktop' 
            : 'supabase-js-web',
      },
    },
  }
);

// Export helper functions
export { getRedirectUrl, getSiteUrl, isTauriMobile, isTauri };
```

### 4.2 Storage Abstraction (Future Enhancement)

For production mobile apps, implement secure storage:

```javascript
// src/services/secureStorage.js (FUTURE IMPLEMENTATION)
import { isTauriMobile } from './supabaseClient';

class SecureStorage {
  async getItem(key) {
    if (isTauriMobile()) {
      // Use Tauri's secure storage plugin
      const { Store } = await import('@tauri-apps/plugin-store');
      const store = new Store('.secure-storage.dat');
      return await store.get(key);
    }
    return localStorage.getItem(key);
  }

  async setItem(key, value) {
    if (isTauriMobile()) {
      const { Store } = await import('@tauri-apps/plugin-store');
      const store = new Store('.secure-storage.dat');
      await store.set(key, value);
      await store.save();
    } else {
      localStorage.setItem(key, value);
    }
  }

  async removeItem(key) {
    if (isTauriMobile()) {
      const { Store } = await import('@tauri-apps/plugin-store');
      const store = new Store('.secure-storage.dat');
      await store.delete(key);
      await store.save();
    } else {
      localStorage.removeItem(key);
    }
  }
}

export const secureStorage = new SecureStorage();
```

---

## 5. Platform-Specific Session Handling

### 5.1 Session Persistence Strategies

| Platform | Storage | Security Level | Notes |
|----------|---------|----------------|-------|
| **Web (Browser)** | localStorage | Medium | Standard web storage, cleared on cache clear |
| **Desktop (Tauri)** | localStorage | Medium-High | More isolated than web, persistent |
| **Mobile (Tauri iOS)** | Keychain (via plugin) | High | Encrypted, OS-managed |
| **Mobile (Tauri Android)** | EncryptedSharedPreferences | High | Hardware-backed encryption |

### 5.2 Session Lifecycle Management

```javascript
// src/services/sessionManager.js
import { supabase, isTauriMobile } from './supabaseClient';

export class SessionManager {
  // Check if session is valid and not expired
  async isSessionValid() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) return false;
    
    // Check expiration (session.expires_at is Unix timestamp)
    const now = Math.floor(Date.now() / 1000);
    return session.expires_at > now;
  }

  // Refresh session before expiry
  async ensureFreshSession() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return null;
    
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = session.expires_at - now;
    
    // Refresh if less than 5 minutes remaining
    if (timeUntilExpiry < 300) {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Session refresh failed:', error);
        return null;
      }
      return data.session;
    }
    
    return session;
  }

  // Clear all session data (for sign-out)
  async clearSession() {
    await supabase.auth.signOut();
    
    // Clear any cached data
    if (isTauriMobile()) {
      // TODO: Clear secure storage when implemented
      localStorage.clear();
    } else {
      // Clear only auth-related items in web/desktop
      Object.keys(localStorage)
        .filter(key => key.includes('supabase') || key.startsWith('sb-'))
        .forEach(key => localStorage.removeItem(key));
    }
  }

  // Handle session from deep link (mobile)
  async setSessionFromDeepLink(accessToken, refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    
    if (error) {
      console.error('Failed to set session from deep link:', error);
      return { success: false, error };
    }
    
    return { success: true, session: data.session };
  }
}

export const sessionManager = new SessionManager();
```

### 5.3 Token Refresh Error Handling

```javascript
// src/services/authService.js - Add to existing service
class AuthService {
  // ... existing methods ...

  /**
   * Handle token refresh errors gracefully
   */
  setupTokenRefreshHandler() {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('✅ Token refreshed successfully');
      }
      
      if (event === 'SIGNED_OUT') {
        // User was signed out (possibly due to token expiry)
        console.log('🔓 User signed out');
        this.currentUser = null;
        this.currentProfile = null;
      }
    });
  }

  /**
   * Retry failed requests after token refresh
   */
  async withRetry(operation, maxRetries = 1) {
    try {
      return await operation();
    } catch (error) {
      // If auth error, try refreshing and retry once
      if (error.message?.includes('JWT') || 
          error.message?.includes('expired') ||
          error.status === 401) {
        
        if (maxRetries > 0) {
          console.log('Refreshing token and retrying...');
          const { error: refreshError } = await supabase.auth.refreshSession();
          
          if (!refreshError) {
            return await this.withRetry(operation, maxRetries - 1);
          }
        }
      }
      throw error;
    }
  }
}
```

---

## 6. Authentication Methods Implementation

### 6.1 Email/Password Authentication

Update [`src/services/authService.js`](src/services/authService.js):

```javascript
/**
 * Enhanced sign-up with email confirmation
 */
async signUp(email, password, fullName = '') {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: getRedirectUrl('/auth/confirm'),
      },
    });

    if (error) throw error;

    // Check if email confirmation is required
    const requiresConfirmation = !data.session;

    return {
      success: true,
      user: data.user,
      requiresConfirmation,
      message: requiresConfirmation 
        ? 'Please check your email to confirm your account'
        : 'Account created successfully',
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Sign in with email/password - already implemented
 */
async signIn(email, password) {
  // ... existing implementation is good ...
}
```

### 6.2 Magic Link Authentication

Add to [`src/services/authService.js`](src/services/authService.js):

```javascript
import { supabase, getRedirectUrl } from './supabaseClient';

/**
 * Send magic link to user's email
 */
async sendMagicLink(email) {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getRedirectUrl('/auth/callback'),
        shouldCreateUser: true, // Create account if doesn't exist
      },
    });

    if (error) throw error;

    return {
      success: true,
      message: 'Magic link sent! Check your email.',
    };
  } catch (error) {
    console.error('Magic link error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Verify magic link OTP (if using OTP flow instead of magic link)
 */
async verifyOtp(email, token) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) throw error;

    this.currentUser = data.user;
    await this.initializeUserCredits();

    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    console.error('OTP verification error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
```

### 6.3 Social Authentication (OAuth)

Add to [`src/services/authService.js`](src/services/authService.js):

```javascript
import { isTauriMobile, getRedirectUrl } from './supabaseClient';

/**
 * Sign in with OAuth provider (Google, Apple, GitHub, etc.)
 */
async signInWithProvider(provider, options = {}) {
  try {
    const redirectTo = getRedirectUrl('/auth/callback');
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider, // 'google', 'apple', 'github', etc.
      options: {
        redirectTo,
        skipBrowserRedirect: isTauriMobile(), // For mobile deep links
        ...options,
      },
    });

    if (error) throw error;

    // For mobile, open the auth URL in system browser
    if (isTauriMobile() && data?.url) {
      const { open } = await import('@tauri-apps/plugin-shell');
      await open(data.url);
      
      return {
        success: true,
        message: 'Opening authentication in browser...',
        requiresDeepLink: true,
      };
    }

    // For web/desktop, browser will redirect automatically
    return {
      success: true,
      message: 'Redirecting to authentication...',
    };
  } catch (error) {
    console.error('OAuth sign-in error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Sign in with Google
 */
async signInWithGoogle() {
  return this.signInWithProvider('google', {
    scopes: 'email profile',
  });
}

/**
 * Sign in with Apple
 */
async signInWithApple() {
  return this.signInWithProvider('apple', {
    scopes: 'email name',
  });
}
```

### 6.4 Client-Side Validation

Create [`src/utils/authValidation.js`](src/utils/authValidation.js):

```javascript
/**
 * Email validation
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  
  return { valid: true };
};

/**
 * Password validation
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  
  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return { 
      valid: false, 
      error: 'Password must contain both letters and numbers' 
    };
  }
  
  return { valid: true };
};

/**
 * Password strength indicator
 */
export const getPasswordStrength = (password) => {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  const levels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  return {
    score: strength,
    level: levels[Math.min(strength, 4)],
    percentage: (strength / 5) * 100,
  };
};

/**
 * Full name validation
 */
export const validateFullName = (name) => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Name is required' };
  }
  
  if (name.trim().length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  
  return { valid: true };
};
```

---

## 7. Router Integration

### 7.1 Add Auth Routes

Update [`src/router/index.js`](src/router/index.js):

```javascript
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import SettingsView from '../views/SettingsView.vue';
import GalleryView from '../views/GalleryView.vue';
import { useAuthStore } from '../stores/authStore.js';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/gallery',
    name: 'Gallery',
    component: GalleryView,
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
  },
  
  // Auth callback routes
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('../views/auth/AuthCallback.vue'),
    meta: { public: true },
  },
  {
    path: '/auth/confirm',
    name: 'AuthConfirm',
    component: () => import('../views/auth/AuthConfirm.vue'),
    meta: { public: true },
  },
  {
    path: '/auth/reset-password',
    name: 'ResetPassword',
    component: () => import('../views/auth/ResetPassword.vue'),
    meta: { public: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Enhanced navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Allow public routes
  if (to.meta.public) {
    next();
    return;
  }

  // Check authentication for protected routes
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Store intended destination
    sessionStorage.setItem('redirectAfterAuth', to.fullPath);
    
    // Redirect to home page (will show auth modal)
    next({ 
      path: '/', 
      query: { auth: 'required' } 
    });
  } else {
    next();
  }
});

export default router;
```

### 7.2 Auth Callback View

Create `src/views/auth/AuthCallback.vue`:

```vue
<template>
  <div class="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-4">
    <div class="text-center">
      <div v-if="loading" class="space-y-4">
        <div class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-brand-500)]"></div>
        <p class="text-[var(--color-muted-foreground)]">Completing authentication...</p>
      </div>
      
      <div v-else-if="error" class="space-y-4">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-destructive-500)]/10">
          <svg class="h-6 w-6 text-[var(--color-destructive-500)]" fill="none" viewBox="0 0 24 24">
            <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-[var(--color-card-foreground)]">Authentication Failed</h2>
        <p class="text-[var(--color-muted-foreground)]">{{ error }}</p>
        <button 
          @click="$router.push('/')"
          class="rounded-full bg-[var(--color-brand-500)] px-6 py-2 text-white"
        >
          Return Home
        </button>
      </div>
      
      <div v-else class="space-y-4">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand-500)]/10">
          <svg class="h-6 w-6 text-[var(--color-brand-500)]" fill="none" viewBox="0 0 24 24">
            <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-[var(--color-card-foreground)]">Success!</h2>
        <p class="text-[var(--color-muted-foreground)]">Redirecting...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../services/supabaseClient';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    // Handle OAuth callback or magic link
    const { data, error: authError } = await supabase.auth.getSession();
    
    if (authError) throw authError;
    
    if (data.session) {
      // Session established successfully
      authStore.setUser(data.session.user);
      await authStore.loadCurrentUser();
      
      // Redirect to intended destination or home
      const redirectTo = sessionStorage.getItem('redirectAfterAuth') || '/';
      sessionStorage.removeItem('redirectAfterAuth');
      
      setTimeout(() => {
        router.push(redirectTo);
      }, 1000);
    } else {
      throw new Error('No session found in callback');
    }
  } catch (err) {
    console.error('Auth callback error:', err);
    error.value = err.message || 'Authentication failed. Please try again.';
    loading.value = false;
  }
});
</script>
```

### 7.3 Email Confirmation View

Create `src/views/auth/AuthConfirm.vue`:

```vue
<template>
  <div class="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-4">
    <div class="w-full max-w-md space-y-6 text-center">
      <div v-if="loading">
        <div class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-brand-500)]"></div>
        <p class="mt-4 text-[var(--color-muted-foreground)]">Confirming your email...</p>
      </div>
      
      <div v-else-if="confirmed" class="space-y-4">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand-500)]/10">
          <svg class="h-8 w-8 text-[var(--color-brand-500)]" fill="none" viewBox="0 0 24 24">
            <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2.5"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-[var(--color-card-foreground)]">Email Confirmed!</h1>
        <p class="text-[var(--color-muted-foreground)]">
          Your account is now active. You can start using SwitchFit.
        </p>
        <button 
          @click="$router.push('/')"
          class="rounded-full bg-[var(--color-brand-500)] px-8 py-3 text-white font-semibold"
        >
          Get Started
        </button>
      </div>
      
      <div v-else-if="error" class="space-y-4">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-destructive-500)]/10">
          <svg class="h-8 w-8 text-[var(--color-destructive-500)]" fill="none" viewBox="0 0 24 24">
            <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2.5"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-[var(--color-card-foreground)]">Confirmation Failed</h1>
        <p class="text-[var(--color-muted-foreground)]">{{ error }}</p>
        <button 
          @click="$router.push('/')"
          class="rounded-full bg-[var(--color-brand-500)] px-8 py-3 text-white font-semibold"
        >
          Return Home
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '../../services/supabaseClient';

const route = useRoute();
const loading = ref(true);
const confirmed = ref(false);
const error = ref(null);

onMounted(async () => {
  try {
    const tokenHash = route.query.token_hash;
    const type = route.query.type;
    
    if (!tokenHash || type !== 'email') {
      throw new Error('Invalid confirmation link');
    }
    
    // Verify the email
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'email',
    });
    
    if (verifyError) throw verifyError;
    
    confirmed.value = true;
  } catch (err) {
    console.error('Email confirmation error:', err);
    error.value = err.message || 'Unable to confirm email. The link may have expired.';
  } finally {
    loading.value = false;
  }
});
</script>
```

### 7.4 Password Reset View

Create `src/views/auth/ResetPassword.vue`:

```vue
<template>
  <div class="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-4">
    <div class="w-full max-w-md space-y-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-[var(--color-card-foreground)]">Reset Your Password</h1>
        <p class="mt-2 text-[var(--color-muted-foreground)]">Enter your new password below</p>
      </div>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-[var(--color-card-foreground)] mb-2">
            New Password
          </label>
          <input
            v-model="password"
            type="password"
            required
            minlength="8"
            class="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-card-foreground)] focus:border-[var(--color-brand-500)] focus:outline-none"
            placeholder="Enter new password"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-[var(--color-card-foreground)] mb-2">
            Confirm Password
          </label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            minlength="8"
            class="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-card-foreground)] focus:border-[var(--color-brand-500)] focus:outline-none"
            placeholder="Confirm new password"
          />
        </div>
        
        <p v-if="error" class="text-sm text-[var(--color-destructive-500)]">{{ error }}</p>
        
        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-full bg-[var(--color-brand-500)] px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {{ loading ? 'Updating...' : 'Update Password' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref(null);

const handleSubmit = async () => {
  error.value = null;
  
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }
  
  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters';
    return;
  }
  
  loading.value = true;
  
  try {
    const result = await authStore.updatePassword(password.value);
    
    if (result.success) {
      router.push('/');
    } else {
      error.value = result.error;
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>
```

---

## 8. Security & Recovery Flows

### 8.1 Password Reset Flow

**User Journey:**
1. User clicks "Forgot Password" → Opens modal/screen
2. Enters email → Calls `authService.resetPassword(email)`
3. Receives email with reset link → Link format: `{SITE_URL}/auth/reset-password?token_hash={TOKEN}&type=recovery`
4. Clicks link → Opens ResetPassword view
5. Enters new password → Calls `authStore.updatePassword(newPassword)`
6. Redirects to home/dashboard

**Implementation in Auth Components:**

```javascript
// In LoginForm.vue or AuthModal.vue
const handleForgotPassword = async () => {
  if (!email.value) {
    error.value = 'Please enter your email address';
    return;
  }
  
  loading.value = true;
  const result = await authService.resetPassword(email.value);
  
  if (result.success) {
    showToast({
      type: 'success',
      title: 'Check your email',
      message: 'We sent you a password reset link',
    });
  } else {
    error.value = result.error;
  }
  
  loading.value = false;
};
```

### 8.2 Email Confirmation Flow

**User Journey:**
1. User signs up → Receives confirmation email
2. Clicks confirmation link → Link format: `{SITE_URL}/auth/confirm?token_hash={TOKEN}&type=email`
3. AuthConfirm view verifies token
4. User redirected to app with active session

**Handling Unconfirmed Users:**

```javascript
// src/services/authService.js
async signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Check if error is due to unconfirmed email
      if (error.message.includes('Email not confirmed')) {
        return {
          success: false,
          error: 'Please confirm your email address before signing in',
          needsConfirmation: true,
        };
      }
      throw error;
    }

    this.currentUser = data.user;
    await this.initializeUserCredits();

    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Resend confirmation email
 */
async resendConfirmationEmail(email) {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: getRedirectUrl('/auth/confirm'),
      },
    });
    
    if (error) throw error;
    
    return {
      success: true,
      message: 'Confirmation email resent',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
```

### 8.3 Session Revocation (Sign Out)

**Enhanced Sign-Out:**

```javascript
// src/services/authService.js
async signOut(options = {}) {
  const { scope = 'local' } = options;
  
  try {
    // 'local' = only this device
    // 'global' = all devices (revoke all sessions)
    const { error } = await supabase.auth.signOut({ scope });
    
    if (error) throw error;

    this.currentUser = null;
    this.currentProfile = null;

    // Clear local caches
    if (scope === 'global') {
      // Clear all storage
      localStorage.clear();
    }

    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
```

### 8.4 Cross-Device Session Sync

Supabase handles session sync automatically through:
- JWT tokens stored in auth storage
- Automatic token refresh
- Session validity checks

**Considerations:**
- Sessions are device-specific (each device has its own refresh token)
- Signing out on one device doesn't affect others (unless using `scope: 'global'`)
- Token refresh happens automatically before expiry
- Manual refresh can be triggered if needed

---

## 9. Deep Link Handling

### 9.1 Deep Link Configuration

**Tauri Configuration** - Update [`src-tauri/tauri.conf.json`](src-tauri/tauri.conf.json):

```json
{
  "productName": "SwitchFit Studio",
  "identifier": "com.switchfit.studio",
  "app": {
    "security": {
      "csp": null
    },
    "deepLinkProtocols": [
      {
        "protocol": "switchfit",
        "schemes": ["switchfit"]
      }
    ]
  }
}
```

### 9.2 Deep Link Listener

Create `src/services/deepLinkHandler.js`:

```javascript
import { supabase } from './supabaseClient';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';

/**
 * Setup deep link listener for mobile auth callbacks
 */
export async function setupDeepLinkListener() {
  if (!window.__TAURI__) {
    console.log('Not a Tauri app, skipping deep link setup');
    return;
  }

  try {
    const { getCurrent } = await import('@tauri-apps/api/window');
    const appWindow = getCurrent();
    
    // Listen for deep link events
    await appWindow.listen('deep-link', async (event) => {
      const url = event.payload;
      console.log('🔗 Deep link received:', url);
      
      try {
        await handleDeepLink(url);
      } catch (error) {
        console.error('Error handling deep link:', error);
      }
    });
    
    console.log('✅ Deep link listener setup complete');
  } catch (error) {
    console.error('Failed to setup deep link listener:', error);
  }
}

/**
 * Handle incoming deep link URL
 */
async function handleDeepLink(url) {
  const authStore = useAuthStore();
  
  // Parse the URL
  const urlObj = new URL(url);
  const path = urlObj.pathname;
  
  // Auth callback handling
  if (path.includes('/auth/callback') || path.includes('/auth/confirm')) {
    await handleAuthCallback(url, authStore);
  }
  
  // Password reset handling
  if (path.includes('/auth/reset-password')) {
    await handlePasswordReset(url);
  }
}

/**
 * Handle auth callback from deep link
 */
async function handleAuthCallback(url, authStore) {
  try {
    // Parse URL fragments (OAuth tokens are in hash)
    const urlObj = new URL(url);
    
    // Try hash params first (OAuth)
    let params = new URLSearchParams(urlObj.hash.substring(1));
    
    // Fallback to query params (magic link)
    if (!params.has('access_token')) {
      params = new URLSearchParams(urlObj.search);
    }
    
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const tokenHash = params.get('token_hash');
    const type = params.get('type');
    
    if (accessToken && refreshToken) {
      // OAuth callback with tokens
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      
      if (error) throw error;
      
      authStore.setUser(data.session.user);
      await authStore.loadCurrentUser();
      
      console.log('✅ Authentication successful via deep link');
      
      // Navigate to home or intended destination
      const router = useRouter();
      const redirectTo = sessionStorage.getItem('redirectAfterAuth') || '/';
      sessionStorage.removeItem('redirectAfterAuth');
      router.push(redirectTo);
      
    } else if (tokenHash && type) {
      // Magic link or email confirmation with token hash
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });
      
      if (error) throw error;
      
      console.log('✅ Email verified via deep link');
      
      // Session should be automatically established
      await authStore.loadCurrentUser();
    }
  } catch (error) {
    console.error('Deep link auth error:', error);
    
    // Show error to user
    window.dispatchEvent(new CustomEvent('auth-error', {
      detail: { message: error.message }
    }));
  }
}

/**
 * Handle password reset deep link
 */
async function handlePasswordReset(url) {
  const router = useRouter();
  
  // Navigate to reset password view
  // The view will extract token from URL
  router.push(url.replace('switchfit:/', ''));
}
```

### 9.3 Initialize Deep Links in App

Update [`src/App.vue`](src/App.vue) or `src/main.js`:

```javascript
import { setupDeepLinkListener } from './services/deepLinkHandler';

onMounted(async () => {
  // ... existing initialization code ...
  
  // Setup deep link handling for Tauri mobile
  if (window.__TAURI__) {
    await setupDeepLinkListener();
    console.log('📱 Mobile deep link handling enabled');
  }
  
  // ... rest of initialization ...
});
```

### 9.4 iOS Universal Links Configuration

Create `.well-known/apple-app-site-association` in your web server root:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "[TEAM_ID].com.switchfit.studio",
        "paths": [
          "/auth/*",
          "/auth/callback",
          "/auth/confirm",
          "/auth/reset-password"
        ]
      }
    ]
  }
}
```

### 9.5 Android App Links Configuration

Create `.well-known/assetlinks.json` in your web server root:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.switchfit.studio",
      "sha256_cert_fingerprints": [
        "[YOUR_SHA256_CERT_FINGERPRINT]"
      ]
    }
  }
]
```

Get SHA256 fingerprint:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

---

## 10. Implementation Checklist

### 10.1 Supabase Dashboard

- [ ] Configure Site URL and all redirect URLs
- [ ] Enable Email provider with confirmation
- [ ] Configure Magic Link settings
- [ ] Set up Google OAuth (if using)
- [ ] Set up Apple OAuth (if using)
- [ ] Customize email templates
- [ ] Configure JWT expiry settings
- [ ] Set up rate limiting
- [ ] Verify RLS policies on all tables
- [ ] Test email delivery

### 10.2 Environment Setup

- [ ] Add all required environment variables to `.env`
- [ ] Update `.env.example` with placeholders
- [ ] Document OAuth client IDs for team
- [ ] Set up production vs development URLs
- [ ] Configure mobile scheme identifiers

### 10.3 Code Implementation

- [ ] Update `supabaseClient.js` with platform detection
- [ ] Implement magic link methods in `authService.js`
- [ ] Implement OAuth methods in `authService.js`
- [ ] Add client-side validation helpers
- [ ] Create session manager utility
- [ ] Add auth callback routes to router
- [ ] Create AuthCallback view
- [ ] Create AuthConfirm view
- [ ] Create ResetPassword view
- [ ] Integrate deep link handler
- [ ] Update auth UI components with new methods
- [ ] Add password strength indicator
- [ ] Implement "resend confirmation" functionality

### 10.4 Mobile Configuration

- [ ] Update `tauri.conf.json` with deep link protocols
- [ ] Configure iOS Universal Links (AASA file)
- [ ] Configure Android App Links (assetlinks.json)
- [ ] Test deep links on iOS simulator
- [ ] Test deep links on Android emulator
- [ ] Implement secure storage wrapper (future)
- [ ] Test OAuth flow on mobile
- [ ] Test magic link flow on mobile

### 10.5 Testing

- [ ] Test email/password signup with confirmation
- [ ] Test email/password signin
- [ ] Test magic link signin
- [ ] Test Google OAuth (if enabled)
- [ ] Test Apple OAuth (if enabled)
- [ ] Test password reset flow
- [ ] Test session persistence across page reloads
- [ ] Test token refresh
- [ ] Test sign out (local and global)
- [ ] Test auth state change listeners
- [ ] Test protected route navigation
- [ ] Test mobile deep links (iOS)
- [ ] Test mobile deep links (Android)
- [ ] Test error scenarios (expired tokens, etc.)

### 10.6 Documentation

- [ ] Document OAuth setup process for team
- [ ] Create user guide for authentication features
- [ ] Document deep link testing procedures
- [ ] Add troubleshooting guide
- [ ] Document security best practices
- [ ] Create deployment checklist

---

## Appendix A: Quick Reference

### Platform Detection

```javascript
const isTauri = () => typeof window !== 'undefined' && window.__TAURI__;
const isTauriMobile = () => {
  if (!isTauri()) return false;
  const platform = window.__TAURI_INTERNALS__?.plugins?.os?.platform;
  return platform === 'ios' || platform === 'android';
};
```

### Common Auth Operations

```javascript
// Sign up with email
await authService.signUp(email, password, fullName);

// Sign in with email
await authService.signIn(email, password);

// Send magic link
await authService.sendMagicLink(email);

// OAuth sign-in
await authService.signInWithGoogle();
await authService.signInWithApple();

// Password reset
await authService.resetPassword(email);
await authService.updatePassword(newPassword);

// Sign out
await authService.signOut();
await authService.signOut({ scope: 'global' }); // All devices
```

### Redirect URL Patterns

| Context | Redirect URL |
|---------|-------------|
| Web (Dev) | `http://localhost:5173/auth/callback` |
| Web (Prod) | `https://switchfit.app/auth/callback` |
| Mobile (iOS/Android) | `switchfit://auth/callback` |
| Mobile (Alt) | `com.switchfit.studio://auth/callback` |

---

## Appendix B: Troubleshooting

### Email Not Sending

1. Check Supabase email settings
2. Verify SMTP configuration
3. Check spam folder
4. Verify email templates are saved
5. Check rate limiting settings

### OAuth Not Working

1. Verify redirect URLs in provider console match Supabase
2. Check client ID and secret are correct
3. Ensure provider is enabled in Supabase dashboard
4. Check browser console for CORS errors
5. Verify scopes are correctly configured

### Deep Links Not Working

**iOS:**
- Reinstall app (iOS caches AASA file)
- Verify AASA file is accessible at `https://domain.com/.well-known/apple-app-site-association`
- Check Team ID matches
- Ensure app is installed from Xcode or TestFlight (not simulator for production links)

**Android:**
- Verify assetlinks.json is accessible
- Check SHA256 fingerprint matches signing certificate
- Test with `adb shell am start -W -a android.intent.action.VIEW -d "switchfit://auth/callback"`
- Clear app data and reinstall

### Session Issues

1. Clear all auth data: `window.clearAuthData()`
2. Check localStorage for corrupted data
3. Verify token expiry settings
4. Check for conflicting auth libraries
5. Test in incognito/private mode

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-06  
**Author:** SwitchFit Architecture Team