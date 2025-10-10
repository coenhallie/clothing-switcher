<template>
  <!-- Backdrop overlay with blur -->
  <Transition name="backdrop">
    <div
      v-if="isOpen"
      class="profile-sheet__backdrop"
      @click="handleBackdropClick"
      aria-hidden="true"
    ></div>
  </Transition>

  <!-- Bottom Sheet -->
  <Transition name="sheet">
    <div
      v-if="isOpen"
      ref="sheetRef"
      class="profile-sheet"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-sheet-title"
      :style="{ transform: `translateY(${dragOffset}px)` }"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- Drag handle indicator -->
      <div class="profile-sheet__handle-container">
        <div class="profile-sheet__handle" aria-hidden="true"></div>
      </div>

      <!-- Header with user info -->
      <div class="profile-sheet__header">
        <div class="profile-sheet__avatar">
          <span class="profile-sheet__avatar-text">{{ avatarInitials }}</span>
        </div>
        <div class="profile-sheet__user-info">
          <h2 id="profile-sheet-title" class="profile-sheet__name">{{ userName }}</h2>
          <p class="profile-sheet__role">Dashboard access</p>
        </div>
      </div>

      <!-- Credit balance display -->
      <div class="profile-sheet__credits">
        <div class="profile-sheet__credits-icon">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 6v6l4 2" stroke-linecap="round" />
          </svg>
        </div>
        <div class="profile-sheet__credits-info">
          <p class="profile-sheet__credits-label">Available credits</p>
          <p class="profile-sheet__credits-value">{{ credits }}</p>
        </div>
      </div>

      <!-- Action buttons -->
      <nav class="profile-sheet__actions" aria-label="Account actions">
        <button
          @click="handlePurchaseCredits"
          class="profile-sheet__action-btn"
          aria-label="Purchase more credits"
        >
          <div class="profile-sheet__action-icon profile-sheet__action-icon--primary">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v8m-4-4h8" stroke-linecap="round" />
            </svg>
          </div>
          <div class="profile-sheet__action-content">
            <span class="profile-sheet__action-title">Purchase credits</span>
            <span class="profile-sheet__action-description">Add more to your balance</span>
          </div>
          <svg class="profile-sheet__action-chevron" fill="none" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <button
          @click="handleSettings"
          class="profile-sheet__action-btn"
          aria-label="Open settings"
        >
          <div class="profile-sheet__action-icon">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 3v2m6.4 1.6l-1.4 1.4M21 12h-2m-1.6 6.4l-1.4-1.4M12 21v-2m-6.4-1.6l1.4-1.4M3 12h2m1.6-6.4l1.4 1.4" stroke-linecap="round" />
            </svg>
          </div>
          <div class="profile-sheet__action-content">
            <span class="profile-sheet__action-title">Settings</span>
            <span class="profile-sheet__action-description">Manage your account</span>
          </div>
          <svg class="profile-sheet__action-chevron" fill="none" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <button
          @click="handleThemeToggle"
          class="profile-sheet__action-btn"
          aria-label="Change theme"
        >
          <div class="profile-sheet__action-icon">
            <svg v-if="resolvedTheme === 'dark'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79Z" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 4V3M12 21v-1M4 12H3M21 12h-1M6.34 6.34 5.63 5.63M18.37 18.37l-.71-.71M6.34 17.66l-.71.71M18.37 5.63l-.71.71" stroke-linecap="round" />
            </svg>
          </div>
          <div class="profile-sheet__action-content">
            <span class="profile-sheet__action-title">Theme</span>
            <span class="profile-sheet__action-description">{{ themeLabelMap[theme] }}</span>
          </div>
          <svg class="profile-sheet__action-chevron" fill="none" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </nav>

      <!-- Sign out button -->
      <div class="profile-sheet__footer">
        <button
          @click="handleSignOut"
          class="profile-sheet__signout-btn"
          aria-label="Sign out of your account"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M9 6 5 6 5 18 9 18" stroke-linecap="round" />
            <path d="M13 12h8m0 0-3-3m3 3-3 3" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTauriPlugins } from '@/composables/useTauriPlugins';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  userName: {
    type: String,
    default: 'User',
  },
  avatarInitials: {
    type: String,
    default: 'SF',
  },
  credits: {
    type: Number,
    default: 0,
  },
  theme: {
    type: String,
    default: 'system',
  },
  resolvedTheme: {
    type: String,
    default: 'light',
  },
});

const emit = defineEmits([
  'close',
  'purchase-credits',
  'theme-toggle',
  'sign-out',
]);

const router = useRouter();
const { triggerHaptic } = useTauriPlugins();
const sheetRef = ref(null);
const dragOffset = ref(0);
const isDragging = ref(false);
const startY = ref(0);
const startTime = ref(0);

const themeLabelMap = {
  light: 'Light mode',
  dark: 'Dark mode',
  system: 'System default',
};

// Close threshold - sheet closes if dragged down more than this
const CLOSE_THRESHOLD = 150;
// Velocity threshold for quick swipe dismiss
const VELOCITY_THRESHOLD = 0.5;

const handleBackdropClick = () => {
  closeSheet();
};

const handlePurchaseCredits = () => {
  triggerHaptic('impact', 'medium');
  emit('purchase-credits');
  closeSheet();
};

const handleSettings = () => {
  triggerHaptic('impact', 'light');
  router.push('/settings');
  closeSheet();
};

const handleThemeToggle = () => {
  triggerHaptic('selection');
  emit('theme-toggle');
};

const handleSignOut = () => {
  triggerHaptic('impact', 'heavy');
  emit('sign-out');
  closeSheet();
};

const closeSheet = () => {
  triggerHaptic('impact', 'medium');
  emit('close');
  // Reset drag state
  dragOffset.value = 0;
  isDragging.value = false;
};

// Touch gesture handlers for swipe-to-dismiss
const handleTouchStart = (e) => {
  if (e.target.closest('.profile-sheet__handle-container')) {
    triggerHaptic('impact', 'light');
    isDragging.value = true;
    startY.value = e.touches[0].clientY;
    startTime.value = Date.now();
  }
};

const handleTouchMove = (e) => {
  if (!isDragging.value) return;

  const currentY = e.touches[0].clientY;
  const diff = currentY - startY.value;

  // Only allow dragging down
  if (diff > 0) {
    dragOffset.value = diff;
    // Prevent body scroll while dragging
    e.preventDefault();
  }
};

const handleTouchEnd = () => {
  if (!isDragging.value) return;

  const endTime = Date.now();
  const timeDiff = endTime - startTime.value;
  const velocity = dragOffset.value / timeDiff;

  // Close if dragged beyond threshold OR quick swipe down
  if (dragOffset.value > CLOSE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
    closeSheet();
  } else {
    // Snap back to original position - haptic feedback for snap
    triggerHaptic('impact', 'light');
    dragOffset.value = 0;
  }

  isDragging.value = false;
};

// Handle escape key
const handleKeyDown = (e) => {
  if (e.key === 'Escape' && props.isOpen) {
    closeSheet();
  }
};

// Prevent body scroll when sheet is open
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    triggerHaptic('impact', 'medium');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
  } else {
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleKeyDown);
  }
});

onUnmounted(() => {
  document.body.style.overflow = '';
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
/* Backdrop */
.profile-sheet__backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Bottom Sheet Container */
.profile-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 101;
  max-height: 85vh;
  background: var(--color-surface);
  border-radius: 1.5rem 1.5rem 0 0;
  box-shadow: 0 -8px 32px -8px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  /* Support safe area for devices with notches/home indicators */
  padding-bottom: env(safe-area-inset-bottom);
}

/* Drag Handle */
.profile-sheet__handle-container {
  display: flex;
  justify-content: center;
  padding: 0.75rem 0 0.5rem;
  cursor: grab;
  -webkit-tap-highlight-color: transparent;
}

.profile-sheet__handle-container:active {
  cursor: grabbing;
}

.profile-sheet__handle {
  width: 2.5rem;
  height: 0.25rem;
  background: color-mix(in oklch, var(--color-muted-foreground) 30%, transparent);
  border-radius: 999px;
}

/* Header */
.profile-sheet__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem 1rem;
  border-bottom: 1px solid var(--color-border);
}

.profile-sheet__avatar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    color-mix(in oklch, var(--color-brand-500) 35%, transparent),
    color-mix(in oklch, var(--color-brand-600) 25%, transparent)
  );
  box-shadow: 0 4px 12px -4px rgba(99, 102, 241, 0.3);
}

.profile-sheet__avatar-text {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-brand-700);
  text-transform: uppercase;
}

.profile-sheet__user-info {
  flex: 1;
  min-width: 0;
}

.profile-sheet__name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-card-foreground);
  margin: 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-sheet__role {
  font-size: 0.875rem;
  color: var(--color-muted-foreground);
  margin: 0.125rem 0 0;
}

/* Credits Display */
.profile-sheet__credits {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1rem 1.5rem;
  padding: 1rem;
  background: linear-gradient(
    135deg,
    color-mix(in oklch, var(--color-brand-500) 15%, transparent),
    color-mix(in oklch, var(--color-brand-600) 8%, transparent)
  );
  border: 1px solid color-mix(in oklch, var(--color-brand-500) 30%, transparent);
  border-radius: 1rem;
}

.profile-sheet__credits-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: var(--color-brand-500);
  color: white;
}

.profile-sheet__credits-info {
  flex: 1;
}

.profile-sheet__credits-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-muted-foreground);
  margin: 0;
}

.profile-sheet__credits-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-brand-700);
  margin: 0.125rem 0 0;
}

/* Action Buttons */
.profile-sheet__actions {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.profile-sheet__action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent;
  text-align: left;
  width: 100%;
  /* Minimum touch target size for accessibility */
  min-height: 3.5rem;
}

.profile-sheet__action-btn:active {
  transform: scale(0.98);
  background: color-mix(in oklch, var(--color-brand-500) 8%, transparent);
  border-color: color-mix(in oklch, var(--color-brand-500) 40%, transparent);
}

.profile-sheet__action-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: color-mix(in oklch, var(--color-muted) 50%, transparent);
  color: var(--color-card-foreground);
  transition: all 0.2s;
}

.profile-sheet__action-icon--primary {
  background: color-mix(in oklch, var(--color-brand-500) 20%, transparent);
  color: var(--color-brand-700);
}

.profile-sheet__action-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.profile-sheet__action-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-card-foreground);
  display: block;
}

.profile-sheet__action-description {
  font-size: 0.8125rem;
  color: var(--color-muted-foreground);
  display: block;
}

.profile-sheet__action-chevron {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-muted-foreground);
  transition: transform 0.2s;
}

.profile-sheet__action-btn:active .profile-sheet__action-chevron {
  transform: translateX(0.25rem);
}

/* Footer */
.profile-sheet__footer {
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid var(--color-border);
}

.profile-sheet__signout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem;
  background: transparent;
  border: 1px solid color-mix(in oklch, var(--color-destructive-500) 40%, transparent);
  border-radius: 1rem;
  color: var(--color-destructive-500);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent;
  min-height: 3.5rem;
}

.profile-sheet__signout-btn:active {
  transform: scale(0.98);
  background: color-mix(in oklch, var(--color-destructive-500) 12%, transparent);
}

/* Animations */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.sheet-enter-active {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

.sheet-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 1, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  transform: translateY(100%);
}

/* Dark mode adjustments */
.dark .profile-sheet {
  background: color-mix(in oklch, var(--color-surface) 98%, transparent);
  box-shadow: 0 -8px 48px -8px rgba(0, 0, 0, 0.4);
}

.dark .profile-sheet__backdrop {
  background: rgba(0, 0, 0, 0.6);
}
</style>