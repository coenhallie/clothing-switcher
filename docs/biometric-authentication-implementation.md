# Biometric Authentication Implementation Guide

This document describes the integration of the Tauri biometric plugin for fingerprint and face recognition authentication on mobile devices.

## Overview

The biometric authentication feature allows users to authenticate using their device's native biometric sensors (Touch ID, Face ID on iOS, or fingerprint/face unlock on Android). This provides a secure and convenient way to verify user identity for sensitive operations.

## Architecture

### Rust Backend (Tauri)

**Dependencies Added:**
- [`tauri-plugin-biometric`](src-tauri/Cargo.toml): `2.0.0`

**Plugin Registration:**
The plugin is initialized in [`src-tauri/src/lib.rs`](../src-tauri/src/lib.rs) with conditional compilation for mobile only:
```rust
#[cfg(mobile)]
{
  builder = builder.plugin(tauri_plugin_biometric::init());
}
```

**Important:** The biometric plugin is mobile-only (`#[cfg(mobile)]`). It will not compile or function on desktop platforms.

**Permissions:**
Mobile capabilities configured in [`src-tauri/capabilities/mobile.json`](../src-tauri/capabilities/mobile.json):
```json
"biometric:allow-authenticate",
"biometric:allow-status"
```

### Frontend (Vue.js)

**Package:**
- `@tauri-apps/plugin-biometric`

**Composable:**
[`src/composables/useBiometric.js`](../src/composables/useBiometric.js) provides:
- `authenticateUser()` - Full control over authentication options
- `quickAuth()` - Simple authentication with custom reason
- `authenticateForAction()` - Context-specific authentication
- `isAuthenticating` - Loading state
- `lastError` - Error handling

**Test Component:**
[`src/components/BiometricTestButton.vue`](../src/components/BiometricTestButton.vue) demonstrates all authentication patterns

## Usage Examples

### Basic Authentication

```javascript
import { useBiometric } from '@/composables/useBiometric'

const { quickAuth } = useBiometric()

const handleLogin = async () => {
  const success = await quickAuth('Sign in to your account')
  if (success) {
    // Proceed with authentication
  }
}
```

### Action-Specific Authentication

```javascript
const { authenticateForAction } = useBiometric()

const handlePayment = async () => {
  const success = await authenticateForAction('authorize payment')
  if (success) {
    // Process payment
  }
}
```

### Advanced Options

```javascript
const { authenticateUser } = useBiometric()

const result = await authenticateUser('Authenticate to access secure data', {
  cancelTitle: 'Cancel',
  fallbackTitle: 'Use Password',
  allowDeviceCredential: true  // Allow PIN/password fallback
})
```

## Platform-Specific Behavior

### iOS
- **Face ID:** Requires user to look at device
- **Touch ID:** Requires fingerprint scan
- User can fallback to device passcode if enabled

### Android
- **Fingerprint:** Scanner authentication
- **Face Unlock:** Front camera authentication (device dependent)
- Supports PIN/pattern/password fallback

## Security Considerations

1. **Native Security:** Uses platform-native biometric APIs for maximum security
2. **Fallback Options:** Allows device credentials as fallback
3. **User Control:** Users can cancel authentication at any time
4. **Context Messages:** Clear messaging about why authentication is needed

## Testing

### Requirements
- Physical iOS or Android device
- Biometric authentication enabled on device
- Device enrolled with fingerprint/face data

### Test Component Location
The biometric test button appears on the HomeView when running on mobile devices. It provides:
- Quick Authentication test
- Secure Access test
- Payment Authorization test
- Custom Authentication test

### Testing Steps

1. Build and deploy to device:
   ```bash
   npm run tauri android dev
   # or
   npm run tauri ios dev
   ```

2. Navigate to the home screen on mobile

3. Scroll to the "Biometric Authentication Test" section

4. Try each test button:
   - Each will trigger the device's native biometric prompt
   - Successful authentication shows green status
   - Failed authentication shows red status

## Common Use Cases

### 1. Login Authentication
```javascript
const login = async () => {
  const authenticated = await quickAuth('Sign in to SwitchFit Studio')
  if (authenticated) {
    // Complete login flow
  }
}
```

### 2. Payment Authorization
```javascript
const processPayment = async (amount) => {
  const authorized = await authenticateForAction(`authorize payment of $${amount}`)
  if (authorized) {
    // Process payment
  }
}
```

### 3. Sensitive Data Access
```javascript
const viewSecureData = async () => {
  const granted = await authenticateForAction('view sensitive information')
  if (granted) {
    // Show secure data
  }
}
```

### 4. Settings Changes
```javascript
const updateSettings = async () => {
  const confirmed = await authenticateUser('Confirm security settings change', {
    allowDeviceCredential: true
  })
  if (confirmed) {
    // Apply settings
  }
}
```

## Error Handling

The composable provides error information through the `lastError` ref:

```javascript
const { authenticateUser, lastError } = useBiometric()

const result = await authenticateUser('Authenticate')
if (!result && lastError.value) {
  console.error('Authentication failed:', lastError.value)
  // Handle specific error cases
}
```

## Integration with Existing Features

The biometric authentication can be integrated with:
- User login/signup flows
- Credit purchases
- Gallery access
- Profile management
- Settings changes
- Any sensitive operations

## Future Enhancements

Potential improvements:
1. Check biometric availability before showing option
2. Store user preference for biometric authentication
3. Integrate with secure storage for sensitive data
4. Add biometric enrollment prompts for new users
5. Implement re-authentication timeout

## Resources

- [Tauri Biometric Plugin Documentation](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/biometric)
- [iOS Biometric Best Practices](https://developer.apple.com/design/human-interface-guidelines/authentication)
- [Android Biometric Guidelines](https://developer.android.com/training/sign-in/biometric-auth)

## Support

For issues or questions:
1. Check the test component for working examples
2. Review console logs for error details
3. Ensure device has biometric authentication enabled
4. Verify permissions are correctly configured in capabilities