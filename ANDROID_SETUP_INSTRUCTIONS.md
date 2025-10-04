# Android SDK Setup Instructions

## Current Status

✅ **Completed:**
- Rust and all mobile targets installed
- Tauri 2 CLI installed
- iOS platform initialized successfully
- Project configured for mobile development
- Vite configured for mobile dev server

⚠️ **Needs Attention: Android SDK Setup**

The Android SDK needs to be installed through Android Studio before we can continue with Android initialization.

## Setting Up Android SDK via Android Studio

### Step 1: Open Android Studio

1. Launch **Android Studio** from your Applications folder
2. If this is your first time opening it, follow the setup wizard
3. Otherwise, go to **Android Studio > Settings** (or **Preferences** on newer versions)

### Step 2: Install Android SDK

1. Navigate to: **Settings/Preferences → Appearance & Behavior → System Settings → Android SDK**
2. Make note of the **Android SDK Location** path (usually `~/Library/Android/sdk`)
3. In the **SDK Platforms** tab:
   - ✅ Check **Android 14.0 (API 34)** or latest
   - ✅ Check **Android 7.0 (API 24)** - This is our minimum SDK version
   
4. In the **SDK Tools** tab, ensure these are installed:
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Platform-Tools
   - ✅ Android SDK Tools
   - ✅ Android Emulator
   - ✅ **NDK (Side by side)** - CRITICAL for Tauri!
   - ✅ CMake
   
5. Click **Apply** and wait for all components to download and install

### Step 3: Set Environment Variables

After the SDK is installed, add these to your `~/.zshrc` file:

```bash
# Android SDK Configuration for Tauri
export ANDROID_HOME="$HOME/Library/Android/sdk"
export NDK_HOME="$ANDROID_HOME/ndk/$(ls -1 $ANDROID_HOME/ndk | tail -n 1)"
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"

# Add Android tools to PATH
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$PATH"
```

Then reload your shell:
```bash
source ~/.zshrc
```

### Step 4: Verify Installation

Run these commands to verify everything is set up:

```bash
echo $ANDROID_HOME
# Should output: /Users/coenhallie/Library/Android/sdk

echo $NDK_HOME
# Should output: /Users/coenhallie/Library/Android/sdk/ndk/[version]

echo $JAVA_HOME
# Should output: /Applications/Android Studio.app/Contents/jbr/Contents/Home

# Verify NDK is installed
ls -la $ANDROID_HOME/ndk/
# Should show at least one NDK version directory
```

### Step 5: Resume Tauri Android Initialization

Once environment variables are set, run:

```bash
npm run tauri android init
```

This should now complete successfully!

## Creating an Android Emulator (Optional but Recommended)

1. In Android Studio, go to **Tools → Device Manager**
2. Click **Create Device**
3. Select a device definition (e.g., "Pixel 6")
4. Select a system image (e.g., "Tiramisu" API 33 or "UpsideDownCake" API 34)
5. Download the system image if needed
6. Click **Finish**

## Next Steps After Android SDK Setup

Once the Android SDK is configured and `tauri android init` succeeds:

1. ✅ Create mobile capability files with permissions
2. ✅ Configure Supabase deep linking
3. ✅ Set up app icons for both platforms
4. ✅ Configure OAuth redirects for mobile
5. ✅ Test the app on both iOS simulator and Android emulator

## Troubleshooting

### "ANDROID_HOME not set" Error
- Make sure you've added the environment variables to `~/.zshrc`
- Run `source ~/.zshrc` to reload
- Open a new terminal window
- Verify with `echo $ANDROID_HOME`

### "NDK not found" Error
- Open Android Studio SDK Manager
- Go to SDK Tools tab
- Check "NDK (Side by side)"
- Click Apply to install

### Command-line Tools Issues
If you see warnings about command-line tools:
1. In Android Studio SDK Manager
2. SDK Tools tab
3. Check "Android SDK Command-line Tools (latest)"
4. Apply changes

---

**Ready to proceed?** Complete the Android Studio setup above, then we'll continue with the implementation!