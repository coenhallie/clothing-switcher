# Dual-Layout System Implementation

## Overview

This document describes the responsive dual-layout system implemented for the SwitchFit Studio Tauri application. The system automatically detects the deployment target (desktop vs mobile) and renders the appropriate layout, optimizing the UI for each platform.

## Architecture

### Platform Detection
**File:** [`src/composables/usePlatform.js`](src/composables/usePlatform.js)

The platform detection composable uses a two-tier detection strategy:
1. **Primary:** Tauri platform API detection (`android`, `ios` vs desktop platforms)
2. **Fallback:** Viewport width detection (< 768px = mobile)

```javascript
const { isMobile, isDesktop, isTouchDevice } = usePlatform();
```

### Layout Components

#### Desktop Layout
**File:** [`src/components/layouts/DesktopLayout.vue`](src/components/layouts/DesktopLayout.vue)

Features:
- Full header with horizontal navigation
- Hero container visible
- Desktop footer
- Traditional desktop spacing
- Original background decorations

#### Mobile Layout
**File:** [`src/components/layouts/MobileLayout.vue`](src/components/layouts/MobileLayout.vue)

Features:
- Compact header with logo only
- Bottom navigation bar
- Hero container hidden (removed to minimize scrolling)
- Mobile-optimized spacing
- Safe area inset support for iOS notch and Android gesture bars
- Dynamic viewport height (100dvh) support

### Bottom Navigation
**File:** [`src/components/MobileBottomNav.vue`](src/components/MobileBottomNav.vue)

Material Design compliant mobile navigation:
- Touch-friendly 48px minimum target size
- Active state indicators
- Dynamic items based on authentication state
- Safe area padding for iOS and Android
- Smooth transitions and haptic feedback ready

## Key Features

### 1. Automatic Layout Switching
The app automatically selects the correct layout based on:
- Tauri platform detection (Android/iOS = mobile)
- Viewport dimensions (< 768px = mobile)
- Both conditions are checked for reliability

### 2. Platform-Specific Optimizations

**Desktop:**
- Full hero container with workflow steps
- Horizontal top navigation
- Wide spacing for comfortable mouse interaction
- Full footer with links

**Mobile:**
- Hero container completely hidden to optimize viewport
- Bottom navigation for thumb-friendly access
- Condensed spacing
- Safe area insets respected
- Touch-optimized interaction targets

### 3. Feature Parity
All functionality is preserved across both layouts:
- Authentication flows
- Credit management
- Image upload and generation
- Gallery access (when authenticated)
- Settings
- Theme switching

### 4. Responsive Utilities
**File:** [`src/assets/styles/main.css`](src/assets/styles/main.css)

New utilities added:
- `.mobile-hidden` / `.desktop-hidden` - Visibility toggles
- `.safe-top/right/bottom/left` - Safe area inset support
- `.touch-target` - Minimum 48px touch targets
- `.no-select` - Prevent text selection on touch
- `.mobile-container` - Mobile-optimized padding

## Testing

### Desktop Testing
1. Run the development server: `npm run dev`
2. Open in browser at default viewport (> 768px)
3. Verify:
   - Desktop layout renders
   - Hero container is visible
   - Top navigation works
   - Footer is present

### Mobile Testing (Browser)
1. Run the development server: `npm run dev`
2. Open browser DevTools
3. Enable device emulation (< 768px width)
4. Verify:
   - Mobile layout renders
   - Hero container is hidden
   - Bottom navigation appears
   - Touch targets are adequate
   - Safe areas respected

### Mobile Testing (Android)
```bash
npm run tauri android dev
```
Verify:
- Tauri detects Android platform
- Mobile layout automatically loads
- Bottom navigation works
- Safe area insets handle system bars

### Mobile Testing (iOS)
```bash
npm run tauri ios dev
```
Verify:
- Tauri detects iOS platform
- Mobile layout automatically loads
- Safe area handles notch correctly
- Bottom navigation respects home indicator

## Implementation Details

### App.vue Changes
**File:** [`src/App.vue`](src/App.vue)

The main App component now:
1. Imports both layout components
2. Uses `usePlatform()` composable
3. Dynamically selects layout via computed property
4. Passes header actions as slots to both layouts
5. Renders router-view within the selected layout

```vue
<component :is="currentLayout">
  <template #header-actions>
    <!-- Auth buttons, user menu, etc -->
  </template>
  <router-view />
</component>
```

### HomeView Changes
**File:** [`src/views/HomeView.vue`](src/views/HomeView.vue)

Added mobile-specific styles:
- Hero container hidden on mobile (`@media (max-width: 767px)`)
- Reduced gap spacing on mobile
- Maintains all functionality

## Browser Compatibility

### Supported Features
- Safe area insets (iOS 11+, Android with notch/gesture bars)
- Dynamic viewport height (modern browsers)
- CSS custom properties (all modern browsers)
- Backdrop filter (Chrome 76+, Safari 9+, Firefox 103+)

### Fallbacks
- Tauri API detection fails → Falls back to viewport width
- Safe area insets unavailable → Uses standard padding
- Dynamic viewport → Falls back to standard `vh`

## Performance Considerations

1. **Single Layout Render:** Only one layout component is mounted at a time
2. **Conditional Import:** No code splitting needed (both layouts are lightweight)
3. **CSS Optimizations:** Mobile-specific styles in media queries
4. **Platform Detection:** Minimal overhead, runs once on mount

## Platform Guidelines Compliance

### Material Design (Android)
- ✅ 48dp minimum touch target size
- ✅ Bottom navigation for 3-5 primary destinations
- ✅ Active state indicators
- ✅ System gesture area respect

### Human Interface Guidelines (iOS)
- ✅ Safe area inset support
- ✅ Tab bar at bottom for navigation
- ✅ 44pt minimum touch target
- ✅ Home indicator spacing

## Future Enhancements

### Potential Improvements
1. **Platform-specific icons:** Use Material icons on Android, SF Symbols on iOS
2. **Haptic feedback:** Add tactile feedback on mobile interactions
3. **Gesture navigation:** Swipe between tabs on mobile
4. **Adaptive sizing:** Further optimize text sizes per platform
5. **Platform theming:** Material You on Android, iOS styling on iOS

### Accessibility
- Add ARIA labels to bottom navigation
- Ensure keyboard navigation works on desktop
- Test with screen readers on both platforms
- Add focus indicators for keyboard users

## Troubleshooting

### Layout Not Switching
1. Check console for platform detection logs
2. Verify viewport width in DevTools
3. Check if `usePlatform` composable is imported
4. Ensure Tauri APIs are available

### Bottom Navigation Not Showing
1. Verify mobile layout is active
2. Check z-index conflicts
3. Ensure safe area variables are supported
4. Check for CSS conflicts

### Hero Container Still Visible on Mobile
1. Verify media query breakpoint (767px)
2. Check CSS specificity conflicts
3. Ensure styles are being applied

## Related Files

- [`src/composables/usePlatform.js`](src/composables/usePlatform.js) - Platform detection
- [`src/components/layouts/DesktopLayout.vue`](src/components/layouts/DesktopLayout.vue) - Desktop layout
- [`src/components/layouts/MobileLayout.vue`](src/components/layouts/MobileLayout.vue) - Mobile layout
- [`src/components/MobileBottomNav.vue`](src/components/MobileBottomNav.vue) - Bottom navigation
- [`src/App.vue`](src/App.vue) - Main app with layout switching
- [`src/views/HomeView.vue`](src/views/HomeView.vue) - Home view with mobile optimizations
- [`src/assets/styles/main.css`](src/assets/styles/main.css) - Global styles and utilities

## Conclusion

This dual-layout system provides a robust, platform-aware UI that automatically adapts to desktop and mobile environments while maintaining full feature parity and following platform-specific design guidelines.