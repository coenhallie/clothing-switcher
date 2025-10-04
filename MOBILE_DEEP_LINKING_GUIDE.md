# Mobile Deep Linking Guide for Supabase Authentication

## Overview

Deep linking is essential for OAuth authentication flows on mobile devices. When users authenticate with Supabase on mobile, they need to be redirected back to your app.

## iOS Universal Links Setup

### Step 1: Configure Apple App Site Association (AASA)

You'll need to host this file at `https://yourdomain.com/.well-known/apple-app-site-association`:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.switchfit.studio",
        "paths": [
          "/auth/callback",
          "/auth/*"
        ]
      }
    ]
  }
}
```

**Note:** Replace `TEAM_ID` with your Apple Developer Team ID (found in your Apple Developer account).

### Step 2: Update iOS Project Configuration

After Android SDK is set up and you've run `tauri android init`, you'll need to add URL schemes to the iOS configuration.

The file will be at: `src-tauri/gen/apple/ExportOptions.plist`

Add this to your Info.plist (Tauri generates this, but you may need to verify):

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>switchfit</string>
      <string>com.switchfit.studio</string>
    </array>
  </dict>
</array>
```

### Step 3: Configure Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication → URL Configuration**
3. Add these redirect URLs:
   ```
   switchfit://auth/callback
   com.switchfit.studio://auth/callback
   https://yourdomain.com/auth/callback
   ```

## Android App Links Setup

### Step 1: Generate Digital Asset Links

Create a file that will be hosted at `https://yourdomain.com/.well-known/assetlinks.json`:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.switchfit.studio",
      "sha256_cert_fingerprints": [
        "YOUR_SHA256_FINGERPRINT_HERE"
      ]
    }
  }
]
```

To get your SHA256 fingerprint:

```bash
# For debug keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# For release keystore (after you create it)
keytool -list -v -keystore path/to/your/keystore.jks -alias your-key-alias
```

### Step 2: Update Android Manifest

After running `tauri android init`, edit `src-tauri/gen/android/app/src/main/AndroidManifest.xml`:

Add this intent filter to your main activity:

```xml
<activity android:name=".MainActivity">
  <!-- Existing intent filters... -->
  
  <!-- Deep linking for authentication -->
  <intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    
    <!-- App Links (verified) -->
    <data
      android:scheme="https"
      android:host="yourdomain.com"
      android:pathPrefix="/auth" />
  </intent-filter>
  
  <!-- Custom URL scheme -->
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    
    <data android:scheme="switchfit" />
    <data android:scheme="com.switchfit.studio" />
  </intent-filter>
</activity>
```

### Step 3: Update Supabase Auth Configuration

In your Supabase Dashboard:
1. Go to **Authentication → URL Configuration**
2. Add these Android-specific redirect URLs:
   ```
   switchfit://auth/callback
   com.switchfit.studio://auth/callback
   ```

## Frontend Code Updates

### Update Authentication Service

Modify `src/services/authService.js` to handle mobile redirects:

```javascript
import { supabase } from './supabaseClient';

// Detect if running in Tauri mobile app
const isTauriMobile = () => {
  return window.__TAURI__ && (window.__TAURI_INTERNALS__.plugins?.os?.platform === 'ios' || 
                                window.__TAURI_INTERNALS__.plugins?.os?.platform === 'android');
};

// Get appropriate redirect URL
const getRedirectUrl = () => {
  if (isTauriMobile()) {
    return 'switchfit://auth/callback';
  }
  return `${window.location.origin}/auth/callback`;
};

export const signInWithProvider = async (provider) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: getRedirectUrl(),
        skipBrowserRedirect: false,
      },
    });

    if (error) throw error;

    // For mobile, open the auth URL in system browser
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
```

### Handle Deep Link in App

Add this to your `src/main.js`:

```javascript
import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);

// Handle deep links when app is opened from auth redirect
if (window.__TAURI__) {
  window.addEventListener('DOMContentLoaded', async () => {
    const { appWindow } = await import('@tauri-apps/api/window');
    
    // Listen for deep link events
    await appWindow.listen('deep-link', async (event) => {
      const url = event.payload;
      console.log('Deep link received:', url);
      
      // Parse the URL to extract auth tokens
      if (url.includes('auth/callback')) {
        const hashParams = new URLSearchParams(url.split('#')[1]);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken) {
          // Set the session
          const { supabase } = await import('./services/supabaseClient');
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }
      }
    });
  });
}

app.mount('#app');
```

## Testing Deep Links

### iOS Simulator
```bash
xcrun simctl openurl booted "switchfit://auth/callback?access_token=test"
```

### Android Emulator
```bash
adb shell am start -W -a android.intent.action.VIEW -d "switchfit://auth/callback?access_token=test"
```

## Troubleshooting

### iOS Universal Links Not Working
1. Verify AASA file is accessible at `https://yourdomain.com/.well-known/apple-app-site-association`
2. Make sure it's served with `Content-Type: application/json`
3. Check Team ID matches your Apple Developer account
4. Reinstall the app (iOS caches Universal Links)

### Android App Links Not Working  
1. Verify Digital Asset Links file is accessible
2. Check SHA256 fingerprint matches your signing certificate
3. Use `adb` to test manually:
   ```bash
   adb shell pm get-app-links com.switchfit.studio
   ```
4. Clear app data and reinstall

### General Debugging
- Check Supabase logs for redirect URLs
- Use browser dev tools to inspect auth flow
- Add console.log statements to track the authentication flow
- Test with custom URL schemes first (easier to debug than Universal/App Links)

---

**Next Steps:**
1. Set up your domain and host the required files (.well-known)
2. Configure Supabase redirect URLs
3. Update your authentication service code
4. Test on both iOS and Android devices