# Running on Your Android Phone - Step by Step Guide

## Prerequisites Checklist

Before you can run on your physical Android phone, you need:

- [ ] Android SDK installed (see [ANDROID_SETUP_INSTRUCTIONS.md](ANDROID_SETUP_INSTRUCTIONS.md))
- [ ] Environment variables set (ANDROID_HOME, NDK_HOME, JAVA_HOME)
- [ ] Android initialization complete (`npm run tauri android init`)
- [ ] Your Android phone
- [ ] USB cable

## Step-by-Step Process

### Step 1: Complete Android SDK Setup (If Not Done)

**Check if Android SDK is ready:**
```bash
echo $ANDROID_HOME
echo $NDK_HOME
```

If these are empty, follow these steps:

1. **Open Android Studio**
2. **Go to:** Settings/Preferences → Appearance & Behavior → System Settings → Android SDK
3. **Install these components:**
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Platform-Tools
   - ✅ **NDK (Side by side)** ← Critical!
   - ✅ Android Emulator
   - ✅ CMake

4. **Add to `~/.zshrc`:**
   ```bash
   export ANDROID_HOME="$HOME/Library/Android/sdk"
   export NDK_HOME="$ANDROID_HOME/ndk/$(ls -1 $ANDROID_HOME/ndk | tail -n 1)"
   export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
   export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$PATH"
   ```

5. **Reload shell:**
   ```bash
   source ~/.zshrc
   ```

6. **Initialize Android target:**
   ```bash
   npm run tauri android init
   ```

### Step 2: Prepare Your Android Phone

1. **Enable Developer Options:**
   - Open **Settings** on your phone
   - Go to **About Phone**
   - Tap **Build Number** 7 times
   - You should see "You are now a developer!"

2. **Enable USB Debugging:**
   - Go back to main **Settings**
   - Find **Developer Options** (usually under System or About Phone)
   - Enable **USB Debugging**
   - Enable **Install via USB** (if available)

3. **Connect Phone to Mac:**
   - Use a USB cable to connect your phone to your Mac
   - On your phone, you'll see a prompt "Allow USB Debugging?"
   - Check "Always allow from this computer"
   - Tap **Allow**

### Step 3: Verify Phone Connection

```bash
# Check if your phone is detected
adb devices
```

**Expected output:**
```
List of devices attached
ABC123456789    device
```

If you see:
- `unauthorized` - Check your phone for the USB debugging prompt
- `no permissions` - Run `adb kill-server` then `adb start-server`
- Empty list - Try a different USB cable or USB port

### Step 4: Run Your App on the Phone

**Option A: Quick Run (Recommended for testing)**

```bash
npm run tauri android dev
```

This will:
1. Start your Vite dev server
2. Build the Android app
3. Install it on your connected phone
4. Run it with live reload enabled

**Option B: Open in Android Studio (For detailed debugging)**

```bash
npm run tauri android dev --open
```

This will:
1. Open Android Studio
2. Show you the Android project
3. Let you select your device from the device dropdown
4. Click the green "Run" button to deploy

### Step 5: Development Workflow

Once running, the app will:
- ✅ Connect to your local dev server
- ✅ Support hot module reload (HMR)
- ✅ Show console logs in terminal
- ✅ Reload when you save changes

**To see logs:**
```bash
# In a separate terminal
adb logcat | grep -i switchfit
```

### Step 6: Testing on Phone

Your phone needs to be on the **same WiFi network** as your Mac for the dev server to work.

**If the app can't connect to dev server:**

1. Find your Mac's local IP:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. The dev server should automatically use this IP
3. Make sure your firewall allows connections on port 5173

## Troubleshooting

### Phone Not Detected

**Problem:** `adb devices` shows nothing

**Solutions:**
```bash
# Restart ADB server
adb kill-server
adb start-server

# Check again
adb devices

# If still not working, check USB cable (use a data cable, not just charging cable)
```

### Unauthorized Device

**Problem:** `adb devices` shows `unauthorized`

**Solution:**
1. Disconnect and reconnect USB cable
2. Check your phone screen for USB debugging prompt
3. Tap "Allow" and check "Always allow from this computer"

### Build Errors

**Problem:** Build fails with error messages

**Solutions:**
```bash
# Clean build
cd src-tauri/gen/android
./gradlew clean
cd -

# Try again
npm run tauri android dev
```

### App Installs But Won't Connect

**Problem:** App opens but shows connection error

**Solutions:**

1. **Check both devices are on same WiFi**
   - Mac and phone must be on the same network
   - Corporate/school WiFi may block local connections

2. **Check firewall settings:**
   - System Preferences → Security & Privacy → Firewall
   - Allow incoming connections for Node/npm

3. **Manually specify host:**
   ```bash
   # Find your IP
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Set it explicitly (example IP: 192.168.1.100)
   TAURI_DEV_HOST=192.168.1.100 npm run tauri android dev
   ```

### Slow Build Times

**Problem:** Building takes a long time

**Solutions:**
- First build is always slow (downloading dependencies)
- Subsequent builds are much faster
- Keep Android Studio open to maintain Gradle daemon
- Consider using `--release` flag for final testing: `npm run tauri android build`

## Quick Command Reference

```bash
# List connected devices
adb devices

# Install and run on phone
npm run tauri android dev

# Open in Android Studio
npm run tauri android dev --open

# View logs from phone
adb logcat | grep -i switchfit

# Clear app data (if needed)
adb shell pm clear com.switchfit.studio

# Uninstall app
adb uninstall com.switchfit.studio

# Restart ADB
adb kill-server && adb start-server

# Check if phone is connected and authorized
adb devices -l
```

## Build for Testing Without Dev Server

If you want to build a standalone APK for testing:

```bash
# Build debug APK
npm run tauri android build

# Find the APK at:
# src-tauri/gen/android/app/build/outputs/apk/debug/app-debug.apk

# Install manually
adb install src-tauri/gen/android/app/build/outputs/apk/debug/app-debug.apk
```

## Pro Tips

1. **Keep USB Debugging On:** For easier testing during development
2. **Use Wireless Debugging:** Android 11+ supports wireless ADB
3. **Check Logs:** Use `adb logcat` to see detailed error messages
4. **Hot Reload:** Save your Vue files and see changes instantly on phone
5. **Same Network:** Ensure Mac and phone are on same WiFi

## Network Configuration for Physical Device

When running on a physical device, Tauri automatically detects your local IP and configures the dev server. However, if you have issues:

**Manual configuration:**

Create a file `.env.local`:
```bash
# Replace with your Mac's actual IP address
TAURI_DEV_HOST=192.168.1.100
```

Then run:
```bash
npm run tauri android dev
```

## What's Next After Testing?

Once your app works on your phone:

1. **Test all features:**
   - Authentication
   - Image upload
   - AI processing
   - Gallery
   - Payments

2. **Create release build:**
   ```bash
   npm run tauri android build --release
   ```

3. **Prepare for Play Store:**
   - Set up signing key
   - Create store listing
   - Generate screenshots
   - Submit for review

---

## Complete Workflow Example

Here's a complete example from start to finish:

```bash
# 1. Check Android SDK is set up
echo $ANDROID_HOME
# Should show: /Users/yourname/Library/Android/sdk

# 2. Check phone is connected
adb devices
# Should show your device

# 3. Run on phone
npm run tauri android dev

# 4. In another terminal, watch logs
adb logcat | grep -i switchfit

# 5. Make changes to your Vue code
# The app will automatically reload on your phone!
```

---

**Ready to test on your Android phone? Start with Step 1 above!** 📱

For any issues, refer to:
- [ANDROID_SETUP_INSTRUCTIONS.md](ANDROID_SETUP_INSTRUCTIONS.md) - SDK setup
- [QUICK_START_AFTER_ANDROID_SETUP.md](QUICK_START_AFTER_ANDROID_SETUP.md) - General guide