# Tailwind CSS v4 Utility Mapping: Mobile-First Authentication Flow

**Document Version:** 1.0  
**Last Updated:** 2025-10-06  
**Target Components:** [`MobileAuthScreen.vue`](src/views/MobileAuthScreen.vue), `MobileAuthLanding.vue`, `MobileAuthMethods.vue`, `MobileAuthForm.vue`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Integration with Existing Styles](#2-integration-with-existing-styles)
3. [Layout Scaffolding](#3-layout-scaffolding)
4. [Authentication Method Cards](#4-authentication-method-cards)
5. [Form Controls](#5-form-controls)
6. [CTA Buttons & Actions](#6-cta-buttons--actions)
7. [Loading & Transition States](#7-loading--transition-states)
8. [Typography Hierarchy](#8-typography-hierarchy)
9. [Reusable Component Compositions](#9-reusable-component-compositions)
10. [Responsive Breakpoints & Platform Detection](#10-responsive-breakpoints--platform-detection)
11. [Recommended Plugin Configurations](#11-recommended-plugin-configurations)
12. [Implementation Priorities](#12-implementation-priorities)

---

## 1. Overview

This document provides comprehensive Tailwind CSS v4 utility mappings for implementing a mobile-first authentication flow within the SwitchFit application. The design leverages existing custom properties and theme tokens defined in [`src/assets/styles/main.css`](src/assets/styles/main.css) while introducing mobile-optimized patterns.

**Key Design Principles:**
- Mobile-first responsive design (320px → 768px breakpoint)
- Touch-optimized interactions (44px minimum touch targets)
- Safe-area awareness for iOS/Android notches
- Accessibility compliance (WCAG 2.1 AA/AAA)
- Performance-focused animations and transitions

---

## 2. Integration with Existing Styles

### 2.1 Theme Foundation

The existing [`src/assets/styles/main.css`](src/assets/styles/main.css) establishes a comprehensive design system using Tailwind v4's `@theme` directive with OKLCH color space:

**Color Tokens Available:**
```css
/* Semantic colors */
--color-background     /* oklch(0.98 0.01 236) */
--color-foreground     /* oklch(0.19 0.02 236) */
--color-surface        /* oklch(0.99 0.008 236) */
--color-card           /* oklch(0.99 0.008 236) */
--color-muted          /* oklch(0.95 0.008 236) */
--color-border         /* oklch(0.88 0.008 236) */

/* Brand scale (50-900) */
--color-brand-500      /* oklch(0.67 0.19 264) - Primary brand */
--color-brand-600      /* oklch(0.58 0.17 264) */

/* Functional colors */
--color-success-500    /* oklch(0.75 0.16 142) */
--color-destructive-500 /* oklch(0.62 0.2 24) */
```

**Radius System:**
```css
--radius-sm: 0.5rem   /* 8px */
--radius-md: 0.75rem  /* 12px */
--radius-lg: 1rem     /* 16px */
--radius-xl: 1.5rem   /* 24px */
```

**Shadow System:**
```css
--shadow-soft   /* Elevated cards */
--shadow-border /* Subtle borders */
--shadow-focus  /* Keyboard focus rings */
```

### 2.2 Custom Properties Reference

Leverage existing typography and spacing variables:

```css
/* Typography scale (lines 60-67) */
--font-xs: 0.75rem    /* 12px */
--font-sm: 0.875rem   /* 14px */
--font-base: 1rem     /* 16px */
--font-lg: 1.125rem   /* 18px */
--font-xl: 1.25rem    /* 20px */
--font-2xl: 1.5rem    /* 24px */
--font-3xl: 1.75rem   /* 28px */
--font-4xl: 2rem      /* 32px */

/* Touch targets (lines 84-86) */
--touch-target-min: 44px  /* WCAG AAA */
--touch-target-aa: 24px   /* WCAG AA */
```

### 2.3 Existing Component Classes

Reuse established patterns from `.auth-panel` (lines 277-603):

- **`.auth-panel__header`** - Centered header with flex column
- **`.auth-panel__title`** - Display font with responsive sizing
- **`.auth-panel__input`** - Form inputs with focus states
- **`.auth-panel__primary-btn`** - Gradient button with hover lift
- **`.auth-modal-panel`** - Glassmorphic container with radial gradients

**Strategy:** Adapt desktop-first auth panel classes to mobile-specific utilities while maintaining visual consistency.

---

## 3. Layout Scaffolding

### 3.1 Mobile Authentication Container

**Component:** `MobileAuthScreen.vue` (root container)

**Tailwind Utilities:**
```html
<div class="
  min-h-screen 
  flex flex-col
  bg-[var(--color-background)]
  safe-top safe-bottom
  overflow-y-auto
  overscroll-none
">
  <!-- Content -->
</div>
```

**Breakdown:**
- `min-h-screen` - Full viewport height (uses `100dvh` for mobile browsers)
- `flex flex-col` - Vertical stacking layout
- `bg-[var(--color-background)]` - Custom property reference
- `safe-top safe-bottom` - Existing utilities for safe-area insets (lines 808-822)
- `overscroll-none` - Prevents bounce effect on mobile

**Custom Utilities (Already Defined):**
```css
/* From main.css lines 808-822 */
.safe-top { padding-top: env(safe-area-inset-top); }
.safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
```

### 3.2 Content Area Structure

**Landing Section:**
```html
<section class="
  flex-1 
  flex flex-col justify-center
  px-4 sm:px-6
  py-8
  gap-6
">
  <!-- Logo, headline, subtitle -->
</section>
```

**Method Selection Section:**
```html
<section class="
  px-4 sm:px-6
  pb-safe
  space-y-4
">
  <!-- Auth method cards -->
</section>
```

**Utilities Explanation:**
- `flex-1` - Takes available vertical space
- `justify-center` - Vertical centering for landing content
- `px-4 sm:px-6` - Responsive horizontal padding (16px → 24px at sm breakpoint)
- `pb-safe` - Custom utility for safe-area bottom padding
- `space-y-4` - Vertical gap between children (16px)

### 3.3 Fixed Bottom Actions

**CTA Container (Always visible):**
```html
<div class="
  sticky bottom-0
  bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)] to-transparent
  px-4 sm:px-6
  pb-safe pt-6
  safe-bottom
">
  <button class="w-full touch-target-aaa ...">
    Get Started
  </button>
</div>
```

**Key Features:**
- `sticky bottom-0` - Stays at viewport bottom during scroll
- `bg-gradient-to-t` - Fade-in gradient for smooth transition
- `safe-bottom` - Accounts for iOS home indicator
- `touch-target-aaa` - Ensures 44px minimum height (existing utility line 693)

---

## 4. Authentication Method Cards

### 4.1 Card Container

**Component:** `MobileAuthMethods.vue`

**Base Card Structure:**
```html
<button class="
  w-full
  flex items-center gap-4
  p-4
  rounded-[var(--radius-lg)]
  bg-[var(--color-card)]
  border border-[var(--color-border)]
  shadow-[var(--shadow-border)]
  transition-all duration-200
  active:scale-[0.98]
  focus-visible:ring-4 focus-visible:ring-[var(--color-ring)]/25
  touch-target-aaa
">
  <!-- Icon + Text -->
</button>
```

**Breakdown:**
- `w-full` - Full width for mobile stacking
- `flex items-center gap-4` - Horizontal layout with 16px gap
- `rounded-[var(--radius-lg)]` - 16px border radius from theme
- `bg-[var(--color-card)]` - Card background token
- `shadow-[var(--shadow-border)]` - Subtle elevation from theme
- `active:scale-[0.98]` - Touch feedback (slight shrink on press)
- `focus-visible:ring-4` - Keyboard focus ring (4px offset)
- `touch-target-aaa` - 44px minimum height

### 4.2 Icon Container

```html
<div class="
  flex-shrink-0
  w-12 h-12
  flex items-center justify-center
  rounded-full
  bg-gradient-to-br from-[var(--color-brand-400)] to-[var(--color-brand-600)]
  text-white
">
  <svg class="w-6 h-6"><!-- Icon --></svg>
</div>
```

**Features:**
- `flex-shrink-0` - Prevents icon compression
- `w-12 h-12` - 48px icon container (exceeds touch target)
- `rounded-full` - Perfect circle
- `bg-gradient-to-br` - Diagonal gradient (brand colors)

### 4.3 Text Content

```html
<div class="flex-1 text-left">
  <p class="
    text-base
    font-semibold
    text-[var(--color-card-foreground)]
    leading-tight
  ">
    Continue with Email
  </p>
  <p class="
    text-sm
    text-[var(--color-muted-foreground)]
    leading-snug
  ">
    Sign in or create account
  </p>
</div>
```

**Typography Mapping:**
- `text-base` - 16px (existing utility line 666)
- `font-semibold` - 600 weight (line 677)
- `leading-tight` - 1.25 line height (line 681)
- `text-sm` - 14px (line 665)
- `leading-snug` - 1.375 line height (line 682)

### 4.4 Hover & Active States

```html
<!-- Add to base card class -->
hover:border-[var(--color-brand-500)]/30
hover:bg-[var(--color-card)]/95
hover:shadow-lg
hover:-translate-y-0.5
```

**Mobile Considerations:**
- Use `active:` instead of `hover:` for primary touch feedback
- Keep hover states for hybrid devices (tablets with mouse)
- Limit transformations to prevent layout shift

---

## 5. Form Controls

### 5.1 Input Field Structure

**Component:** `MobileAuthForm.vue`

**Base Input:**
```html
<div class="space-y-2">
  <label class="
    block
    text-sm
    font-semibold
    text-[var(--color-card-foreground)]/85
    mb-2
  ">
    Email Address
  </label>
  
  <input 
    type="email"
    class="
      w-full
      px-4 py-3
      text-base
      bg-[var(--color-surface)]/90
      border border-[var(--color-border)]/70
      rounded-[var(--radius-md)]
      text-[var(--color-card-foreground)]
      placeholder:text-[var(--color-muted-foreground)]/65
      focus:outline-none
      focus:border-[var(--color-brand-500)]/55
      focus:ring-4
      focus:ring-[var(--color-brand-500)]/22
      focus:bg-[var(--color-surface)]/95
      transition-all duration-200
      touch-target-aaa
    "
    placeholder="you@example.com"
  />
</div>
```

**Key Features:**
- `px-4 py-3` - Generous touch padding (16px horizontal, 12px vertical)
- `focus:ring-4` - 4px focus ring (matches existing `.auth-panel__input`)
- `placeholder:text-[...]` - Custom placeholder color with opacity
- `transition-all duration-200` - Smooth state changes (200ms)

### 5.2 Password Input with Toggle

```html
<div class="relative">
  <input 
    type="password"
    class="pr-12 ..." 
  />
  
  <button 
    type="button"
    class="
      absolute right-3 top-1/2 -translate-y-1/2
      p-2
      text-[var(--color-muted-foreground)]/70
      hover:text-[var(--color-card-foreground)]/80
      focus-visible:outline-none
      focus-visible:ring-4
      focus-visible:ring-[var(--color-brand-500)]/22
      rounded-full
      transition-colors duration-200
    "
  >
    <svg class="w-5 h-5"><!-- Eye icon --></svg>
  </button>
</div>
```

**Positioning:**
- `absolute right-3` - 12px from right edge
- `top-1/2 -translate-y-1/2` - Perfect vertical centering
- `p-2` - 8px padding for touch target expansion
- `rounded-full` - Circular focus ring

### 5.3 Error States

```html
<!-- Error input -->
<input class="
  border-[var(--color-destructive-500)]/65
  ring-4
  ring-[var(--color-destructive-500)]/18
  focus:border-[var(--color-destructive-500)]
  focus:ring-[var(--color-destructive-500)]/22
" />

<!-- Error message -->
<p class="
  flex items-center gap-2
  text-sm
  text-[var(--color-destructive-500)]/78
  mt-2
">
  <svg class="w-4 h-4"><!-- Alert icon --></svg>
  <span>Please enter a valid email address</span>
</p>
```

**Alignment with Existing:**
- Matches `.auth-panel__input--error` pattern (lines 370-378)
- Uses same destructive color tokens

### 5.4 Helper Text

```html
<p class="
  text-xs
  text-[var(--color-muted-foreground)]/75
  leading-relaxed
  mt-2
">
  We'll never share your email with anyone else.
</p>
```

**Matches:**
- `.auth-panel__helper` styling (lines 387-392)

---

## 6. CTA Buttons & Actions

### 6.1 Primary CTA Button

**Component:** Multiple (MobileAuthLanding, MobileAuthForm)

```html
<button class="
  w-full
  flex items-center justify-center gap-2
  px-6 py-3.5
  text-base font-semibold
  text-white
  bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-600)]
  rounded-full
  shadow-lg shadow-[var(--color-brand-700)]/20
  transition-all duration-200
  hover:shadow-xl hover:shadow-[var(--color-brand-700)]/25
  hover:-translate-y-0.5
  hover:brightness-105
  active:scale-[0.98]
  focus-visible:outline-none
  focus-visible:ring-4
  focus-visible:ring-[var(--color-ring)]/35
  disabled:opacity-65
  disabled:cursor-not-allowed
  disabled:transform-none
  disabled:shadow-none
  touch-target-aaa
">
  <span>Continue</span>
  <svg class="w-5 h-5"><!-- Arrow icon --></svg>
</button>
```

**Breakdown:**
- `bg-gradient-to-r` - Horizontal gradient (aligns with `.auth-panel__primary-btn`)
- `rounded-full` - Pill shape (999px equivalent)
- `shadow-lg shadow-[...]` - Elevated shadow with brand color tint
- `hover:-translate-y-0.5` - 2px lift on hover (matches existing button line 497)
- `hover:brightness-105` - Subtle brightness boost
- `active:scale-[0.98]` - Press feedback
- `disabled:opacity-65` - Matches existing disabled state (line 510)

### 6.2 Secondary/Ghost Button

```html
<button class="
  w-full
  px-6 py-3
  text-base font-semibold
  text-[var(--color-brand-600)]/85
  bg-transparent
  border border-[var(--color-border)]
  rounded-full
  transition-all duration-200
  hover:bg-[var(--color-muted)]
  hover:border-[var(--color-brand-500)]/30
  hover:text-[var(--color-brand-500)]
  active:scale-[0.98]
  focus-visible:outline-none
  focus-visible:ring-4
  focus-visible:ring-[var(--color-brand-500)]/22
  touch-target-aaa
">
  Back to Methods
</button>
```

**Use Cases:**
- Navigation back to method selection
- Alternative actions (e.g., "Skip for now")

### 6.3 Link/Text Button

```html
<button class="
  inline-flex items-center gap-1
  px-4 py-2
  text-sm font-semibold
  text-[var(--color-brand-600)]/85
  bg-transparent
  border-0
  rounded-full
  transition-all duration-200
  hover:text-[var(--color-brand-500)]
  hover:-translate-y-0.5
  focus-visible:outline-none
  focus-visible:ring-4
  focus-visible:ring-[var(--color-brand-500)]/22
  touch-target-aa
">
  Forgot password?
</button>
```

**Matches:**
- `.auth-panel__link-btn` pattern (lines 520-544)
- Uses `touch-target-aa` (24px min) for tertiary actions

### 6.4 Social Auth Buttons

```html
<button class="
  w-full
  flex items-center justify-center gap-3
  px-6 py-3
  text-base font-medium
  text-[var(--color-card-foreground)]
  bg-white
  dark:bg-[var(--color-surface)]
  border border-[var(--color-border)]
  rounded-full
  shadow-sm
  transition-all duration-200
  hover:bg-[var(--color-muted)]
  hover:shadow-md
  hover:-translate-y-0.5
  active:scale-[0.98]
  focus-visible:outline-none
  focus-visible:ring-4
  focus-visible:ring-[var(--color-brand-500)]/22
  touch-target-aaa
">
  <img src="/icons/google.svg" class="w-5 h-5" alt="" />
  <span>Continue with Google</span>
</button>
```

**Features:**
- White background (dark mode aware via `dark:`)
- Consistent with method card styling
- Icon left-aligned with text

---

## 7. Loading & Transition States

### 7.1 Button Loading State

**Spinner Component:**
```html
<button disabled class="...">
  <!-- Show when loading -->
  <svg class="
    w-5 h-5
    animate-spin
    text-white/80
  " viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
  </svg>
  
  <!-- Hide when loading -->
  <span class="hidden">Continue</span>
</button>
```

**Animation:**
- `animate-spin` - Built-in Tailwind rotation animation
- `opacity-25` / `opacity-75` - Creates spinner effect

### 7.2 Skeleton Loading (Form Fields)

```html
<div class="space-y-4 animate-pulse">
  <!-- Label skeleton -->
  <div class="h-4 w-24 bg-[var(--color-muted)] rounded"></div>
  
  <!-- Input skeleton -->
  <div class="h-12 w-full bg-[var(--color-muted)]/50 rounded-[var(--radius-md)]"></div>
</div>
```

**Features:**
- `animate-pulse` - Built-in opacity pulsing
- Matches input height (`h-12` = 48px)

### 7.3 Page Transitions

**Entry Animation (Use existing utilities):**
```html
<div class="animate-fade-in">
  <!-- Content -->
</div>
```

**Defined in main.css (lines 753-759):**
```css
@utility animate-fade-in {
  animation: fade-in 0.4s cubic-bezier(0.21, 1, 0.27, 1) forwards;
}
```

**Custom Scale-In for Cards:**
```html
<div class="animate-scale-in" style="animation-delay: 100ms;">
  <!-- Card 1 -->
</div>
<div class="animate-scale-in" style="animation-delay: 200ms;">
  <!-- Card 2 -->
</div>
```

**Stagger Pattern:**
- First card: No delay
- Second card: 100ms delay
- Third card: 200ms delay
- Creates cascading entrance effect

### 7.4 Toast/Alert Messages

```html
<div class="
  fixed top-safe left-4 right-4
  flex items-start gap-3
  p-4
  bg-[var(--color-success-500)]/16
  border border-[var(--color-success-500)]/38
  text-[var(--color-success-500)]/78
  rounded-[var(--radius-lg)]
  shadow-lg
  animate-fade-in
">
  <svg class="w-5 h-5 flex-shrink-0"><!-- Check icon --></svg>
  <p class="text-sm font-medium">Account created successfully!</p>
</div>
```

**Positioning:**
- `top-safe` - Respects safe-area inset
- `left-4 right-4` - 16px margins on mobile
- Matches `.auth-panel__message--success` pattern (lines 457-465)

---

## 8. Typography Hierarchy

### 8.1 Page Headline

```html
<h1 class="
  text-4xl sm:text-5xl
  font-bold
  font-[family-name:var(--font-display)]
  text-[var(--color-card-foreground)]
  leading-tight
  tracking-tight
  text-balance
  text-center
">
  Welcome to SwitchFit
</h1>
```

**Features:**
- `text-4xl sm:text-5xl` - Responsive sizing (32px → 48px)
- `font-[family-name:var(--font-display)]` - Uses Satoshi display font
- `tracking-tight` - -0.015em letter spacing (matches `.auth-panel__title`)
- `text-balance` - CSS text-wrap for better line breaks (existing utility line 717)
- `text-center` - Centered alignment

### 8.2 Section Subtitle

```html
<p class="
  text-lg sm:text-xl
  text-[var(--color-muted-foreground)]/75
  leading-relaxed
  text-balance
  text-center
  max-w-md mx-auto
">
  Transform your wardrobe with AI-powered style matching
</p>
```

**Sizing:**
- `text-lg sm:text-xl` - 18px → 20px responsive
- `max-w-md` - 28rem max width (448px)
- `mx-auto` - Horizontal centering

### 8.3 Form Labels

```html
<label class="
  block
  text-sm
  font-semibold
  text-[var(--color-card-foreground)]/85
  tracking-wide
  mb-2
">
  Email Address
</label>
```

**Matches:**
- `.auth-panel__label` pattern (lines 319-329)

### 8.4 Body Text

```html
<p class="
  text-base
  text-[var(--color-muted-foreground)]
  leading-normal
">
  Standard body text content
</p>
```

### 8.5 Small Print / Legal

```html
<p class="
  text-xs
  text-[var(--color-muted-foreground)]/70
  leading-relaxed
  text-center
">
  By continuing, you agree to our Terms of Service and Privacy Policy
</p>
```

**Size:**
- `text-xs` - 12px (existing utility line 664)

---

## 9. Reusable Component Compositions

### 9.1 `@apply` Recommendations

**Note:** Tailwind v4 recommends minimizing `@apply` usage. However, for highly repeated patterns specific to auth flow, consider these compositions:

#### Add to [`src/assets/styles/main.css`](src/assets/styles/main.css) `@layer components`:

```css
@layer components {
  /* Mobile Auth Container */
  .mobile-auth-screen {
    @apply min-h-screen flex flex-col;
    @apply bg-[var(--color-background)];
    @apply safe-top safe-bottom;
    @apply overflow-y-auto overscroll-none;
  }
  
  /* Auth Method Card */
  .auth-method-card {
    @apply w-full flex items-center gap-4;
    @apply p-4 rounded-[var(--radius-lg)];
    @apply bg-[var(--color-card)];
    @apply border border-[var(--color-border)];
    @apply shadow-[var(--shadow-border)];
    @apply transition-all duration-200;
    @apply active:scale-[0.98];
    @apply focus-visible:ring-4 focus-visible:ring-[var(--color-ring)]/25;
    @apply touch-target-aaa;
  }
  
  /* Mobile Form Input */
  .mobile-input {
    @apply w-full px-4 py-3 text-base;
    @apply bg-[var(--color-surface)]/90;
    @apply border border-[var(--color-border)]/70;
    @apply rounded-[var(--radius-md)];
    @apply text-[var(--color-card-foreground)];
    @apply placeholder:text-[var(--color-muted-foreground)]/65;
    @apply focus:outline-none;
    @apply focus:border-[var(--color-brand-500)]/55;
    @apply focus:ring-4 focus:ring-[var(--color-brand-500)]/22;
    @apply transition-all duration-200;
    @apply touch-target-aaa;
  }
  
  /* Primary Mobile CTA */
  .mobile-cta-primary {
    @apply w-full flex items-center justify-center gap-2;
    @apply px-6 py-3.5 text-base font-semibold text-white;
    @apply bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-600)];
    @apply rounded-full shadow-lg;
    @apply transition-all duration-200;
    @apply hover:-translate-y-0.5 hover:shadow-xl;
    @apply active:scale-[0.98];
    @apply focus-visible:ring-4 focus-visible:ring-[var(--color-ring)]/35;
    @apply disabled:opacity-65 disabled:cursor-not-allowed;
    @apply touch-target-aaa;
  }
  
  /* Secondary Mobile Button */
  .mobile-cta-secondary {
    @apply w-full px-6 py-3 text-base font-semibold;
    @apply text-[var(--color-brand-600)]/85;
    @apply bg-transparent border border-[var(--color-border)];
    @apply rounded-full transition-all duration-200;
    @apply hover:bg-[var(--color-muted)];
    @apply active:scale-[0.98];
    @apply focus-visible:ring-4 focus-visible:ring-[var(--color-brand-500)]/22;
    @apply touch-target-aaa;
  }
  
  /* Mobile Section Container */
  .mobile-section {
    @apply px-4 sm:px-6 py-6;
  }
  
  /* Mobile Card Stack */
  .mobile-card-stack {
    @apply space-y-3;
  }
}
```

### 9.2 Component Structure Templates

#### **MobileAuthScreen.vue**

```vue
<template>
  <div class="mobile-auth-screen">
    <!-- Header/Logo -->
    <header class="mobile-section pt-8">
      <img 
        src="@/assets/images/switchfit-logo-mobile.svg" 
        class="h-8 mx-auto"
        alt="SwitchFit"
      />
    </header>
    
    <!-- Content Area -->
    <main class="flex-1 flex flex-col justify-center mobile-section">
      <component :is="currentView" />
    </main>
    
    <!-- Footer Actions -->
    <footer class="mobile-section sticky bottom-0 pb-safe">
      <slot name="actions" />
    </footer>
  </div>
</template>
```

#### **MobileAuthLanding.vue**

```vue
<template>
  <div class="flex flex-col gap-6 animate-fade-in">
    <!-- Headline -->
    <div class="space-y-3 text-center">
      <h1 class="text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--color-card-foreground)] leading-tight text-balance">
        Style Matching Made Simple
      </h1>
      <p class="text-lg text-[var(--color-muted-foreground)]/75 leading-relaxed max-w-md mx-auto">
        Sign in to unlock AI-powered wardrobe transformation
      </p>
    </div>
    
    <!-- Illustration/Hero Image -->
    <div class="py-8">
      <img 
        src="@/assets/images/hero-fashion-bg.png" 
        class="w-full max-w-xs mx-auto rounded-[var(--radius-xl)]"
        alt="Fashion preview"
      />
    </div>
  </div>
</template>
```

#### **MobileAuthMethods.vue**

```vue
<template>
  <div class="mobile-card-stack animate-fade-in">
    <!-- Email -->
    <button 
      @click="selectMethod('email')"
      class="auth-method-card"
    >
      <div class="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand-400)] to-[var(--color-brand-600)] text-white">
        <svg class="w-6 h-6"><!-- Email icon --></svg>
      </div>
      <div class="flex-1 text-left">
        <p class="text-base font-semibold text-[var(--color-card-foreground)] leading-tight">
          Continue with Email
        </p>
        <p class="text-sm text-[var(--color-muted-foreground)] leading-snug">
          Sign in or create account
        </p>
      </div>
      <svg class="w-5 h-5 text-[var(--color-muted-foreground)]"><!-- Arrow --></svg>
    </button>
    
    <!-- Google -->
    <button class="auth-method-card" style="animation-delay: 100ms;">
      <!-- Similar structure -->
    </button>
    
    <!-- Apple -->
    <button class="auth-method-card" style="animation-delay: 200ms;">
      <!-- Similar structure -->
    </button>
  </div>
</template>
```

#### **MobileAuthForm.vue**

```vue
<template>
  <form @submit.prevent="handleSubmit" class="space-y-6 animate-fade-in">
    <!-- Email Field -->
    <div class="space-y-2">
      <label for="email" class="block text-sm font-semibold text-[var(--color-card-foreground)]/85 mb-2">
        Email Address
      </label>
      <input 
        id="email"
        v-model="email"
        type="email"
        class="mobile-input"
        :class="{ 'border-[var(--color-destructive-500)]/65 ring-4 ring-[var(--color-destructive-500)]/18': errors.email }"
        placeholder="you@example.com"
      />
      <p v-if="errors.email" class="flex items-center gap-2 text-sm text-[var(--color-destructive-500)]/78 mt-2">
        <svg class="w-4 h-4"><!-- Alert icon --></svg>
        {{ errors.email }}
      </p>
    </div>
    
    <!-- Password Field -->
    <div class="space-y-2">
      <div class="flex items-center justify-between mb-2">
        <label for="password" class="text-sm font-semibold text-[var(--color-card-foreground)]/85">
          Password
        </label>
        <button 
          type="button"
          class="text-sm font-semibold text-[var(--color-brand-600)]/85"
        >
          Forgot?
        </button>
      </div>
      
      <div class="relative">
        <input 
          id="password"
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          class="mobile-input pr-12"
        />
        <button 
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[var(--color-muted-foreground)]/70 rounded-full"
        >
          <svg class="w-5 h-5"><!-- Eye icon --></svg>
        </button>
      </div>
    </div>
    
    <!-- Submit Button -->
    <button 
      type="submit"
      :disabled="loading"
      class="mobile-cta-primary"
    >
      <svg v-if="loading" class="w-5 h-5 animate-spin"><!-- Spinner --></svg>
      <span v-else>Sign In</span>
    </button>
    
    <!-- Secondary Action -->
    <button 
      type="button"
      @click="$emit('back')"
      class="mobile-cta-secondary"
    >
      Back to Methods
    </button>
  </form>
</template>
```

---

## 10. Responsive Breakpoints & Platform Detection

### 10.1 Breakpoint Strategy

**Tailwind v4 Default Breakpoints:**
```
sm: 640px   (tablet portrait)
md: 768px   (tablet landscape / small desktop)
lg: 1024px  (desktop)
xl: 1280px  (large desktop)
```

**Mobile-First Auth Flow Breakpoints:**

```html
<!-- Base: 320px - 639px (mobile) -->
<div class="px-4 py-6">

<!-- Small: 640px+ (large phones, small tablets) -->
<div class="px-4 sm:px-6 py-6 sm:py-8">

<!-- Medium: 768px+ (tablets, transition to desktop) -->
<div class="px-4 sm:px-6 md:hidden">
  <!-- Mobile-only content -->
</div>
```

**Critical Responsive Patterns:**

```html
<!-- Heading Size -->
<h1 class="text-3xl sm:text-4xl md:text-5xl">

<!-- Button Padding -->
<button class="px-6 py-3 sm:px-8 sm:py-4">

<!-- Card Grid (stacks on mobile, grid on tablet+) -->
<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

<!-- Max Width Container -->
<div class="max-w-md mx-auto sm:max-w-lg md:max-w-2xl">
```

### 10.2 Platform Detection Integration

**Leverage existing [`src/composables/usePlatform.js`](src/composables/usePlatform.js):**

```vue
<script setup>
import { usePlatform } from '@/composables/usePlatform'

const { isMobile, isDesktop } = usePlatform()
</script>

<template>
  <!-- Conditional rendering -->
  <MobileAuthScreen v-if="isMobile" />
  <DesktopAuthModal v-else />
  
  <!-- Or conditional classes -->
  <div :class="[
    'auth-container',
    { 'mobile-auth-screen': isMobile }
  ]">
</template>
```

**Platform-Specific Utilities:**

```html
<!-- Hide on desktop, show on mobile -->
<div class="desktop-hidden">
  <MobileBottomNav />
</div>

<!-- Hide on mobile, show on desktop -->
<div class="mobile-hidden">
  <DesktopSidebar />
</div>
```

**Defined in main.css (lines 788-805):**
```css
.mobile-hidden { display: none; }
.desktop-hidden { display: block; }

@media (min-width: 768px) {
  .mobile-hidden { display: block; }
  .desktop-hidden { display: none; }
}
```

### 10.3 Safe Area Handling

**iOS Notch/Home Indicator:**

```html
<!-- Top safe area (status bar, notch) -->
<header class="safe-top bg-[var(--color-background)]">
  <div class="pt-4">
    <!-- Content with additional padding -->
  </div>
</header>

<!-- Bottom safe area (home indicator) -->
<footer class="safe-bottom pb-6">
  <button class="mobile-cta-primary">
    Continue
  </button>
</footer>

<!-- Combined (full screen container) -->
<div class="safe-top safe-bottom min-h-screen">
  <!-- Full-height content -->
</div>
```

**Existing Utilities (main.css lines 808-822):**
```css
.safe-top { padding-top: env(safe-area-inset-top); }
.safe-right { padding-right: env(safe-area-inset-right); }
.safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
.safe-left { padding-left: env(safe-area-inset-left); }
```

### 10.4 Orientation Changes

**Landscape Mode Adjustments:**

```html
<!-- Reduce vertical spacing in landscape -->
<div class="py-6 landscape:py-3">

<!-- Horizontal layout in landscape -->
<div class="flex-col landscape:flex-row">
```

**Add Custom Variant (if needed):**

```css
/* In main.css */
@custom-variant landscape (@media (orientation: landscape));
```

---

## 11. Recommended Plugin Configurations

### 11.1 Safe Area Inset Plugin

**Already Configured:** Existing utilities in [`src/assets/styles/main.css`](src/assets/styles/main.css) handle safe areas via CSS `env()` variables.

**No additional plugin needed** - native CSS approach is preferred for Tauri mobile apps.

### 11.2 Gradient Enhancements

**Current Implementation:** Uses inline gradient utilities:
```html
bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-600)]
```

**Optional Enhancement:** Define reusable gradient utilities:

```css
/* Add to @layer utilities in main.css */
@layer utilities {
  .bg-brand-gradient {
    background-image: linear-gradient(
      135deg,
      var(--color-brand-500) 0%,
      var(--color-brand-600) 100%
    );
  }
  
  .bg-brand-gradient-radial {
    background-image: radial-gradient(
      circle at top,
      color-mix(in oklch, var(--color-brand-500) 45%, transparent) 0%,
      transparent 70%
    );
  }
}
```

**Usage:**
```html
<button class="bg-brand-gradient text-white ...">
```

### 11.3 Animation Variants

**Existing Animations (main.css lines 731-759):**
- `animate-fade-in` - Fade + translateY
- `animate-scale-in` - Fade + scale

**Recommended Additions:**

```css
/* Add to main.css */
@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@utility animate-slide-in-right {
  animation: slide-in-right 0.35s cubic-bezier(0.21, 1, 0.27, 1) forwards;
}

@utility animate-slide-in-left {
  animation: slide-in-left 0.35s cubic-bezier(0.21, 1, 0.27, 1) forwards;
}
```

**Use Case:**
```html
<!-- Transitioning between auth steps -->
<div 
  v-if="step === 'methods'" 
  class="animate-slide-in-right"
>
  <MobileAuthMethods />
</div>

<div 
  v-if="step === 'form'" 
  class="animate-slide-in-left"
>
  <MobileAuthForm />
</div>
```

### 11.4 Touch Feedback Variant

**Define Active State Variant:**

```css
/* Add to main.css @custom-variant section */
@custom-variant touch-active (&:active);
```

**Usage:**
```html
<button class="
  bg-brand-500
  touch-active:bg-brand-600
  touch-active:scale-95
">
  Tap Me
</button>
```

### 11.5 Reduced Motion Support

**Already Configured:** Lines 915-924 in main.css disable animations for users with `prefers-reduced-motion`.

**Best Practice:** Always test with reduced motion enabled:
```
System Preferences > Accessibility > Display > Reduce Motion
```

---

## 12. Implementation Priorities

### Phase 1: Core Layout (Week 1)

**Priority: HIGH**

1. **Create `MobileAuthScreen.vue` container**
   - Use `mobile-auth-screen` composition class
   - Implement safe-area utilities
   - Add router-view slot for auth steps

2. **Implement base utilities in main.css**
   - Add component compositions from Section 9.1
   - Define gradient utilities (Section 11.2)
   - Add slide animations (Section 11.3)

3. **Test platform detection**
   - Verify `usePlatform` integration
   - Test `mobile-hidden` / `desktop-hidden` utilities
   - Validate safe-area rendering on iOS/Android

**Validation:**
- [ ] Mobile auth screen renders full-height
- [ ] Safe areas respected on notched devices
- [ ] Platform detection toggles correctly

---

### Phase 2: Authentication Methods (Week 1-2)

**Priority: HIGH**

1. **Build `MobileAuthMethods.vue`**
   - Use `auth-method-card` composition
   - Implement staggered `animate-scale-in`
   - Add touch feedback with `active:scale-[0.98]`

2. **Create method card variants**
   - Email/password card
   - Google OAuth card
   - Apple Sign In card (if applicable)

3. **Wire up navigation**
   - Emit method selection events
   - Transition to form view

**Validation:**
- [ ] Cards animate on entry with stagger
- [ ] Touch feedback provides visual confirmation
- [ ] 44px touch targets verified
- [ ] Focus rings visible for keyboard navigation

---

### Phase 3: Form Components (Week 2)

**Priority: HIGH**

1. **Build `MobileAuthForm.vue`**
   - Use `mobile-input` composition
   - Implement password toggle
   - Add error states with validation

2. **Create form variants**
   - Login form
   - Signup form
   - Forgot password form

3. **Implement loading states**
   - Button spinner animation
   - Skeleton loaders for async operations
   - Toast notifications for success/error

**Validation:**
- [ ] Inputs meet 44px touch target
- [ ] Focus rings visible and sized correctly (4px)
- [ ] Error states visually distinct
- [ ] Loading states prevent double submission

---

### Phase 4: Animations & Polish (Week 2-3)

**Priority: MEDIUM**

1. **Add page transitions**
   - Slide animations between auth steps
   - Fade-in for success states
   - Exit animations for modals

2. **Implement toast system**
   - Success notifications
   - Error alerts
   - Info messages

3. **Refine touch interactions**
   - Test active states on real devices
   - Adjust timing for iOS vs Android differences
   - Optimize for one-handed use

**Validation:**
- [ ] Transitions feel smooth (60fps)
- [ ] No layout shift during animations
- [ ] Toast positioning respects safe areas
- [ ] Reduced motion preference honored

---

### Phase 5: Responsive Testing (Week 3)

**Priority: MEDIUM**

1. **Test across breakpoints**
   - 320px (iPhone SE)
   - 375px (iPhone 12/13 Pro)
   - 390px (iPhone 14 Pro)
   - 414px (iPhone 14 Pro Max)
   - 768px (iPad mini)

2. **Validate dark mode**
   - Test all color tokens
   - Verify contrast ratios (WCAG AA)
   - Check gradient visibility

3. **Accessibility audit**
   - Screen reader navigation
   - Keyboard-only navigation
   - Touch target verification (WCAG 2.5.5)

**Validation:**
- [ ] No horizontal scrolling on any breakpoint
- [ ] Text remains readable (min 16px body)
- [ ] Focus indicators visible in all modes
- [ ] VoiceOver/TalkBack announces correctly

---

### Phase 6: Integration & Edge Cases (Week 3-4)

**Priority: LOW**

1. **Connect to auth service**
   - Wire up [`src/services/authService.js`](src/services/authService.js)
   - Handle OAuth redirects
   - Manage auth state persistence

2. **Handle edge cases**
   - Network timeout states
   - Invalid credentials
   - Account locked scenarios
   - Email verification flow

3. **Performance optimization**
   - Lazy load auth components
   - Optimize animation frame rates
   - Reduce bundle size (tree-shake unused utilities)

**Validation:**
- [ ] Auth flow completes successfully
- [ ] Error states handled gracefully
- [ ] Performance budget met (<200kb initial bundle)
- [ ] Lighthouse mobile score >90

---

## Summary

This document provides comprehensive Tailwind CSS v4 utility mappings for implementing a mobile-first authentication flow in SwitchFit. Key achievements:

✅ **Layout scaffolding** with safe-area awareness and platform detection  
✅ **Touch-optimized components** meeting WCAG 2.5.5 touch target guidelines  
✅ **Consistent design system** leveraging existing OKLCH color tokens  
✅ **Reusable compositions** via `@apply` for frequently used patterns  
✅ **Responsive breakpoints** aligned with mobile-first philosophy  
✅ **Accessibility-first** approach with focus rings, ARIA support, reduced motion  

**Next Steps:**
1. Implement Phase 1 core layout utilities
2. Create component compositions in main.css
3. Build MobileAuthMethods.vue with staggered animations
4. Validate on physical devices (iOS/Android)

All utilities reference existing theme tokens from [`src/assets/styles/main.css`](src/assets/styles/main.css) to ensure visual consistency with the established SwitchFit design system.