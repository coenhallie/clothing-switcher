# Tauri Webview Rendering Characteristics

## Executive Summary

This document provides comprehensive information about webview rendering in Tauri mobile applications, focusing on typography and font display characteristics across Android and iOS platforms. Understanding these differences is critical for building consistent cross-platform applications.

## Webview Engines Used by Tauri

### Core Library: Wry

Tauri uses [`wry`](https://github.com/tauri-apps/wry) as its cross-platform WebView library. Wry provides a unified Rust API that wraps platform-native webview components.

### Android: System WebView

**Engine:** Android WebView (Chromium-based)

- **Implementation:** Native Android WebView component
- **Based on:** Chromium rendering engine (same as Chrome)
- **Version:** Depends on the device's installed WebView version
- **Updates:** Through Google Play Store (independent of OS updates on Android 5.0+)
- **Configuration:** Accessed via `android_setup()` function in Rust

**Key Characteristics:**
- Uses the system's installed WebView component
- Not a bundled Chromium instance (unlike Electron)
- Rendering can vary based on device's WebView version
- Shares rendering characteristics with Chrome mobile but may have slight differences

**Version Compatibility:**
- Supported on Android 5.0 (API level 21) and higher
- Modern devices use updated Chromium-based WebView
- Rendering engine updates independently of Tauri app

### iOS: WKWebView

**Engine:** WKWebView (WebKit)

- **Implementation:** Apple's modern WebKit-based webview
- **Based on:** WebKit rendering engine (same as Safari)
- **Version:** Tied to iOS version
- **Updates:** Through iOS system updates only
- **Configuration:** Initialized through Swift bindings

**Key Characteristics:**
- Native iOS component, same engine as Safari
- Rendering behavior identical to Mobile Safari
- Version locked to iOS version (cannot be independently updated)
- Better performance and security than legacy UIWebView

**Version Compatibility:**
- iOS 8.0+ (WKWebView introduced in iOS 8)
- Tauri requires iOS 13.0 or higher for mobile support
- Rendering improvements come with iOS updates

## Font Rendering Differences

### iOS WKWebView Font Rendering Issues

#### 1. **Font Size Appears Smaller**

**Issue:** Text in WKWebView commonly renders smaller than expected compared to UIWebView or standard HTML rendering.

**Root Causes:**
- Default text size adjustment in WKWebView
- Viewport scaling behavior
- System font handling differences

**Solution:**
```css
body {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}
```

**Alternative Solution (iOS 14+):**
```swift
// Set pageZoom property to adjust overall scaling
webView.pageZoom = 1.0 // or higher to increase size
```

#### 2. **Font Smoothing/Antialiasing**

**Default Behavior:**
- WKWebView uses subpixel antialiasing by default on Retina displays
- Font smoothing can differ from Safari in some contexts

**CSS Control:**
```css
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

**Options:**
- `antialiased` - Smooth on pixel level (recommended for dark backgrounds)
- `subpixel-antialiased` - Smooth on subpixel level (default, better for light backgrounds)
- `auto` - Let the browser decide

**Note:** macOS-specific; may not have visible effect on iOS

#### 3. **System Font Loading**

**Behavior:**
- WKWebView has full access to system fonts (San Francisco on iOS)
- Font family fallback works differently than in standard browsers

**Recommended Font Stack:**
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
             "Helvetica Neue", Arial, sans-serif;
```

### Android WebView Font Rendering Issues

#### 1. **System Font Size Scaling**

**Issue:** Android WebView automatically respects system accessibility font size settings.

**Behavior:**
- User changes to Settings → Accessibility → Font Size affect WebView
- `textZoom` property controls scaling (85-130% typical range)
- Can break fixed layouts if not handled

**Disable System Font Scaling:**
```java
// In Android/Kotlin (not directly accessible in Tauri)
WebSettings settings = webView.getSettings();
settings.setTextZoom(100); // Force 100% regardless of system settings
```

**CSS Alternative:**
```css
html {
  /* Prevent font boosting */
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  max-height: 999999px; /* Prevents font boosting algorithm */
}
```

#### 2. **Font Rendering Quality**

**Default Behavior:**
- Android WebView uses standard Chromium font rendering
- Antialiasing quality depends on device and Android version
- Generally consistent with Chrome mobile

**CSS Optimizations:**
```css
body {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  font-smoothing: antialiased;
}
```

#### 3. **Pixel Density (DPI) Rendering**

**Issue:** Different devices have vastly different pixel densities (1x to 4x).

**Viewport Configuration:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, 
      maximum-scale=1.0, user-scalable=no">
```

**CSS Considerations:**
```css
/* Use rem/em for scalable text */
body {
  font-size: 16px; /* Base size */
}

h1 {
  font-size: 2rem; /* Scales with base */
}

/* Avoid fixed pixel values for fonts */
```

## Platform-Specific Rendering Considerations

### iOS WKWebView vs Safari Mobile

**Similarities:**
- Same WebKit rendering engine
- Identical CSS support
- Same JavaScript engine (JavaScriptCore)

**Differences:**
- WKWebView may have different default font sizes
- Some Safari-specific features not available in WKWebView
- Debugging requires additional setup (Safari Web Inspector)

**Known Issues:**
1. **Font Size Discrepancy:** Default text renders smaller than Safari
2. **Viewport Handling:** May require explicit viewport meta tag
3. **Text Selection:** Different behavior in some contexts

### Android WebView vs Chrome Mobile

**Similarities:**
- Same Chromium rendering engine (on modern devices)
- Nearly identical CSS/JavaScript support
- Similar performance characteristics

**Differences:**
- WebView may lag behind Chrome in version
- Some Chrome-specific APIs not available
- Default settings differ (e.g., JavaScript enabled/disabled)

**Known Issues:**
1. **System Font Scaling:** Respects accessibility settings by default
2. **Version Fragmentation:** Older devices may have outdated WebView
3. **Border Radius Aliasing:** Visual artifacts on some devices

## Tauri Configuration for Typography

### User Agent Configuration

**Location:** `src-tauri/tauri.conf.json`

```json
{
  "tauri": {
    "windows": [
      {
        "label": "main",
        "userAgent": "MyApp/1.0 Tauri/2.0"
      }
    ]
  }
}
```

**Note:** Custom user agent only applies to main window, not child webviews (known issue #9492)

**Current Limitation:** User agent override replaces entire UA string. To preserve platform information, construct UA string manually:
```javascript
// Not currently possible in config - pending feature request #8247
// Desired: "Mozilla/5.0 (...) Tauri/2.0"
```

### WebView-Specific Configuration

**Available in tauri.conf.json:**

```json
{
  "tauri": {
    "windows": [
      {
        "label": "main",
        "url": "/",
        "width": 800,
        "height": 600,
        "devtools": true,           // Enable dev tools
        "incognito": false,          // Incognito mode
        "javascriptDisabled": false, // Enable/disable JS
        "userAgent": "Custom UA",    // Custom user agent
        "focus": true,               // Auto-focus on creation
        "fullscreen": false          // Fullscreen mode
      }
    ]
  }
}
```

**Platform-Specific Options:**

```json
{
  "tauri": {
    "windows": [
      {
        "label": "main",
        // iOS-specific
        "hiddenTitle": true,              // Hide title bar (macOS/iOS)
        "disableInputAccessoryView": true, // Hide keyboard accessory (iOS)
        
        // Windows-specific  
        "dragDropEnabled": true,           // Enable drag/drop
        "scrollbarStyle": "default"        // or "fluentOverlay"
      }
    ]
  }
}
```

### Wry Feature Flags

**Available features in Cargo.toml:**

```toml
[dependencies]
wry = { version = "0.x", features = [
  "os-webview",    # Default - native webview (required)
  "protocol",      # Custom URL schemes
  "drag-drop",     # Drag and drop support
  "devtools",      # Enable devtools (macOS requires private APIs)
  "transparent",   # Transparent backgrounds (macOS requires private APIs)
  "fullscreen",    # Fullscreen media (macOS requires private APIs)
  "tracing"        # Debug tracing
]}
```

**macOS/iOS Warning:** Features marked "requires private APIs" (`devtools`, `transparent`, `fullscreen`) should not be enabled in App Store builds.

## CSS Normalizations for Webview Consistency

### Essential Reset for Mobile Webviews

```css
/* Prevent font size adjustments */
html {
  -webkit-text-size-adjust: 100%;
  -moz-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

/* Optimize font rendering */
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* Consistent box model */
* {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

/* Prevent tap highlight color */
* {
  -webkit-tap-highlight-color: transparent;
}

/* Consistent font metrics */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
               "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
}
```

### Viewport Meta Tag

**Essential for mobile webviews:**

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, 
      maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
```

**Parameters:**
- `width=device-width` - Match device width
- `initial-scale=1.0` - No initial zoom
- `maximum-scale=1.0` - Prevent pinch zoom
- `user-scalable=no` - Disable user scaling
- `viewport-fit=cover` - Handle safe areas (notches)

### Font Loading Strategies

#### 1. System Fonts (Recommended)

**Advantages:**
- No download time
- Guaranteed availability
- OS-native appearance
- Better accessibility

**Implementation:**
```css
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
               "Helvetica Neue", Arial, sans-serif;
}
```

#### 2. Web Fonts

**Considerations:**
- Increases initial load time
- May cause FOUT (Flash of Unstyled Text)
- Network dependency

**Best Practice:**
```css
/* Use font-display for better UX */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap; /* or 'fallback' */
  font-weight: 400;
  font-style: normal;
}
```

**Font Display Options:**
- `auto` - Browser default
- `swap` - Use fallback immediately, swap when loaded
- `block` - Hide text briefly, then show custom font
- `fallback` - Very brief hide, swap if loaded quickly
- `optional` - Browser decides based on connection speed

## Testing Approaches

### Device Testing Checklist

**iOS Testing:**
- [ ] Test on physical iPhone (multiple screen sizes)
- [ ] Test on iPad
- [ ] Test on iOS Simulator (various iOS versions)
- [ ] Verify font sizes at different iOS text size settings
- [ ] Check font rendering in light and dark modes
- [ ] Test with Dynamic Type enabled (Settings → Accessibility → Display & Text Size)

**Android Testing:**
- [ ] Test on physical Android device (various manufacturers)
- [ ] Test on Android Emulator (various API levels)
- [ ] Verify with different font sizes (Settings → Accessibility → Font Size)
- [ ] Test on different pixel densities (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- [ ] Check various WebView versions
- [ ] Test with different Android versions (especially Android 5-14)

### Debugging Tools

**iOS:**
```bash
# Enable Safari Web Inspector for WKWebView
# 1. Enable on device: Settings → Safari → Advanced → Web Inspector
# 2. Connect device via USB
# 3. Open Safari on Mac → Develop → [Device Name] → [App Name]
```

**Android:**
```bash
# Enable WebView debugging
# Add to tauri.conf.json:
{
  "tauri": {
    "windows": [
      {
        "devtools": true
      }
    ]
  }
}

# Access via Chrome DevTools:
# chrome://inspect in Chrome browser
```

### Font Size Testing Script

```javascript
// Add to your app for testing
function testFontSizes() {
  const elements = document.querySelectorAll('h1, h2, h3, p, span');
  elements.forEach(el => {
    const computed = window.getComputedStyle(el);
    console.log(`${el.tagName}: ${computed.fontSize} (${computed.fontFamily})`);
  });
}

// Check viewport
function checkViewport() {
  console.log({
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    userAgent: navigator.userAgent
  });
}
```

## Known Issues and Workarounds

### Issue 1: iOS Text Appears Too Small

**Symptom:** Fonts render smaller in WKWebView than expected

**Workaround:**
```css
html {
  -webkit-text-size-adjust: 100%;
}

/* Or increase base font size */
body {
  font-size: 17px; /* iOS default is 16px but may render smaller */
}
```

### Issue 2: Android Font Boosting

**Symptom:** Android increases font sizes unexpectedly in certain layouts

**Workaround:**
```css
html {
  max-height: 999999px; /* Prevents font boosting algorithm */
  -webkit-text-size-adjust: 100%;
}
```

### Issue 3: Pixel Density Inconsistencies

**Symptom:** UI elements sized with `px` appear different sizes on different devices

**Workaround:**
```css
/* Use rem/em instead of px for scalable elements */
:root {
  font-size: 16px; /* Base size */
}

.text {
  font-size: 1rem;    /* 16px */
  padding: 0.5rem;    /* 8px */
  margin: 1.25rem;    /* 20px */
}
```

### Issue 4: Custom User Agent Not Applied to Child Webviews

**Symptom:** User agent in config only applies to main window

**Workaround:** Currently no workaround. Track issue #9492.

### Issue 5: Font Weight Rendering Differences

**Symptom:** Font weights render differently between platforms

**Workaround:**
```css
/* Be explicit with font weights */
h1 {
  font-weight: 700; /* Use numeric values */
}

/* Avoid browser-dependent keywords when possible */
strong {
  font-weight: 600; /* Instead of 'bold' */
}
```

## Best Practices Summary

### 1. Typography Foundation

✅ **DO:**
- Use system font stacks for consistency
- Set base font size to 16px minimum
- Use relative units (rem/em) for scalability
- Include `-webkit-text-size-adjust: 100%`
- Test on physical devices, not just simulators

❌ **DON'T:**
- Use fixed pixel sizes for all text
- Ignore system accessibility settings
- Assume rendering is identical to desktop
- Skip cross-platform testing

### 2. Font Loading

✅ **DO:**
- Prefer system fonts for mobile apps
- Use `font-display: swap` for web fonts
- Preload critical fonts
- Provide fallback fonts

❌ **DON'T:**
- Load unnecessary font weights/styles
- Use large custom font files without optimization
- Block rendering waiting for fonts

### 3. Responsive Typography

✅ **DO:**
- Use viewport units where appropriate
- Implement fluid typography with clamp()
- Test all breakpoints
- Consider device pixel ratio

❌ **DON'T:**
- Hard-code font sizes for specific devices
- Ignore landscape orientation
- Use media queries solely for font sizing

### 4. Platform Optimization

✅ **DO:**
- Include platform-specific CSS when needed
- Test accessibility font scaling on both platforms
- Verify dark mode rendering
- Use appropriate CSS prefixes

❌ **DON'T:**
- Assume iOS and Android render identically
- Disable user font size preferences without reason
- Use browser-specific hacks excessively

## Testing Validation Checklist

### Typography Rendering Tests

- [ ] **Base Font Size:** Verify 16px renders consistently across platforms
- [ ] **Heading Hierarchy:** Check h1-h6 size progression
- [ ] **Font Weights:** Test 300, 400, 600, 700 weights
- [ ] **Line Height:** Verify readability at 1.5-1.6 line-height
- [ ] **Letter Spacing:** Check tracking on headings vs body text

### Platform-Specific Tests

- [ ] **iOS Dynamic Type:** Test with largest and smallest system text sizes
- [ ] **Android Font Scale:** Test with font size set to 85%, 100%, 130%
- [ ] **Dark Mode:** Verify font rendering in dark theme
- [ ] **Safe Areas:** Check text positioning near notches/islands
- [ ] **Orientation:** Test portrait and landscape modes

### Accessibility Tests

- [ ] **Contrast Ratios:** Verify WCAG AA compliance (4.5:1 minimum)
- [ ] **Touch Targets:** Ensure minimum 44×44pt for interactive text
- [ ] **Zoom Support:** Test pinch-to-zoom behavior (if enabled)
- [ ] **Screen Readers:** Verify text is accessible to VoiceOver/TalkBack

### Performance Tests

- [ ] **Font Load Time:** Measure time to first meaningful paint
- [ ] **FOUT/FOIT:** Check flash of unstyled/invisible text
- [ ] **Reflow:** Verify minimal layout shift when fonts load
- [ ] **Memory Usage:** Monitor font rendering impact on performance

## Version-Specific Information

### Tauri 2.0
- Mobile support (Android/iOS) officially stable
- Uses wry 0.24+
- Requires iOS 13.0+ and Android 5.0+ (API 21)

### WebView Versions

**iOS:**
- iOS 13: WebKit 608.x
- iOS 14: WebKit 610.x (added pageZoom)
- iOS 15: WebKit 615.x
- iOS 16: WebKit 616.x
- iOS 17: WebKit 618.x

**Android:**
- Android 5.0+: Chromium-based WebView (auto-updated via Play Store)
- Check device version: Settings → Apps → Android System WebView

## Additional Resources

### Official Documentation
- [Tauri v2 Configuration](https://v2.tauri.app/reference/config/)
- [Tauri WebView Versions](https://v2.tauri.app/reference/webview-versions/)
- [Wry GitHub Repository](https://github.com/tauri-apps/wry)

### Platform Documentation
- [WKWebView Documentation](https://developer.apple.com/documentation/webkit/wkwebview)
- [Android WebView Documentation](https://developer.android.com/reference/android/webkit/WebView)

### Related Issues
- [Tauri #7814](https://github.com/tauri-apps/tauri/issues/7814) - CSS pixel sizing differences
- [Tauri #8247](https://github.com/tauri-apps/tauri/issues/8247) - User agent enhancement request
- [Tauri #9492](https://github.com/tauri-apps/tauri/issues/9492) - Multi-webview user agent bug

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-05  
**Tauri Version:** 2.0  
**Author:** Research compilation for SwitchFit Studio mobile typography