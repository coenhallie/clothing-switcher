# SwitchFit Studio Mobile Logo Guidelines

## Available Assets

### Modern Minimalist Icon (Primary)
- **Filename:** `src/assets/images/switchfit-icon-modern.svg`
- **Style:** Clean, simplified S monogram with gradient background
- **Use Case:** App icons, minimal UI contexts, small sizes (24-48px)
- **Currently Used:** Mobile bottom navigation

### Detailed Emblem (Alternative)
- **Filename:** `src/assets/images/switchfit-logo-mobile.svg`
- **Style:** Rich gradient emblem with complex S curve and accent elements
- **Use Case:** Larger contexts, splash screens, branding materials (48px+)

## Common Specifications
- **Format:** SVG (vector, infinitely scalable)
- **Dimensions:** 128 × 128 viewBox
- **Palette:** Gradients derived from the brand indigo–sky spectrum (`var(--color-brand-500)` family) with neutral highlights for legibility in light and dark surfaces.
- **Accessibility:** Both include `<title>` and `<desc>` metadata for assistive technologies. Retain these tags when inlining.

## Usage Recommendations

### Vue Components
Import the appropriate asset based on your context:

```vue
<script setup>
// For minimal, modern contexts (recommended for most UI)
import iconModern from '@/assets/images/switchfit-icon-modern.svg';

// For detailed branding contexts
import logoDetailed from '@/assets/images/switchfit-logo-mobile.svg';
</script>
```

Embed using an `<img>` tag (preferred for automatic caching):

```vue
<template>
  <!-- Modern minimalist version -->
  <img
    :src="iconModern"
    alt="SwitchFit Studio"
    class="logo-mark"
    width="36"
    height="36"
  />
</template>
```

### Layout Integration
- **Mobile bottom navigation:** Uses the modern minimalist icon in [`src/components/MobileBottomNav.vue`](src/components/MobileBottomNav.vue:56) with the `.mobile-bottom-nav__logo-mark` class for consistent sizing and soft shadow.
- **Other mobile surfaces:** Reuse the `.mobile-bottom-nav__logo-mark` and `.mobile-bottom-nav__logo-copy` patterns for quick alignment. These classes encapsulate spacing, background glow, and typography pairing.

### Sizing Guidance
| Context                      | Recommended Icon | Size     | Notes                                  |
|-----------------------------|------------------|----------|----------------------------------------|
| Bottom navigation           | Modern           | 36 px    | Current implementation                 |
| Toolbar / header icon       | Modern           | 32 px    | Maintain ≥ 28 px for touch targets    |
| App launcher icon           | Modern           | Platform | Android: adaptive icon layers          |
| Splash / onboarding         | Detailed         | 64-96 px | Use detailed version for impact        |
| Loading states              | Modern           | 40-48 px | Simpler icon works better for spinners |

**Icon Selection Guide:**
- **Modern icon** (switchfit-icon-modern.svg): Use for sizes ≤ 48 px and contexts requiring clean, minimal aesthetics
- **Detailed emblem** (switchfit-logo-mobile.svg): Use for sizes ≥ 64 px and branding-focused contexts

Maintain a minimum padding of 8 px around the logo to preserve visual breathing room.

## Theming Notes
- The asset is optimized for neutral or subtle gradient backgrounds. On very dark surfaces, ensure foreground text uses `var(--color-card-foreground)` or brighter.
- When displayed on pure white backgrounds, consider adding a soft shadow similar to `.mobile-bottom-nav__logo-mark` to keep depth.

## Asset Updates
For future tweaks (e.g., adjusting gradients or shapes):

1. Edit the appropriate SVG file directly (retain the `linearGradient` IDs).
2. Update export metadata (`<title>`/`<desc>`).
3. Vite HMR will auto-reload changes in dev mode (`npm run dev`).
4. For production icon changes, regenerate platform-specific assets (see below).

### Platform Icon Generation
To update app launcher icons on mobile platforms:

```bash
# For Android (requires updated src-tauri/icons/icon.png as source)
npm run tauri android build

# For iOS (similar process)
npm run tauri ios build
```

The source should be a high-resolution version (1024×1024) of your chosen icon.

## Desktop Considerations
The desktop header currently uses text-based branding. If you adopt the SVG there, scale it to ~40 px height and combine with the “SwitchFit Studio” wordmark to preserve visual hierarchy.
