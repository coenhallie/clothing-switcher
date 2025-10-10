# Automatic Logout Testing Guide

## Overview

This guide provides step-by-step instructions for testing the automatic logout functionality across different scenarios and platforms.

## Prerequisites

- Tauri app built and running
- Test user account with credentials
- Biometric authentication configured (for mobile tests)

## Test Scenarios

### 1. Basic Desktop Window Close

**Objective**: Verify logout triggers when closing the app normally

**Steps**:
1. Launch the application
2. Sign in with email/password
3. Verify you're authenticated (see user profile)
4. Close the app using the X button
5. Wait for app to close completely
6. Relaunch the app

**Expected Result**:
- ✅ Console shows: `🚪 [AppLifecycle] App closing - initiating logout...`
- ✅ Console shows: `✅ [AuthStore] All authentication data cleared successfully`
- ✅ On relaunch, console shows: `🔒 [App] Logout flag detected - enforcing re-authentication`
- ✅ User is presented with login screen
- ✅ No existing session restored

**Pass/Fail**: _______

---

### 2. System Quit (Desktop)

**Objective**: Verify logout triggers with system-level quit commands

**Steps**:
1. Launch the application
2. Sign in with email/password
3. Use system quit:
   - **macOS**: Cmd+Q or App Menu > Quit
   - **Windows**: Alt+F4 or File > Exit
   - **Linux**: Ctrl+Q or File > Quit
4. Relaunch the app

**Expected Result**:
- ✅ Logout process executes before app closes
- ✅ On relaunch, user must re-authenticate
- ✅ Logout flag is set and cleared after re-login

**Pass/Fail**: _______

---

### 3. Mobile App Backgrounding (iOS/Android)

**Objective**: Verify logout when app is sent to background

**Steps**:
1. Launch app on mobile device
2. Sign in with email/password
3. Press the Home button or use app switcher
4. Kill the app from app switcher
5. Relaunch the app

**Expected Result**:
- ✅ Console shows: `📱 [AppLifecycle] App backgrounded (mobile)`
- ✅ Logout process executes
- ✅ On relaunch, login screen shown
- ✅ If biometric enabled, biometric prompt appears

**Pass/Fail**: _______

---

### 4. Biometric Re-authentication (Mobile)

**Objective**: Verify biometric login works after automatic logout

**Setup**:
1. Enable biometric authentication in Settings
2. Close and reopen app to trigger logout

**Steps**:
1. Launch app (after logout)
2. Biometric prompt should appear automatically
3. Authenticate with fingerprint/face
4. Verify access granted

**Expected Result**:
- ✅ Biometric prompt shows on startup
- ✅ Successful auth restores session
- ✅ Console shows: `✅ [BiometricAuth] Biometric login successful - logout flag cleared`
- ✅ User gains immediate access
- ✅ No manual login required

**Pass/Fail**: _______

---

### 5. Biometric Cancellation (Mobile)

**Objective**: Verify fallback to manual login when biometric cancelled

**Steps**:
1. Launch app (after logout)
2. When biometric prompt appears, cancel it
3. Observe the result

**Expected Result**:
- ✅ Biometric prompt dismissed
- ✅ Manual login form shown
- ✅ User can sign in with email/password
- ✅ After manual login, logout flag cleared

**Pass/Fail**: _______

---

### 6. Session Expiration with Biometric

**Objective**: Verify biometric disabled when session expires

**Setup**:
1. Enable biometric authentication
2. Wait for Supabase session to expire (or manually expire in database)
3. Close and reopen app

**Steps**:
1. Launch app
2. Biometric prompt appears
3. Authenticate with biometric
4. Observe the result

**Expected Result**:
- ✅ Biometric authentication fails
- ✅ Console shows: `⚠️ [BiometricAuth] Session expired - biometric disabled`
- ✅ Manual login form shown
- ✅ Error message: "Session expired. Please sign in with email and password."
- ✅ Biometric disabled for that user

**Pass/Fail**: _______

---

### 7. Multiple Rapid Close/Open

**Objective**: Verify system handles rapid open/close cycles

**Steps**:
1. Launch app and sign in
2. Close app immediately
3. Reopen app
4. Close again
5. Reopen again
6. Sign in

**Expected Result**:
- ✅ Each close triggers logout
- ✅ Each open requires re-authentication
- ✅ No race conditions or errors
- ✅ Logout flag properly managed

**Pass/Fail**: _______

---

### 8. Web Environment Fallback

**Objective**: Verify logout behavior in browser (development mode)

**Steps**:
1. Run app in browser with `npm run dev`
2. Sign in with email/password
3. Close the browser tab
4. Reopen the tab to the app URL

**Expected Result**:
- ✅ `beforeunload` event fires
- ✅ Logout flag set in localStorage
- ✅ On reopen, user must re-authenticate
- ⚠️ Note: Browsers may restrict some localStorage operations during unload

**Pass/Fail**: _______

---

### 9. App Crash Recovery

**Objective**: Verify logout state persists after crash

**Setup**:
1. Sign in to the app
2. Force kill the app process (not graceful close)
   - **macOS/Linux**: `kill -9 <pid>`
   - **Windows**: Task Manager > End Task

**Steps**:
1. Force kill the app while signed in
2. Relaunch the app

**Expected Result**:
- ⚠️ Logout code may not execute during force kill
- ✅ However, logout flag from previous close should prevent auto-login
- ✅ User still required to re-authenticate
- ℹ️ This demonstrates defense-in-depth

**Pass/Fail**: _______

---

### 10. Logout Flag Persistence

**Objective**: Verify logout flag survives various scenarios

**Steps**:
1. Sign in to the app
2. Close the app normally
3. Before reopening, check localStorage:
   ```javascript
   localStorage.getItem('logout_on_close_flag') === 'true'
   ```
4. Reopen app
5. Sign in successfully
6. Check localStorage again

**Expected Result**:
- ✅ Flag is `'true'` after close
- ✅ Timestamp is set
- ✅ Flag is removed after successful re-authentication
- ✅ Timestamp is removed after successful re-authentication

**Pass/Fail**: _______

---

### 11. Data Clearing Verification

**Objective**: Verify all auth data is completely cleared

**Steps**:
1. Sign in to the app
2. Open DevTools Console (if available)
3. Check localStorage before logout:
   ```javascript
   Object.keys(localStorage).filter(k => k.includes('supabase'))
   ```
4. Close the app
5. Reopen and check console logs
6. Check localStorage again

**Expected Result**:
- ✅ Before close: Supabase auth tokens present in localStorage
- ✅ After close: All Supabase tokens removed
- ✅ Console shows: `🧹 [AuthStore] Clearing all authentication data...`
- ✅ Console shows each cleanup step (localStorage, sessionStorage, cookies)
- ✅ Store state reset to null

**Pass/Fail**: _______

---

### 12. Email/Password Re-authentication

**Objective**: Verify manual login works after auto-logout

**Steps**:
1. Close app while authenticated
2. Reopen app
3. Enter email and password
4. Submit login form

**Expected Result**:
- ✅ Login form accepts credentials
- ✅ Authentication succeeds
- ✅ Console shows: `✅ [AuthStore] Logout flag cleared on successful sign in`
- ✅ User gains access to app
- ✅ Credits loaded
- ✅ Profile displayed

**Pass/Fail**: _______

---

## Console Log Verification

During testing, monitor the console for these key log messages:

### On App Close:
```
🚪 [AppLifecycle] App closing - initiating logout...
🧹 [AuthStore] Clearing all authentication data...
✅ [AuthStore] All authentication data cleared successfully
✅ [AuthStore] Logout-on-close completed successfully
```

### On App Startup (After Logout):
```
🔒 [App] Logout flag detected - enforcing re-authentication
✅ [App] Auth data cleared - user must re-authenticate
🔒 [AppLifecycle] Logout flag detected - authentication required
```

### On Biometric Re-auth:
```
📱 [AppLifecycle] Attempting biometric re-authentication...
✅ [BiometricAuth] Biometric login successful - logout flag cleared
✅ [AppLifecycle] Biometric re-authentication successful
```

### On Manual Re-auth:
```
✅ [AuthStore] Logout flag cleared on successful sign in
```

## Testing Matrix

| Scenario | Desktop | Mobile | Web | Status |
|----------|---------|---------|-----|--------|
| Normal Close | ☐ | ☐ | ☐ | |
| System Quit | ☐ | N/A | N/A | |
| Backgrounding | N/A | ☐ | N/A | |
| Biometric Re-auth | N/A | ☐ | N/A | |
| Manual Re-auth | ☐ | ☐ | ☐ | |
| Session Expiry | ☐ | ☐ | ☐ | |
| Force Kill | ☐ | ☐ | ☐ | |
| Data Clearing | ☐ | ☐ | ☐ | |

## Known Issues and Limitations

1. **Force Kill**: May not always execute logout code, but logout flag from previous close provides protection
2. **Web Browser**: `beforeunload` is best-effort and may be restricted by browser
3. **iOS Background**: iOS may terminate apps without notification in low memory situations

## Debugging Tips

### Enable Verbose Logging
All logout-related functions include detailed console logs. Look for:
- 🚪 Logout events
- 🔒 Authentication requirements
- 📱 Biometric operations
- 🧹 Data cleaning operations

### Check Logout Flag Manually
```javascript
// In browser console or DevTools
localStorage.getItem('logout_on_close_flag')
localStorage.getItem('last_logout_timestamp')

// To manually clear if stuck
localStorage.removeItem('logout_on_close_flag')
localStorage.removeItem('last_logout_timestamp')
```

### Reset Everything
```javascript
// In browser console
window.clearAuthData()
```

## Success Criteria

✅ All test scenarios pass  
✅ No authentication data persists after close  
✅ Biometric authentication works seamlessly  
✅ Manual login works as fallback  
✅ No console errors during logout process  
✅ App handles edge cases gracefully  

## Test Report Template

```
Test Date: __________
Tester: __________
Platform: [ ] Desktop [ ] Mobile [ ] Web
OS/Version: __________

Summary:
- Tests Passed: ___/12
- Tests Failed: ___/12
- Critical Issues: ___

Notes:
_________________________________
_________________________________
_________________________________