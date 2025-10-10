# Mobile Profile Bottom Sheet Implementation

## Overview

Implemented a modern **modal bottom sheet** pattern for mobile profile/account access, following 2025 UX best practices and industry standards from Material Design 3, Apple HIG, and Nielsen Norman Group research.

## Why Bottom Sheet?

Based on comprehensive 2025 mobile UX research, bottom sheets emerged as the dominant pattern for account interactions due to:

### Advantages
- **Thumb-friendly**: Positioned within natural thumb reach on large-screen devices (6.5"+)
- **Contextual awareness**: Users maintain visual context of main content
- **Gesture-native**: Supports intuitive swipe-down to dismiss
- **Less disruptive**: Lighter than full-screen modals, reducing cognitive load
- **Accessibility-first**: Easier to implement proper focus management and screen reader support

### Industry Adoption
- **Google Maps**: Non-modal sheets for place details
- **Instagram**: Modal sheets for profile actions
- **Asana Mobile**: Contextual drawers that scale gracefully

## Implementation Details

### Component: `ProfileBottomSheet.vue`

#### Key Features

1. **Gesture Support (2025 Standard)**
   - Swipe-to-dismiss from drag handle
   - 150px threshold for close
   - Velocity-based quick dismiss (0.5px/ms)
   - Smooth spring animations

2. **Accessibility Compliance**
   ```vue
   - ARIA modal role and labels
   - Keyboard navigation (Escape to close)
   - 44x44pt minimum touch targets (Apple HIG)
   - Proper focus trapping
   - Screen reader announcements
   ```

3. **Modern UX Patterns**
   - Backdrop blur for depth perception
   - Drag handle affordance
   - Active state animations (scale 0.98)
   - Haptic-ready interactions
   - Safe area support for notched devices

4. **Content Organization**
   - User profile header with avatar
   - Credit balance display (prominent)
   - Primary actions (Purchase Credits)
   - Secondary actions (Settings, Theme)
   - Destructive action (Sign Out) - visually separated

#### Animation Details

```css
/* Sheet entrance */
transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);

/* Sheet exit */
transition: transform 0.25s cubic-bezier(0.4, 0, 1, 1);

/* Backdrop */
backdrop-filter: blur(8px);
```

### Integration Points

#### App.vue Changes

1. **Mobile Header** - Simplified avatar button (removed dropdown)
2. **Bottom Sheet Component** - Added with conditional rendering
   ```vue
   <ProfileBottomSheet
     v-if="isMobile"
     :is-open="showUserMenu"
     :user-name="userName"
     :avatar-initials="avatarInitials"
     :credits="credits"
     :theme="theme"
     :resolved-theme="resolvedTheme"
     @close="closeUserMenu"
     @purchase-credits="openPurchaseCredits"
     @theme-toggle="cycleTheme"
     @sign-out="handleSignOut"
   />
   ```

3. **Desktop** - Retains traditional dropdown menu (unaffected)

## Design Decisions

### Why Modal vs Non-Modal?
**Modal** - Blocks background interaction, appropriate for account management focus

### Why Bottom vs Side Drawer?
**Bottom** - Better thumb reach on modern large phones, standard Android/iOS pattern

### Why Not Full-Screen?
Full-screen loses context and feels heavyweight for quick account actions

## Accessibility Features

### Screen Reader Support
- Proper ARIA roles and labels
- Announced state changes
- Clear navigation structure

### Motor Impairment Support
- Large touch targets (≥44pt)
- Both tap and swipe dismiss options
- No complex gestures required

### Visual Impairment Support
- High contrast text
- Proper heading hierarchy
- Theme-aware colors

## Performance Optimizations

1. **Conditional Rendering** - Only mounted on mobile
2. **Event Listeners** - Properly cleaned up on unmount
3. **Body Scroll Lock** - Prevents background scroll
4. **Transform-based Animation** - GPU-accelerated

## Browser Compatibility

- **iOS Safari**: Full support with safe area insets
- **Chrome Android**: Full support
- **Firefox Mobile**: Full support
- **Gesture Support**: Touch events (universal mobile support)

## Future Enhancements

### Haptic Feedback (Native Apps)
```javascript
// Trigger on sheet open/close
if (window.navigator.vibrate) {
  window.navigator.vibrate(10); // Subtle confirmation
}
```

### Pull-to-Refresh Context
Currently prevents at top boundary - could enhance with refresh indicator

### Expandable States
Could add half-sheet state for quick actions, full-sheet for settings

## Testing Checklist

- [x] Swipe to dismiss works smoothly
- [x] Backdrop tap closes sheet
- [x] Escape key closes sheet
- [x] All actions trigger correctly
- [x] Animations perform well on low-end devices
- [x] Safe area respected on notched devices
- [x] Theme changes reflect immediately
- [x] No background scroll when open
- [x] Proper cleanup on unmount

## References

- Material Design 3: Bottom Sheets Guidelines
- Nielsen Norman Group: Bottom Sheet UX Study (2024)
- Apple HIG: Sheets and Modals
- Mobile UX Trends 2025 Research

## Code Location

- Component: `src/components/ProfileBottomSheet.vue`
- Integration: `src/App.vue` (lines 21-46, 299-312)
- Imports: `src/App.vue` (line 470)