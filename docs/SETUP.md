# SwitchFit Mobile Authentication - Setup Guide

**Last Updated:** 2025-10-07  
**Version:** 1.0

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Supabase Configuration](#supabase-configuration)
4. [Environment Variables](#environment-variables)
5. [Deep Link Testing](#deep-link-testing)
6. [Development Workflow](#development-workflow)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 or **pnpm** >= 8.0.0
- **Rust** >= 1.70.0 (for Tauri)
- **Tauri CLI** >= 2.0.0

### Platform-Specific Requirements

#### iOS Development
- macOS (required for iOS builds)
- Xcode >= 14.0
- iOS Simulator or physical device
- Apple Developer account (for device testing)

#### Android Development
- Android Studio
- Android SDK (API 24+)
- Java JDK 11 or 17
- Physical Android device or emulator

### Accounts & Services

- **Supabase Account** - [Sign up free](https://supabase.com)
- **Google Cloud Console** (optional - for OAuth)
- **Apple Developer** (optional - for Apple Sign In)

---

## Quick Start

### 1. Install Dependencies

```bash
# Clone repository (if not already done)
git clone <your-repo-url>
cd clothing-switcher

# Install dependencies
npm install

# Install Tauri CLI (if not already installed)
npm install -g @tauri-apps/cli@next
```

### 2. Set Up Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your Supabase credentials
nano .env  # or use your preferred editor
```

**Minimum Required Variables:**
```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Development Server

```bash
# Web development (fastest for testing)
npm run dev

# Desktop development (Tauri)
npm run tauri dev

# Mobile development (requires platform setup)
npm run tauri android dev  # Android
npm run tauri ios dev      # iOS
```

### 4. Access the Application

- **Web:** http://localhost:5173
- **Desktop:** Opens automatically in Tauri window
- **Mobile:** Deploys to emulator/device automatically

---

## Supabase Configuration

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name:** SwitchFit (or your preference)
   - **Database Password:** Generate a strong password
   - **Region:** Choose closest to your users
4. Wait for project to initialize (~2 minutes)

### Step 2: Get API Credentials

1. In Supabase Dashboard, navigate to **Settings → API**
2. Copy the following:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`
3. Add these to your `.env` file

### Step 3: Configure Authentication

#### Enable Email Provider

1. Navigate to **Authentication → Providers**
2. Click on **Email**
3. Configure:
   ```
   ✅ Enable Email provider
   ✅ Confirm email (recommended for production)
   ✅ Secure email change
   ❌ Enable email OTP (use magic links instead)
   ```

#### Configure Site URL

1. Navigate to **Authentication → URL Configuration**
2. Set **Site URL:**
   - **Development:** `http://localhost:5173`
   - **Production:** `https://yourdomain.com`

#### Add Redirect URLs

Add all of the following to **Redirect URLs:**

```
# Web/Desktop Development
http://localhost:5173/auth/callback
http://localhost:5173/auth/confirm
http://localhost:5173/auth/reset-password

# Web/Desktop Production
https://yourdomain.com/auth/callback
https://yourdomain.com/auth/confirm
https://yourdomain.com/auth/reset-password

# Mobile Deep Links
switchfit://auth/callback
switchfit://auth/confirm
switchfit://auth/reset-password
com.switchfit.studio://auth/callback
com.switchfit.studio://auth/confirm
com.switchfit.studio://auth/reset-password
```

### Step 4: Set Up Database (Optional - for Credits)

Run migrations in Supabase SQL Editor:

```sql
-- Create credits table
CREATE TABLE IF NOT EXISTS credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_balance INTEGER DEFAULT 0,
  total_purchased INTEGER DEFAULT 0,
  total_consumed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own credits
CREATE POLICY "Users can view own credits"
  ON credits FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update own credits
CREATE POLICY "Users can update own credits"
  ON credits FOR UPDATE
  USING (auth.uid() = user_id);
```

### Step 5: Configure OAuth Providers (Optional)

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Configure:
   - **Application type:** Web application
   - **Authorized redirect URIs:**
     ```
     https://[your-project-ref].supabase.co/auth/v1/callback
     ```
6. Copy **Client ID** and **Client Secret**
7. In Supabase Dashboard:
   - Navigate to **Authentication → Providers → Google**
   - Enable Google provider
   - Paste Client ID and Client Secret
   - Add scopes: `email`, `profile`, `openid`

#### Apple Sign In

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Create a **Services ID:**
   - **Identifier:** `com.switchfit.studio.signin`
   - **Description:** SwitchFit Sign In
4. Configure **Sign In with Apple:**
   - **Domains:** `yourdomain.com`
   - **Redirect URLs:**
     ```
     https://[your-project-ref].supabase.co/auth/v1/callback
     ```
5. Create a **Key** for Sign In with Apple
6. In Supabase Dashboard:
   - Navigate to **Authentication → Providers → Apple**
   - Enable Apple provider
   - Enter Services ID, Team ID, Key ID, and Private Key

---

## Deep Link Configuration (Future Enhancement)

### Current Status: Not Yet Implemented

**Important:** Native deep link support requires Tauri v2.1+ with the `tauri-plugin-deep-link` plugin, which is not yet available in the current Tauri v2.0 RC version.

### Current Behavior

- **Web/Desktop OAuth:** Works via browser-based callbacks to `http://localhost:5173/auth/callback`
- **Mobile OAuth:** Currently uses web-based callbacks, not native deep links
- **Deep Link Handler Code:** Implemented in [`src/services/deepLinkHandler.js`](../src/services/deepLinkHandler.js) but will gracefully fail until plugin is installed

### When Deep Link Plugin Becomes Available

Once you upgrade to Tauri v2.1+ and the deep-link plugin is released:

1. **Install the deep-link plugin:**
   ```bash
   cargo add tauri-plugin-deep-link
   ```

2. **Register the plugin in `src-tauri/src/main.rs`:**
   ```rust
   tauri::Builder::default()
       .plugin(tauri_plugin_deep_link::init())
       .run(tauri::generate_context!())
       .expect("error while running tauri application");
   ```

3. **Add deep link configuration to `src-tauri/tauri.conf.json`:**
   ```json
   {
     "plugins": {
       "deep-link": {
         "mobile": {
           "scheme": ["switchfit", "com.switchfit.studio"]
         }
       }
     }
   }
   ```

4. **Update platform-specific configurations:**
   - **iOS:** Add URL schemes to `Info.plist` (auto-generated by plugin)
   - **Android:** Add intent filters to `AndroidManifest.xml` (auto-generated by plugin)

5. **The existing deep link handler will automatically activate** once the plugin is available

### Temporary Workaround

Until native deep links are available:
- Authentication will redirect to web URLs
- Users must manually return to the app after OAuth completion
- Session will persist via localStorage in the webview

---

## Environment Variables

### Complete `.env` Configuration

```bash
# ============================================
# SUPABASE CONFIGURATION (Required)
# ============================================
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# ============================================
# MOBILE DEEP LINKING (Required for Mobile)
# ============================================
# Custom URL scheme for deep links
VITE_MOBILE_SCHEME=switchfit

# Bundle identifier (must match tauri.conf.json)
VITE_MOBILE_BUNDLE_ID=com.switchfit.studio

# ============================================
# OAUTH PROVIDERS (Optional)
# ============================================
# Google Cloud Console
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Apple Developer Portal
VITE_APPLE_CLIENT_ID=com.switchfit.studio.signin

# ============================================
# SITE URLS (Optional - auto-detected)
# ============================================
VITE_SITE_URL_PRODUCTION=https://switchfit.app
VITE_SITE_URL_DEVELOPMENT=http://localhost:5173

# ============================================
# FEATURE FLAGS (Optional)
# ============================================
VITE_ENABLE_MAGIC_LINK=true
VITE_ENABLE_SOCIAL_AUTH=true
VITE_ENABLE_EMAIL_CONFIRMATION=true

# ============================================
# OTHER SERVICES (Optional)
# ============================================
# Stripe for payments
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# OpenRouter for AI
VITE_OPENROUTER_API_KEY=sk-or-v1-...

# Application environment
VITE_APP_ENV=development
```

### Environment Variable Validation

To verify your environment variables are loaded correctly:

```javascript
// In browser console or component
console.log({
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  mobileScheme: import.meta.env.VITE_MOBILE_SCHEME
})
```

---

## Deep Link Testing

### iOS Simulator Testing

```bash
# Open iOS simulator first
npm run tauri ios dev

# In a separate terminal, trigger deep link
xcrun simctl openurl booted "switchfit://auth/callback?access_token=test&refresh_token=test"
```

**Expected Behavior:**
- App opens (if backgrounded)
- Console logs show deep link received
- AuthCallback view processes the URL

### Android Emulator Testing

```bash
# Start Android emulator and run app
npm run tauri android dev

# In a separate terminal, trigger deep link
adb shell am start -W -a android.intent.action.VIEW \
  -d "switchfit://auth/callback?access_token=test&refresh_token=test" \
  com.switchfit.studio
```

**Expected Behavior:**
- App opens (if backgrounded)
- Logcat shows deep link intent received
- AuthCallback view processes the URL

### Testing OAuth Flow (Full Integration)

1. **Start the app on device/emulator**
2. **Navigate to authentication screen**
3. **Tap "Continue with Google"**
4. **System browser should open** with Google auth
5. **Authenticate with Google**
6. **Browser redirects** to `switchfit://auth/callback#access_token=...`
7. **App should open** and user should be signed in

### Debugging Deep Links

#### iOS Debugging
```bash
# View system logs
xcrun simctl spawn booted log stream --predicate 'process == "SwitchFit Studio"'

# Check if URL scheme is registered
xcrun simctl openurl booted "switchfit://"
```

#### Android Debugging
```bash
# View app logs
adb logcat | grep SwitchFit

# Verify intent filters
adb shell dumpsys package com.switchfit.studio | grep -A 10 "filter"

# Test specific deep link
adb shell am start -a android.intent.action.VIEW \
  -d "switchfit://auth/callback" \
  com.switchfit.studio
```

---

## Development Workflow

### Recommended Development Flow

1. **Start with Web Development**
   ```bash
   npm run dev
   ```
   - Fastest iteration cycle
   - Use Chrome DevTools for debugging
   - Test auth flows in browser first

2. **Test on Desktop (Tauri)**
   ```bash
   npm run tauri dev
   ```
   - Verify platform detection works
   - Test desktop-specific features
   - Check session persistence

3. **Test on Mobile Emulator**
   ```bash
   # iOS
   npm run tauri ios dev
   
   # Android
   npm run tauri android dev
   ```
   - Test touch interactions
   - Verify safe areas
   - Test deep links

4. **Test on Physical Device**
   ```bash
   # Build and deploy to device
   npm run tauri ios build
   npm run tauri android build
   ```
   - Final verification
   - Test real-world network conditions
   - Verify OAuth redirects work

### Hot Module Replacement (HMR)

HMR is enabled by default in development:

```bash
npm run dev           # Web - HMR works
npm run tauri dev     # Desktop - HMR works
npm run tauri ios dev # iOS - Reload required
npm run tauri android dev # Android - Reload required
```

**Note:** Mobile platforms require app reload for code changes.

### Debugging Authentication Issues

#### Enable Verbose Logging

Add to your auth service:

```javascript
// src/services/authService.js
const DEBUG = import.meta.env.DEV

if (DEBUG) {
  console.log('[Auth] Method called:', methodName, args)
}
```

#### Check Supabase Session

```javascript
// In browser console
const { data, error } = await supabase.auth.getSession()
console.log('Session:', data.session)
console.log('User:', data.session?.user)
```

#### Verify Deep Link Handler

```javascript
// In mobile app console
window.__TAURI_INTERNALS__?.plugins?.os?.platform
// Should return 'ios' or 'android'

// Check if deep link listener is active
// Look for console log: "Deep link listener initialized successfully"
```

---

## Troubleshooting

### Common Issues

#### Issue: "Invalid API Key" Error

**Symptoms:** Authentication fails immediately with API key error

**Solutions:**
1. Verify `.env` file exists in project root
2. Check `VITE_SUPABASE_ANON_KEY` is correct (from Supabase Dashboard)
3. Restart development server after changing `.env`
4. Ensure no trailing spaces in environment variables

```bash
# Verify environment variables are loaded
npm run dev
# Open http://localhost:5173
# Check browser console for Supabase client initialization
```

#### Issue: OAuth Redirect Not Working

**Symptoms:** OAuth authentication completes but doesn't redirect back

**Solutions:**
1. Verify redirect URLs in Supabase Dashboard match exactly
2. Check OAuth provider settings (Google Cloud Console, Apple Developer)
3. Ensure deep link schemes configured in `tauri.conf.json`
4. Test with simple deep link first (see [Deep Link Testing](#deep-link-testing))

#### Issue: Deep Links Not Opening App (iOS)

**Symptoms:** Clicking deep link opens browser instead of app

**Solutions:**
1. Reinstall app (iOS caches URL schemes)
2. Verify URL scheme in `Info.plist` (auto-generated by Tauri)
3. Check device logs for URL scheme registration errors
4. Test with `xcrun simctl openurl` first

#### Issue: Deep Links Not Opening App (Android)

**Symptoms:** Clicking deep link doesn't do anything

**Solutions:**
1. Check AndroidManifest.xml has correct intent filters
2. Verify app is installed (not just in emulator)
3. Test with `adb shell am start` command
4. Clear app data and reinstall

```bash
# Clear app data
adb shell pm clear com.switchfit.studio

# Reinstall
npm run tauri android dev
```

#### Issue: "Session Expired" on Mobile

**Symptoms:** User signs in but session doesn't persist

**Solutions:**
1. Check localStorage is enabled in webview
2. Verify Supabase session storage configuration
3. Test if session persists in web version first
4. Check for errors in app console logs

#### Issue: Platform Detection Not Working

**Symptoms:** Mobile UI shows on desktop or vice versa

**Solutions:**
1. Verify `usePlatform` composable is being called
2. Check `window.__TAURI__` is defined (Tauri apps)
3. Test platform detection in console:
   ```javascript
   console.log('isTauri:', !!window.__TAURI__)
   console.log('platform:', window.__TAURI_INTERNALS__?.plugins?.os?.platform)
   ```

#### Issue: Safe Areas Not Working (iOS)

**Symptoms:** Content overlaps with notch or home indicator

**Solutions:**
1. Verify safe area utilities in CSS: `.safe-top`, `.safe-bottom`
2. Check viewport meta tag includes `viewport-fit=cover`
3. Test on device with notch (iPhone X or newer)
4. Inspect computed styles in Safari Web Inspector

### Getting Help

1. **Check Documentation:**
   - [`docs/mobile-auth-implementation-summary.md`](mobile-auth-implementation-summary.md)
   - [`docs/supabase-auth-configuration.md`](supabase-auth-configuration.md)
   - [`MOBILE_DEEP_LINKING_GUIDE.md`](../MOBILE_DEEP_LINKING_GUIDE.md)

2. **Enable Debug Logging:**
   ```javascript
   // Add to main.js
   if (import.meta.env.DEV) {
     window.DEBUG_AUTH = true
   }
   ```

3. **Check Browser Console:**
   - Web/Desktop: Chrome DevTools
   - iOS: Safari Web Inspector (for device testing)
   - Android: Chrome Remote Debugging

4. **Review Supabase Logs:**
   - Dashboard → Logs → Auth
   - Look for failed authentication attempts
   - Check rate limiting issues

---

## Next Steps

Once setup is complete:

1. ✅ Verify environment variables are loaded
2. ✅ Test basic email/password authentication
3. ✅ Test magic link flow
4. ✅ Test OAuth providers (if configured)
5. ✅ Test deep links on mobile platforms
6. ✅ Run through [Testing Checklist](mobile-auth-implementation-summary.md#testing-checklist)

**For Production Deployment:**
- [ ] Configure iOS Universal Links ([Guide](../MOBILE_DEEP_LINKING_GUIDE.md#ios-universal-links-setup))
- [ ] Configure Android App Links ([Guide](../MOBILE_DEEP_LINKING_GUIDE.md#android-app-links-setup))
- [ ] Implement secure storage for mobile tokens
- [ ] Set up production Supabase project
- [ ] Configure production OAuth credentials
- [ ] Test on physical devices (iOS + Android)

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-07  
**Maintained By:** SwitchFit Development Team