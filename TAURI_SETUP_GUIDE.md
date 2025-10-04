# Tauri 2 Mobile Setup Guide for SwitchFit Studio

## Prerequisites Installation

### 1. Install Rust

Rust is required for Tauri. Install it using rustup:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

After installation, restart your terminal or run:
```bash
source ~/.cargo/env
```

Verify installation:
```bash
rustc --version
cargo --version
```

### 2. Verify Xcode Installation (macOS)

Since you have Xcode installed, verify it's properly configured:

```bash
xcode-select --version
```

If needed, set Xcode command line tools:
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

### 3. Verify Android Studio Installation

Check JAVA_HOME and Android SDK:

```bash
echo $JAVA_HOME
echo $ANDROID_HOME
echo $NDK_HOME
```

If not set, add to your `~/.zshrc`:

```bash
# Add these lines to ~/.zshrc
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export NDK_HOME="$ANDROID_HOME/ndk/$(ls -1 $ANDROID_HOME/ndk | tail -n 1)"

# Add to PATH
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$PATH"
```

Then reload:
```bash
source ~/.zshrc
```

### 4. Install Android NDK

In Android Studio:
1. Go to Tools → SDK Manager
2. Click "SDK Tools" tab
3. Check "NDK (Side by side)"
4. Check "CMake"
5. Click "Apply" and wait for installation

### 5. Install Required Rust Targets

Once Rust is installed, add mobile compilation targets:

```bash
# iOS targets
rustup target add aarch64-apple-ios x86_64-apple-ios aarch64-apple-ios-sim

# Android targets
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

## Next Steps After Prerequisites

Once all prerequisites are installed, we'll proceed with:

1. Installing Tauri CLI
2. Initializing Tauri in your project
3. Setting up mobile platforms
4. Configuring your application

## Verification Checklist

Before proceeding, ensure all these commands work:

- [ ] `rustc --version` - Shows Rust version
- [ ] `cargo --version` - Shows Cargo version
- [ ] `xcode-select --version` - Shows Xcode tools version
- [ ] `echo $JAVA_HOME` - Shows Java path
- [ ] `echo $ANDROID_HOME` - Shows Android SDK path
- [ ] `echo $NDK_HOME` - Shows NDK path
- [ ] Android Studio opens successfully
- [ ] Xcode opens successfully

## Troubleshooting

### Rust Installation Issues
If rustup installation fails, you can also install via Homebrew:
```bash
brew install rustup-init
rustup-init
```

### Android Studio Issues
Ensure Android SDK Platform-Tools and Build-Tools are installed:
1. Open Android Studio
2. SDK Manager → SDK Tools
3. Verify these are checked:
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
   - Android SDK Tools
   - NDK (Side by side)

### Environment Variables Not Persisting
If environment variables don't persist after restart, ensure they're in `~/.zshrc` (for zsh) or `~/.bash_profile` (for bash).

---

**Ready to proceed?** Once you've completed these prerequisites, let me know and we'll continue with the Tauri installation!