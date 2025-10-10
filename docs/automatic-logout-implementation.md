# Automatic Logout on App Close Implementation

## Overview

This document describes the implementation of automatic logout functionality for the Tauri application. The system ensures users must re-authenticate every time they open the app, providing maximum security by clearing all authentication data on app closure.

## Architecture

### Components

1. **Tauri Backend (`src-tauri/src/lib.rs`)**
   - Window lifecycle event handlers
   - State management for logout tracking
   - Commands for frontend communication

2. **Auth Store (`src/stores/authStore.js`)**
   - Comprehensive logout mechanism
   - Persistent logout state management
   - Authentication flag handling

3. **App Lifecycle Composable (`src/composables/useAppLifecycle.js`)**
   - Event listener setup
   - Logout trigger on app close
   - Startup authentication check

4. **Biometric Auth Integration (`src/composables/useBiometricAuth.js`)**
   - Compatible with automatic logout
   - Clears logout flags on successful auth

5. **App Initialization (`src/App.vue`)**
   - Startup authentication checks
   - Logout flag enforcement

## How It Works

### App Closure Flow

1. **User closes the app** (window close button, system quit, etc.)
2. **Tauri backend intercepts** the close event via `on_window_event`
3. **Backend prevents immediate close** using `api.prevent_close()`
4. **Backend emits** `app-closing` event to frontend
5. **Frontend receives event** in `useAppLifecycle` composable
6. **`logoutOnClose()` executes**:
   - Signs out from Supabase (server-side session invalidation)
   - Clears all localStorage items
   - Clears all sessionStorage
   - Clears cookies
   - Resets store state
   - Sets `logout_on_close_flag` to `true`
   - Sets `last_logout_timestamp`
7. **Backend allows window to close** after 800ms delay

### App Startup Flow

1. **App launches**
2. **App.vue checks** for `logout_on_close_flag`
3. **If flag is set**:
   - Force clear all auth data
   - User must re-authenticate
4. **If flag is not set**:
   - Attempt normal session restoration
5. **useAppLifecycle initializes**:
   - Checks logout flag
   - Attempts biometric login if available
   - Falls back to manual login

### Re-authentication Flow

#### Email/Password Login
1. User enters credentials
2. `authStore.signIn()` called
3. On success:
   - Session established
   - `clearLogoutFlag()` called
   - User gains access

#### Biometric Login (Mobile)
1. Biometric prompt shown
2. User authenticates with fingerprint/face
3. `biometricLogin()` restores session
4. On success:
   - `clearLogoutFlag()` called
   - User gains access

## Security Features

### 1. Complete Data Clearing
- **Supabase sessions**: Server-side invalidation via `signOut({ scope: 'global' })`
- **localStorage**: All keys removed (including Supabase tokens)
- **sessionStorage**: Complete clear
- **Cookies**: All cleared with past expiration dates
- **Store state**: All auth-related state reset

### 2. Persistent Logout State
- Logout flag stored in localStorage
- Survives app crashes and forced terminations
- Timestamp tracking for audit purposes

### 3. Multiple Close Scenarios
- **Normal window close**: ✅ Handled
- **System quit**: ✅ Handled
- **Force quit**: ⚠️ Best effort (may not always execute)
- **App backgrounding (mobile)**: ✅ Handled via `tauri://blur`
- **Web beforeunload**: ✅ Best effort flag setting

### 4. Biometric Security
- Biometric auth clears logout flag only on success
- Session expiration disables biometric
- Requires email/password re-setup if session invalid

## Code Examples

### Logout on Close (Auth Store)
```javascript
const logoutOnClose = async () => {
  console.log('🚪 [AuthStore] Executing logout-on-close...');
  
  // Clear all auth data
  const result = await clearAllAuthData();
  
  if (result.success) {
    console.log('✅ [AuthStore] Logout-on-close completed successfully');
  } else {
    console.error('❌ [AuthStore] Logout-on-close failed:', result.error);
  }
  
  return result;
};
```

### Startup Check (App.vue)
```javascript
const logoutRequired = authStore.shouldRequireAuth();

if (logoutRequired) {
  console.log('🔒 [App] Logout flag detected - enforcing re-authentication');
  await authStore.clearAllAuthData()
  console.log('✅ [App] Auth data cleared - user must re-authenticate');
}
```

### Event Listener Setup (App Lifecycle)
```javascript
// Listen for custom app-closing event from Rust backend
unlistenAppClose = await listen('app-closing', async () => {
  console.log('🎧 [AppLifecycle] Received app-closing event from backend')
  await handleAppClose()
})
```

## Testing Scenarios

### ✅ Tested Scenarios

1. **Normal Window Close**
   - Click X button
   - File > Quit
   - Keyboard shortcuts (Cmd+Q, Alt+F4)

2. **Mobile Backgrounding**
   - Home button press
   - App switcher
   - System gestures

3. **Session Restoration**
   - With logout flag set
   - Without logout flag set
   - After biometric login
   - After email/password login

### ⚠️ Limitations

1. **Force Kill/Crash**
   - If app is force-killed, logout code may not execute
   - However, logout flag from previous close prevents auto-login
   - User still must re-authenticate

2. **Web Environment**
   - `beforeunload` is best-effort
   - Some browsers may restrict localStorage access during unload
   - Logout flag still set for next launch

## Configuration

### Tauri Commands
Located in `src-tauri/src/lib.rs`:
- `mark_logout_required`: Set logout flag
- `clear_logout_flag`: Clear logout flag
- `check_logout_required`: Check if logout required
- `handle_app_close`: Trigger close event

### LocalStorage Keys
- `logout_on_close_flag`: Set to `'true'` when logout required
- `last_logout_timestamp`: Unix timestamp of last logout
- `biometric_auth_enabled`: Biometric preference
- `biometric_user_id`: User ID for biometric auth

## Troubleshooting

### Issue: User stuck in logout loop
**Solution**: Clear localStorage manually
```javascript
window.clearAuthData()
```

### Issue: Biometric not working after logout
**Cause**: Session expired
**Solution**: Re-login with email/password, then re-enable biometric

### Issue: Logout not triggering on close
**Check**:
1. Tauri event listeners initialized
2. `useAppLifecycle` composable mounted
3. Console logs for event firing

## Performance Considerations

1. **Logout Delay**: 800ms to ensure cleanup completes
2. **Startup Impact**: Minimal - single localStorage check
3. **Memory Usage**: No persistent listeners after cleanup

## Future Enhancements

1. **Configurable Auto-Logout**
   - Allow users to opt-in/opt-out
   - Session timeout option

2. **Selective Data Persistence**
   - Remember non-sensitive preferences
   - Maintain theme settings

3. **Enhanced Crash Recovery**
   - Detect abnormal termination
   - Force logout on next start

4. **Audit Logging**
   - Track logout events
   - Monitor authentication patterns

## Compatibility

- **Tauri**: v2.x
- **Platforms**: Desktop (Windows, macOS, Linux), Mobile (iOS, Android)
- **Browsers** (web fallback): Chrome, Firefox, Safari, Edge
- **Biometric**: iOS Face ID/Touch ID, Android Fingerprint

## References

- [Tauri Window Events](https://tauri.app/v1/api/js/window#windowevent)
- [Supabase Auth](https://supabase.com/docs/reference/javascript/auth-signout)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)