# Quick Start Guide (After Android SDK Setup)

Once you've completed the Android SDK setup from `ANDROID_SETUP_INSTRUCTIONS.md`, follow these steps to continue.

## ✅ Verify Android Environment

```bash
# Check environment variables are set
echo $ANDROID_HOME
echo $NDK_HOME
echo $JAVA_HOME

# All three should output paths, not empty
```

## 🚀 Initialize Android Target

```bash
# This should now work without errors
npm run tauri android init
```

Expected output:
```
✓ Android environment detected
✓ Generating Android project...
✓ Project generated successfully!
```

## 📱 Run on iOS Simulator

```bash
# List available simulators
xcrun simctl list devices

# Run on default simulator
npm run tauri:ios

# Or specify a simulator
npm run tauri ios dev "iPhone 15 Pro"

# Open in Xcode for debugging
npm run tauri ios dev --open
```

## 🤖 Run on Android Emulator

```bash
# First, start an Android emulator from Android Studio
# Or use command line:
emulator -avd Pixel_6_API_33

# In another terminal, run your app
npm run tauri:android

# Or open in Android Studio
npm run tauri android dev --open
```

## 🔧 Common Development Tasks

### Build for Production

```bash
# iOS (creates IPA)
npm run tauri ios build

# Android (creates APK and AAB)
npm run tauri android build
```

### Debug on Physical Devices

**iOS:**
```bash
# Connect iPhone via USB
# Trust the computer on device
npm run tauri ios dev --open
# Select your device in Xcode and run
```

**Android:**
```bash
# Enable USB debugging on device
# Connect via USB
adb devices  # Should show your device
npm run tauri android dev --open
# Select your device in Android Studio and run
```

### View Logs

**iOS:**
```bash
# In Xcode: View → Debug Area → Activate Console
# Or use Console app and filter by "SwitchFit"
```

**Android:**
```bash
# Real-time logs
adb logcat | grep -i switchfit

# Or use Android Studio's Logcat panel
```

## 🎨 Next Implementation Steps

### 1. Update Authentication Service

Edit `src/services/authService.js`:

```javascript
// Add at the top
const isTauriMobile = () => {
  return window.__TAURI__ && window.__TAURI_INTERNALS__?.plugins?.os;
};

const getRedirectUrl = () => {
  if (isTauriMobile()) {
    return 'switchfit://auth/callback';
  }
  return `${window.location.origin}/auth/callback`;
};

// Update your signInWithOAuth function
export const signInWithProvider = async (provider) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: getRedirectUrl(),
    },
  });

  // For mobile, open in system browser
  if (isTauriMobile() && data?.url) {
    const { open } = await import('@tauri-apps/plugin-shell');
    await open(data.url);
  }

  return { data, error };
};
```

### 2. Handle Deep Link Returns

Edit `src/main.js`:

```javascript
// After app creation, before mounting
if (window.__TAURI__) {
  const { appWindow } = await import('@tauri-apps/api/window');
  
  await appWindow.listen('deep-link', async (event) => {
    const url = event.payload;
    if (url.includes('auth/callback')) {
      // Parse and set session
      const hashParams = new URLSearchParams(url.split('#')[1]);
      const accessToken = hashParams.get('access_token');
      
      if (accessToken) {
        const { supabase } = await import('./services/supabaseClient');
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token'),
        });
      }
    }
  });
}
```

### 3. Update Supabase Redirect URLs

In Supabase Dashboard → Authentication → URL Configuration:
```
switchfit://auth/callback
com.switchfit.studio://auth/callback
https://yourdomain.com/auth/callback
```

### 4. Create App Icons

Replace default icons in `src-tauri/icons/`:
- Create a 1024x1024px PNG icon (no transparency)
- Name it `icon.png`
- Tauri will auto-generate all required sizes for both platforms

## 🧪 Testing Checklist

### On iOS Simulator
- [ ] App launches successfully
- [ ] UI renders correctly
- [ ] Authentication flow works
- [ ] Image upload works
- [ ] Gallery loads
- [ ] Credit system updates
- [ ] Deep linking works

### On Android Emulator
- [ ] App launches successfully
- [ ] UI renders correctly
- [ ] Authentication flow works
- [ ] Image upload works
- [ ] Gallery loads
- [ ] Credit system updates
- [ ] Deep linking works

### Both Platforms
- [ ] Offline handling
- [ ] Network error handling
- [ ] Background/foreground transitions
- [ ] Memory usage acceptable
- [ ] No console errors

## 🐛 Troubleshooting

### App Won't Launch on iOS
```bash
# Clean build
cd src-tauri/gen/apple
xcodebuild clean
cd -
npm run tauri ios dev
```

### App Won't Launch on Android
```bash
# Clean build
cd src-tauri/gen/android
./gradlew clean
cd -
npm run tauri android dev
```

### Deep Linking Not Working
```bash
# Test manually (iOS)
xcrun simctl openurl booted "switchfit://auth/callback?test=true"

# Test manually (Android)
adb shell am start -W -a android.intent.action.VIEW -d "switchfit://auth/callback?test=true" com.switchfit.studio
```

### Build Errors
```bash
# Update dependencies
cargo update
npm install

# Re-initialize if needed
npm run tauri ios init
npm run tauri android init
```

## 📚 Useful Documentation

- **Tauri Mobile Docs**: https://tauri.app/develop/
- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **Deep Linking**: See `MOBILE_DEEP_LINKING_GUIDE.md`
- **Full Status**: See `TAURI_MOBILE_IMPLEMENTATION_STATUS.md`

## 🎯 Production Checklist

Before submitting to app stores:

- [ ] Replace all placeholder icons with final artwork
- [ ] Set up proper code signing (iOS & Android)
- [ ] Create release build variants
- [ ] Test on real devices extensively
- [ ] Prepare store listings (screenshots, descriptions)
- [ ] Set up crash reporting (optional but recommended)
- [ ] Configure analytics (optional)
- [ ] Review and update privacy policy
- [ ] Test payment flows thoroughly
- [ ] Verify all deep links work
- [ ] Check app size and optimize if needed

---

**You're ready to go! Start with iOS testing, then move to Android once SDK is set up. 🚀**