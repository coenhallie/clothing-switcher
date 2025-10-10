# 📱 Tauri Native Plugins Implementation

> **Phase 4: Documentation** - Complete guide to native plugin integrations for enhanced mobile experience

## 📋 Table of Contents

- [Overview](#overview)
- [Installed Plugins](#installed-plugins)
- [Composable API](#composable-api)
- [Implementation Details](#implementation-details)
- [Usage Examples](#usage-examples)
- [Testing](#testing)
- [Future Enhancements](#future-enhancements)

---

## Overview

This document covers the integration of Tauri 2.0 native plugins that enhance the mobile user experience with platform-native features. These plugins provide haptic feedback, native notifications, and system dialogs while maintaining graceful degradation for web browsers.

### ✅ Benefits of Native Integration

- **Enhanced UX**: Tactile feedback makes interactions feel more responsive and native
- **Platform Consistency**: Native dialogs and notifications match OS design patterns
- **Accessibility**: Haptics provide additional sensory feedback for users
- **Graceful Degradation**: Automatically falls back to web APIs when not in Tauri environment
- **Type Safety**: Fully typed composable API with error handling

### 📦 Plugins Installed

| Plugin | Purpose | Status |
|--------|---------|--------|
| **Haptics** | Tactile feedback for touch interactions | ✅ Implemented |
| **Notification** | Native system notifications | ✅ Implemented |
| **Dialog** | Native dialogs (confirm, alert, file) | ✅ Implemented |
| **Biometric** | Fingerprint/Face ID authentication | ⏳ Ready (not yet used) |

---

## Installed Plugins

### 🎯 Haptics Plugin

**Purpose:** Provides tactile feedback for user interactions on mobile devices

**NPM Package:** `@tauri-apps/plugin-haptics@^2.3.0`  
**Rust Dependency:** `tauri-plugin-haptics = "2.0.0-rc.18"`

**Configuration:**
- **Cargo.toml:** [`src-tauri/Cargo.toml:31`](../src-tauri/Cargo.toml)
- **Capabilities:** [`src-tauri/capabilities/mobile.json:44`](../src-tauri/capabilities/mobile.json)
- **Initialization:** [`src-tauri/src/lib.rs:19`](../src-tauri/src/lib.rs)

**Haptic Types:**
- `impact` - Physical impact feedback (light/medium/heavy)
- `notification` - System notification feedback (success/warning/error)
- `selection` - Selection change feedback

---

### 🔔 Notification Plugin

**Purpose:** Displays native system notifications with permission handling

**NPM Package:** `@tauri-apps/plugin-notification@^2.3.1`  
**Rust Dependency:** `tauri-plugin-notification = "2.0.0-rc.18"`

**Configuration:**
- **Cargo.toml:** [`src-tauri/Cargo.toml:33`](../src-tauri/Cargo.toml)
- **Capabilities:** [`src-tauri/capabilities/mobile.json:46`](../src-tauri/capabilities/mobile.json)
- **Initialization:** [`src-tauri/src/lib.rs:21`](../src-tauri/src/lib.rs)

**Features:**
- Automatic permission requests
- Fallback to browser Notification API
- Support for title and body text

---

### 💬 Dialog Plugin

**Purpose:** Shows native system dialogs for confirmations and file operations

**NPM Package:** `@tauri-apps/plugin-dialog@^2.4.0`  
**Rust Dependency:** `tauri-plugin-dialog = "2.0.0-rc.18"`

**Configuration:**
- **Cargo.toml:** [`src-tauri/Cargo.toml:27`](../src-tauri/Cargo.toml)
- **Capabilities:** [`src-tauri/capabilities/mobile.json:14-18,47`](../src-tauri/capabilities/mobile.json)
- **Initialization:** [`src-tauri/src/lib.rs:15`](../src-tauri/src/lib.rs)

**Dialog Types:**
- Message dialogs (info/warning/error)
- Confirmation dialogs (yes/no)
- File open/save dialogs

---

### 🔐 Biometric Plugin (Ready)

**Purpose:** Enables fingerprint and Face ID authentication

**NPM Package:** Not yet imported (available when needed)  
**Rust Dependency:** `tauri-plugin-biometric = "2.0.0-rc.18"`

**Configuration:**
- **Cargo.toml:** [`src-tauri/Cargo.toml:32`](../src-tauri/Cargo.toml)
- **Capabilities:** [`src-tauri/capabilities/mobile.json:45`](../src-tauri/capabilities/mobile.json)
- **Initialization:** [`src-tauri/src/lib.rs:20`](../src-tauri/src/lib.rs)

**Status:** ⏳ Installed and configured, awaiting frontend implementation

---

## Composable API

### 📍 Location: [`src/composables/useTauriPlugins.js`](../src/composables/useTauriPlugins.js)

The `useTauriPlugins` composable provides a unified API for all Tauri plugins with automatic environment detection and graceful degradation.

### Available Functions

#### `triggerHaptic(type, intensity)`

Triggers haptic feedback on supported devices.

**Parameters:**
- `type` (string): `'impact'` | `'notification'` | `'selection'`
- `intensity` (string, optional): `'light'` | `'medium'` | `'heavy'` (for impact type)

**Returns:** `Promise<void>`

**Example:**
```javascript
// Light tap for selections
await triggerHaptic('selection')

// Medium impact for button presses
await triggerHaptic('impact', 'medium')

// Heavy impact for destructive actions
await triggerHaptic('impact', 'heavy')

// Success notification
await triggerHaptic('notification', 'success')
```

---

#### `showNotification(title, body)`

Displays a native system notification.

**Parameters:**
- `title` (string): Notification title
- `body` (string): Notification body text

**Returns:** `Promise<void>`

**Example:**
```javascript
await showNotification(
  'Purchase Successful',
  'You now have 25 credits'
)
```

---

#### `showDialog(type, title, message)`

Shows a native message dialog.

**Parameters:**
- `type` (string): `'info'` | `'warning'` | `'error'`
- `title` (string): Dialog title
- `message` (string): Dialog message

**Returns:** `Promise<void>`

**Example:**
```javascript
await showDialog(
  'error',
  'Upload Failed',
  'The image file is too large. Please select a smaller file.'
)
```

---

#### `showConfirmDialog(title, message)`

Shows a native confirmation dialog with OK/Cancel buttons.

**Parameters:**
- `title` (string): Dialog title
- `message` (string): Dialog message

**Returns:** `Promise<boolean>` - `true` if user confirmed, `false` if canceled

**Example:**
```javascript
const confirmed = await showConfirmDialog(
  'Delete Image',
  'Are you sure you want to delete this image? This action cannot be undone.'
)

if (confirmed) {
  // Proceed with deletion
}
```

---

#### `showOpenDialog(options)`

Shows a native file picker dialog.

**Parameters:**
- `options` (object):
  - `multiple` (boolean): Allow multiple file selection
  - `filters` (array): File type filters

**Returns:** `Promise<string|string[]|null>` - Selected file path(s) or `null` if canceled

**Example:**
```javascript
const filePath = await showOpenDialog({
  multiple: false,
  filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }]
})
```

---

#### `showSaveDialog(options)`

Shows a native file save dialog.

**Parameters:**
- `options` (object):
  - `defaultPath` (string): Default file name/path
  - `filters` (array): File type filters

**Returns:** `Promise<string|null>` - Selected save path or `null` if canceled

**Example:**
```javascript
const savePath = await showSaveDialog({
  defaultPath: 'transformed-outfit.png',
  filters: [{ name: 'PNG Image', extensions: ['png'] }]
})
```

---

### 🎨 Graceful Degradation

The composable automatically detects the environment and provides fallbacks:

| Feature | Tauri (Mobile/Desktop) | Web Browser |
|---------|----------------------|-------------|
| Haptics | Native haptic feedback | Console log (no-op) |
| Notifications | Native system notifications | Browser Notification API (with permission) |
| Dialogs | Native system dialogs | `alert()` / `confirm()` |
| File Dialogs | Native file pickers | Returns `null` (not available) |

---

## Implementation Details

### 🧭 MobileBottomNav Component

**Location:** [`src/components/MobileBottomNav.vue`](../src/components/MobileBottomNav.vue)

**Haptic Integration Points:**

| Action | Haptic Type | Line | Description |
|--------|-------------|------|-------------|
| Tab click | `selection` | 122 | Subtle feedback when switching tabs |

**Implementation:**
```vue
<script setup>
import { useTauriPlugins } from '@/composables/useTauriPlugins'

const { triggerHaptic } = useTauriPlugins()

const handleTabClick = async () => {
  await triggerHaptic('selection')
}
</script>

<template>
  <router-link @click="handleTabClick">
    <!-- Tab content -->
  </router-link>
</template>
```

---

### 📄 ProfileBottomSheet Component

**Location:** [`src/components/ProfileBottomSheet.vue`](../src/components/ProfileBottomSheet.vue)

**Haptic Integration Points:**

| Action | Haptic Type | Intensity | Line | Description |
|--------|-------------|-----------|------|-------------|
| Sheet open | `impact` | `medium` | 286 | Opening the bottom sheet |
| Sheet close | `impact` | `medium` | 226 | Closing the bottom sheet |
| Drag start | `impact` | `light` | 236 | Starting to drag the sheet |
| Snap back | `impact` | `light` | 269 | Sheet snaps back after small drag |
| Purchase credits | `impact` | `medium` | 203 | Tapping purchase credits button |
| Settings | `impact` | `light` | 209 | Tapping settings button |
| Theme toggle | `selection` | - | 215 | Changing theme preference |
| Sign out | `impact` | `heavy` | 220 | Destructive sign-out action |

**Implementation Example:**
```vue
<script setup>
import { useTauriPlugins } from '@/composables/useTauriPlugins'

const { triggerHaptic } = useTauriPlugins()

const handleSignOut = () => {
  // Heavy haptic for destructive action
  triggerHaptic('impact', 'heavy')
  emit('sign-out')
  closeSheet()
}

const handleThemeToggle = () => {
  // Selection haptic for toggle
  triggerHaptic('selection')
  emit('theme-toggle')
}
</script>
```

---

### 💳 PurchaseCredits Component

**Location:** [`src/components/credits/PurchaseCredits.vue`](../src/components/credits/PurchaseCredits.vue)

**Native Plugin Integration:**

| Action | Plugin | Type | Line | Description |
|--------|--------|------|------|-------------|
| Package selection | Haptics | `selection` | 274 | Selecting a credit package |
| Purchase click | Haptics | `impact` (medium) | 301 | Primary purchase action |
| Confirmation dialog | Dialog | `confirm` | 289-292 | Native confirm before purchase |
| User cancels | Haptics | `impact` (light) | 296 | Feedback when canceling |
| Purchase success | Haptics | `notification` (success) | 320 | Success feedback |
| Success notification | Notification | - | 323-326 | Native notification on success |
| Purchase error | Haptics | `notification` (error) | 331, 345 | Error feedback |

**Implementation Flow:**
```vue
<script setup>
import { useTauriPlugins } from '@/composables/useTauriPlugins'

const { triggerHaptic, showConfirmDialog, showNotification } = useTauriPlugins()

const handlePurchase = async () => {
  // Step 1: Show native confirmation
  const confirmed = await showConfirmDialog(
    'Confirm Purchase',
    `Purchase ${selectedPackage.value.credits} credits for $${selectedPackage.value.price}?`
  )
  
  // Step 2: Handle cancellation
  if (!confirmed) {
    triggerHaptic('impact', 'light')
    return
  }
  
  // Step 3: Provide feedback for primary action
  triggerHaptic('impact', 'medium')
  
  try {
    // Process purchase...
    const result = await creditStore.addCredits(...)
    
    if (result.success) {
      // Step 4: Success feedback
      triggerHaptic('notification', 'success')
      await showNotification(
        'Purchase Successful',
        `You now have ${credits.value} credits`
      )
    }
  } catch (err) {
    // Step 5: Error feedback
    triggerHaptic('notification', 'error')
  }
}
</script>
```

---

### 🔐 AuthService

**Location:** [`src/services/authService.js`](../src/services/authService.js)

**Native Plugin Integration:**

| Method | Haptic Type | Notification | Lines | Description |
|--------|-------------|--------------|-------|-------------|
| `signUp()` | `notification` (success/error) | ✅ | 106-120 | Account creation feedback |
| `signIn()` | `notification` (success/error) | ✅ | 147-160 | Sign-in feedback |
| `signOut()` | `notification` (success/error) | ✅ | 181-190 | Sign-out feedback |
| `resetPassword()` | `notification` (success/error) | ✅ | 296-309 | Password reset feedback |

**Lazy Loading Pattern:**
The service uses dynamic imports to avoid errors in SSR/web environments:

```javascript
// Lazy-load Tauri plugins
async function getPlugins() {
  if (pluginsCache) return pluginsCache
  
  try {
    const { useTauriPlugins } = await import('@/composables/useTauriPlugins')
    pluginsCache = useTauriPlugins()
    return pluginsCache
  } catch (error) {
    // Fallback for web environment
    return {
      triggerHaptic: () => {},
      showNotification: () => Promise.resolve()
    }
  }
}

// Use in auth methods
const plugins = await getPlugins()
plugins.triggerHaptic('notification', 'success')
await plugins.showNotification('Welcome!', 'Sign in successful')
```

---

## Usage Examples

### Example 1: Adding Haptic Feedback to a Button

```vue
<template>
  <button @click="handleClick">
    Submit
  </button>
</template>

<script setup>
import { useTauriPlugins } from '@/composables/useTauriPlugins'

const { triggerHaptic } = useTauriPlugins()

const handleClick = async () => {
  // Trigger medium impact for button press
  await triggerHaptic('impact', 'medium')
  
  // Perform action...
}
</script>
```

---

### Example 2: Confirmation Dialog with Haptics

```vue
<script setup>
import { useTauriPlugins } from '@/composables/useTauriPlugins'

const { triggerHaptic, showConfirmDialog } = useTauriPlugins()

const handleDelete = async () => {
  // Show confirmation dialog
  const confirmed = await showConfirmDialog(
    'Delete Item',
    'Are you sure you want to delete this item?'
  )
  
  if (confirmed) {
    // Heavy haptic for destructive action
    await triggerHaptic('impact', 'heavy')
    
    // Perform deletion...
    await deleteItem()
    
    // Success feedback
    await triggerHaptic('notification', 'success')
  } else {
    // Light feedback for cancel
    await triggerHaptic('impact', 'light')
  }
}
</script>
```

---

### Example 3: Success Notification with Haptics

```vue
<script setup>
import { useTauriPlugins } from '@/composables/useTauriPlugins'

const { triggerHaptic, showNotification } = useTauriPlugins()

const handleSave = async () => {
  try {
    await saveData()
    
    // Success haptic + notification
    await triggerHaptic('notification', 'success')
    await showNotification(
      'Saved Successfully',
      'Your changes have been saved'
    )
  } catch (error) {
    // Error haptic
    await triggerHaptic('notification', 'error')
    console.error('Save failed:', error)
  }
}
</script>
```

---

### Example 4: Proper Error Handling

```vue
<script setup>
import { useTauriPlugins } from '@/composables/useTauriPlugins'

const { triggerHaptic, showDialog } = useTauriPlugins()

const handleSubmit = async () => {
  try {
    await triggerHaptic('impact', 'medium')
    
    const result = await submitForm()
    
    if (!result.success) {
      // Show error dialog with haptic feedback
      await triggerHaptic('notification', 'error')
      await showDialog(
        'error',
        'Submission Failed',
        result.error || 'An unexpected error occurred'
      )
      return
    }
    
    // Success path
    await triggerHaptic('notification', 'success')
    await showNotification('Success', 'Form submitted successfully')
    
  } catch (error) {
    // Handle exceptions
    await triggerHaptic('notification', 'error')
    await showDialog(
      'error',
      'Network Error',
      'Please check your connection and try again'
    )
  }
}
</script>
```

---

## Testing

### 📱 Testing on Physical Devices

**Prerequisites:**
- Android device with USB debugging enabled
- Or iOS device with developer mode enabled
- Follow setup guides in project root:
  - [`ANDROID_SETUP_INSTRUCTIONS.md`](../ANDROID_SETUP_INSTRUCTIONS.md)
  - [`RUN_ON_ANDROID_PHONE.md`](../RUN_ON_ANDROID_PHONE.md)

**Running on Android:**
```bash
# Connect device via USB
adb devices

# Run development build
npm run tauri:android
```

**Running on iOS:**
```bash
# Connect device
# Open Xcode project
npm run tauri:ios
```

---

### ✅ What to Test

| Feature | Test Actions | Expected Behavior |
|---------|--------------|-------------------|
| **Tab Navigation** | Tap bottom nav tabs | Subtle selection haptic on each tap |
| **Profile Sheet** | Open/close sheet | Medium impact on open/close |
| **Drag to Dismiss** | Drag sheet handle down | Light haptic on start, medium on close |
| **Theme Toggle** | Toggle theme in profile | Selection haptic feedback |
| **Purchase Flow** | Select package, tap purchase | Selection → Confirmation dialog → Success notification |
| **Sign Out** | Tap sign out | Heavy impact + confirmation dialog + notification |
| **Authentication** | Sign in/up | Success notification after completion |

---

### 🔍 Debugging Tips

**Check Tauri Environment:**
```javascript
import { useTauriPlugins } from '@/composables/useTauriPlugins'

const { isTauri } = useTauriPlugins()
console.log('Running in Tauri:', isTauri.value)
```

**Monitor Plugin Calls:**
All plugin functions include console logs when not in Tauri environment:
```
[TauriPlugins] Haptic feedback not available (web mode)
[TauriPlugins] Notification not available, using browser fallback
```

**Android LogCat:**
```bash
# Filter for app logs
adb logcat | grep SwitchFit
```

---

### ⚠️ Known Limitations

| Limitation | Platform | Workaround |
|------------|----------|------------|
| No haptics in web browser | Web | Gracefully degrades to no-op |
| Notification permissions | iOS | Must be granted on first use |
| File dialogs unavailable | Web | Returns `null`, handle gracefully |
| Haptic intensity varies | Android/iOS | Use semantic types (selection/impact) |

---

## Future Enhancements

### 🔐 Biometric Authentication

**Status:** Plugin installed, awaiting implementation

**Planned Use Cases:**
- Secure sign-in without password
- Confirm sensitive actions (purchases, deletions)
- Lock/unlock app content

**Implementation Preview:**
```javascript
import { useTauriPlugins } from '@/composables/useTauriPlugins'

const authenticateWithBiometric = async () => {
  try {
    const { biometric } = await import('@tauri-apps/plugin-biometric')
    
    const result = await biometric.authenticate({
      reason: 'Confirm your identity to proceed'
    })
    
    if (result.authenticated) {
      // User authenticated successfully
      await triggerHaptic('notification', 'success')
      return true
    }
  } catch (error) {
    console.error('Biometric auth failed:', error)
    return false
  }
}
```

---

### 💰 In-App Purchases

**Status:** Not yet implemented

**Potential Plugin:** `tauri-plugin-store` or custom Stripe integration

**Use Cases:**
- Purchase credit packages
- Subscription management
- Premium features unlock

---

### 📲 Additional Native Features

**Potential Future Plugins:**

| Plugin | Purpose | Priority |
|--------|---------|----------|
| **Camera** | Direct camera access for photo capture | 🔴 High |
| **Share** | Native share sheet | 🟡 Medium |
| **Clipboard** | Advanced clipboard operations | 🟢 Low |
| **Permissions** | Fine-grained permission management | 🟡 Medium |
| **App Update** | In-app update notifications | 🟢 Low |

---

## 📚 Additional Resources

- [Tauri Plugin Guide](https://v2.tauri.app/plugin/)
- [Mobile Development Guide](https://v2.tauri.app/start/prerequisites/#mobile)
- [Platform-Specific Setup](../TAURI_SETUP_GUIDE.md)
- [Mobile Auth Implementation](./mobile-auth-implementation-summary.md)

---

**Last Updated:** Phase 4 - Documentation  
**Maintained By:** SwitchFit Studio Development Team