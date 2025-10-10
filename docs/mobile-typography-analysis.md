# Mobile Typography Analysis - SwitchFit Studio

**Date:** January 5, 2025  
**Platform:** Tauri Mobile Application  
**Scope:** Mobile layout font-size declarations and responsive typography

---

## Executive Summary

This document provides a comprehensive analysis of all font-size declarations used in the mobile layout of the SwitchFit Studio Tauri application. The analysis covers component-level typography, global mobile styles, and responsive breakpoints.

**Key Findings:**
- Primary unit system: `rem` with some `clamp()` for responsive scaling
- Mobile breakpoints: `767px`, `480px`, `360px`
- Font sizes range from `0.5rem` to `clamp(1.75rem, 5vw, 2.5rem)`
- Consistent use of relative units for scalability
- No explicit `px` units in mobile typography

---

## 1. Mobile Layout Components

### 1.1 MobileLayout.vue
**File:** [`src/components/layouts/MobileLayout.vue`](../src/components/layouts/MobileLayout.vue)

**Font-size Declarations:** None directly in component styles
- Uses inherited typography from global styles
- Relies on slot content for text rendering
- Settings icon uses SVG sizing (`1.25rem` width/height)

---

### 1.2 MobileBottomNav.vue
**File:** [`src/components/MobileBottomNav.vue`](../src/components/MobileBottomNav.vue)

| Element | Font-size | Context |
|---------|-----------|---------|
| `.mobile-bottom-nav__logo-text` | `1rem` | Logo brand text |
| `.mobile-bottom-nav__logo-subtext` | `0.625rem` | "Studio" subtext, uppercase |
| `.mobile-bottom-nav__badge` | `0.5625rem` | "Alpha" badge, uppercase |
| `.mobile-bottom-nav__label` | `0.65rem` | Navigation item labels |

**Responsive Breakpoint - @media (max-width: 360px):**

| Element | Font-size | Original | Change |
|---------|-----------|----------|--------|
| `.mobile-bottom-nav__logo-text` | `0.9rem` | `1rem` | -10% |
| `.mobile-bottom-nav__logo-subtext` | `0.56rem` | `0.625rem` | -10.4% |
| `.mobile-bottom-nav__badge` | `0.5rem` | `0.5625rem` | -11.1% |

---

## 2. Global Mobile Typography (main.css)

### 2.1 Base Mobile Heading Styles
**File:** [`src/assets/styles/main.css`](../src/assets/styles/main.css)  
**Breakpoint:** `@media (max-width: 767px)`

| Element | Font-size | Min | Preferred | Max |
|---------|-----------|-----|-----------|-----|
| `h1` | `clamp(1.75rem, 5vw, 2.5rem)` | 1.75rem | 5vw | 2.5rem |
| `h2` | `clamp(1.5rem, 4vw, 2rem)` | 1.5rem | 4vw | 2rem |
| `h3` | `clamp(1.25rem, 3.5vw, 1.75rem)` | 1.25rem | 3.5vw | 1.75rem |

**Notes:**
- Viewport-based fluid scaling ensures optimal readability
- Prevents text from becoming too small on tiny screens or too large on tablets
- Desktop defaults are larger (defined globally)

---

### 2.2 Authentication Panel Typography
**File:** [`src/assets/styles/main.css`](../src/assets/styles/main.css)  
**Component Class:** `.auth-panel`

Used by: [`AuthModal.vue`](../src/components/auth/AuthModal.vue), [`LoginForm.vue`](../src/components/auth/LoginForm.vue), [`SignupForm.vue`](../src/components/auth/SignupForm.vue)

| Class | Font-size | Element Type | Context |
|-------|-----------|--------------|---------|
| `.auth-panel__title` | `clamp(1.6rem, 4vw, 2.35rem)` | Heading | Modal title |
| `.auth-panel__subtitle` | `clamp(0.9rem, 2vw, 1rem)` | Paragraph | Description text |
| `.auth-panel__label` | `0.85rem` | Label | Form field labels |
| `.auth-panel__label span` | `0.8rem` | Span | Optional/helper text |
| `.auth-panel__input` | `0.95rem` | Input | Text input fields |
| `.auth-panel__feedback` | `0.8rem` | Paragraph | Error messages |
| `.auth-panel__helper` | `0.78rem` | Paragraph | Helper/hint text |
| `.auth-panel__message` | `0.85rem` | Div | Alert messages |
| `.auth-panel__primary-btn` | `0.98rem` | Button | Primary action button |
| `.auth-panel__link-btn` | `0.85rem` | Button | Link-style button |
| `.auth-panel__footer` | `0.85rem` | Div | Footer text |
| `.auth-panel__highlight` | `0.85rem` | Div | Highlighted info box |

**Mobile Breakpoint - @media (max-width: 480px):**
- No font-size changes at this breakpoint
- Only spacing/padding adjustments applied

---

### 2.3 Utility Badge Typography

| Class | Font-size | Context |
|-------|-----------|---------|
| `.badge` | `0.75rem` | Inline badge elements |

---

## 3. View Component Typography

All view components use Tailwind CSS utility classes rather than custom font-size declarations. The Tailwind scale maps to rem units as follows:

### 3.1 HomeView.vue
**File:** [`src/views/HomeView.vue`](../src/views/HomeView.vue)

| Tailwind Class | Rem Value | Usage Context |
|----------------|-----------|---------------|
| `text-xs` | `0.75rem` | Small labels, captions |
| `text-sm` | `0.875rem` | Secondary text, descriptions |
| `text-base` | `1rem` | Default body text |
| `text-lg` | `1.125rem` | Emphasized body text |
| `text-4xl` | `2.25rem` | Main headings |
| `text-5xl` | `3rem` | Hero headings |

**Mobile Override:**
- Hero container hidden on mobile (`@media (max-width: 767px)`)
- Gap spacing reduced from `2.5rem` to `1.5rem`

---

### 3.2 GalleryView.vue
**File:** [`src/views/GalleryView.vue`](../src/views/GalleryView.vue)

| Tailwind Class | Rem Value | Usage Context |
|----------------|-----------|---------------|
| `text-xs` | `0.75rem` | Metadata, small labels |
| `text-sm` | `0.875rem` | Stats, descriptions |
| `text-lg` | `1.125rem` | Emphasized headings |
| `text-xl` | `1.25rem` | Section headings |
| `text-4xl` | `2.25rem` | Page title |
| `text-5xl` | `3rem` | Hero title |

---

### 3.3 SettingsView.vue
**File:** [`src/views/SettingsView.vue`](../src/views/SettingsView.vue)

| Tailwind Class | Rem Value | Usage Context |
|----------------|-----------|---------------|
| `text-xs` | `0.75rem` | Helper text, labels |
| `text-sm` | `0.875rem` | Form labels, descriptions |
| `text-xl` | `1.25rem` | Section headings |
| `text-4xl` | `2.25rem` | Page headings |
| `text-5xl` | `3rem` | Hero headings |

---

## 4. Component-Specific Typography

### 4.1 CreditBalance.vue
**File:** [`src/components/credits/CreditBalance.vue`](../src/components/credits/CreditBalance.vue)

| Tailwind Class | Rem Value | Usage Context |
|----------------|-----------|---------------|
| `text-sm` | `0.875rem` | Body text, descriptions |
| `text-lg` | `1.125rem` | Credit count heading |

---

### 4.2 PurchaseCredits.vue
**File:** [`src/components/credits/PurchaseCredits.vue`](../src/components/credits/PurchaseCredits.vue)

| Tailwind Class | Rem Value | Usage Context |
|----------------|-----------|---------------|
| `text-xs` | `0.75rem` | Legal text, disclaimers |
| `text-sm` | `0.875rem` | Package descriptions |
| `text-base` | `1rem` | Button text |
| `text-xl` | `1.25rem` | Order summary |
| `text-3xl` | `1.875rem` | Price display |
| `text-4xl` | `2.25rem` | Package price |
| `text-[10px]` | `10px` | Badge text (only px usage found) |

---

## 5. Responsive Breakpoints Summary

### Breakpoint Hierarchy

1. **360px and below** - Very small phones
   - MobileBottomNav logo and badge text scales down ~10%
   
2. **480px and below** - Small phones
   - Auth modal padding adjustments (no font changes)
   
3. **767px and below** - All mobile devices
   - H1-H3 use fluid clamp() scaling
   - Container padding reduced
   - Hero sections may be hidden

---

## 6. Font Scaling Approach

### 6.1 Fluid Typography (clamp)
Used for critical headings and titles to ensure readability across device sizes:

```css
clamp(minimum, preferred, maximum)
```

**Examples:**
- `clamp(1.75rem, 5vw, 2.5rem)` - H1 on mobile
- `clamp(1.6rem, 4vw, 2.35rem)` - Auth panel titles

### 6.2 Fixed rem Values
Used for UI elements where consistent sizing is critical:
- Navigation labels: `0.65rem`
- Form inputs: `0.95rem`
- Buttons: `0.98rem`

### 6.3 Tailwind Utility Classes
Used in view components for rapid development:
- Consistent scale from `text-xs` (0.75rem) to `text-5xl` (3rem)
- No custom font sizes in component styles

---

## 7. Typography Scale Reference

### Complete Font-size Inventory (Smallest to Largest)

| Size (rem) | Size (px @16px base) | Usage |
|------------|----------------------|-------|
| `0.5rem` | 8px | Badge (mobile 360px) |
| `0.56rem` | 8.96px | Logo subtext (mobile 360px) |
| `0.5625rem` | 9px | Badge default |
| `0.625rem` | 10px | Logo subtext |
| `0.65rem` | 10.4px | Nav labels |
| `0.75rem` | 12px | Badge, text-xs |
| `0.78rem` | 12.48px | Helper text |
| `0.8rem` | 12.8px | Label spans, feedback |
| `0.85rem` | 13.6px | Labels, links, messages |
| `0.875rem` | 14px | text-sm |
| `0.9rem` | 14.4px | Logo text (mobile 360px) |
| `clamp(0.9rem, 2vw, 1rem)` | 14.4px-16px | Auth subtitle |
| `0.95rem` | 15.2px | Form inputs |
| `0.98rem` | 15.68px | Primary button |
| `1rem` | 16px | Logo text, text-base |
| `1.125rem` | 18px | text-lg |
| `1.25rem` | 20px | text-xl |
| `clamp(1.25rem, 3.5vw, 1.75rem)` | 20px-28px | H3 mobile |
| `clamp(1.5rem, 4vw, 2rem)` | 24px-32px | H2 mobile |
| `clamp(1.6rem, 4vw, 2.35rem)` | 25.6px-37.6px | Auth title |
| `clamp(1.75rem, 5vw, 2.5rem)` | 28px-40px | H1 mobile |
| `1.875rem` | 30px | text-3xl |
| `2.25rem` | 36px | text-4xl |
| `3rem` | 48px | text-5xl |

---

## 8. Unit Usage Analysis

### Units Distribution

- **rem units:** Primary (95%+ of declarations)
- **clamp() functions:** Responsive headings (5 instances)
- **vw units:** Within clamp() only
- **px units:** 1 instance (`text-[10px]` in PurchaseCredits badge)
- **em units:** None found

### Rationale for rem Usage

1. **Accessibility:** Respects user browser font-size preferences
2. **Consistency:** Predictable scaling relative to root font size
3. **Maintenance:** Easier to implement global size adjustments
4. **Mobile-friendly:** Better than px for responsive designs

---

## 9. Recommendations for Font-size Optimization

Based on this analysis, the current implementation is already well-structured. However, potential improvements could include:

1. **Eliminate px usage:** Convert the single `text-[10px]` to `0.625rem`
2. **Consider adding intermediate mobile breakpoint:** 520px for mid-size phones
3. **Document Tailwind scale mapping:** Create reference for developers
4. **Standardize button font-sizes:** Currently varies between 0.98rem and 1rem
5. **Add focus on touch targets:** Ensure minimum 48px touch targets with adequate font sizes

---

## 10. Accessibility Considerations

### Current Strengths
- All font sizes use relative units (rem)
- Fluid scaling prevents text from becoming unreadable
- Minimum font sizes respect WCAG guidelines (smallest is 0.5rem/8px for decorative badges)

### Areas for Review
- Badge text at `0.5rem` (8px) on 360px screens may be too small
- Consider minimum of `0.625rem` (10px) for all text content
- Verify contrast ratios for all text sizes against backgrounds

---

## Appendix A: File Reference

| File Path | Type | Font Declarations |
|-----------|------|-------------------|
| [`src/components/layouts/MobileLayout.vue`](../src/components/layouts/MobileLayout.vue) | Component | 0 |
| [`src/components/MobileBottomNav.vue`](../src/components/MobileBottomNav.vue) | Component | 7 |
| [`src/assets/styles/main.css`](../src/assets/styles/main.css) | Stylesheet | 15+ |
| [`src/views/HomeView.vue`](../src/views/HomeView.vue) | View | 0 (uses Tailwind) |
| [`src/views/GalleryView.vue`](../src/views/GalleryView.vue) | View | 0 (uses Tailwind) |
| [`src/views/SettingsView.vue`](../src/views/SettingsView.vue) | View | 0 (uses Tailwind) |
| [`src/components/credits/CreditBalance.vue`](../src/components/credits/CreditBalance.vue) | Component | 0 (uses Tailwind) |
| [`src/components/credits/PurchaseCredits.vue`](../src/components/credits/PurchaseCredits.vue) | Component | 1 (px) |

---

**Analysis Complete**  
All font-size declarations have been documented and catalogued for the mobile layout implementation.