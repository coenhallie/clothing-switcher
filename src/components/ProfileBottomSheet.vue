<template>
  <!-- Backdrop -->
  <Transition name="backdrop">
    <div
      v-if="isOpen"
      class="profile-sheet__backdrop"
      @click="handleBackdropClick"
      aria-hidden="true"
    ></div>
  </Transition>

  <!-- Sheet -->
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
      <!-- Handle -->
      <div class="profile-sheet__handle-container">
        <div class="profile-sheet__handle"></div>
      </div>

      <!-- User -->
      <div class="profile-sheet__header">
        <div class="profile-sheet__avatar">
          <span class="profile-sheet__avatar-text">{{ avatarInitials }}</span>
        </div>
        <div class="profile-sheet__user-info">
          <h2 id="profile-sheet-title" class="profile-sheet__name">{{ userName }}</h2>
          <p class="profile-sheet__role">{{ credits }} credits</p>
        </div>
      </div>

      <!-- Actions -->
      <nav class="profile-sheet__actions">
        <button @click="handlePurchaseCredits" class="profile-sheet__action-btn">
          <div class="profile-sheet__action-icon">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v8m-4-4h8" stroke-linecap="round" />
            </svg>
          </div>
          <span class="profile-sheet__action-title">Purchase credits</span>
          <svg class="profile-sheet__chevron" fill="none" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <button @click="handleSettings" class="profile-sheet__action-btn">
          <div class="profile-sheet__action-icon">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 3v2m6.4 1.6l-1.4 1.4M21 12h-2m-1.6 6.4l-1.4-1.4M12 21v-2m-6.4-1.6l1.4-1.4M3 12h2m1.6-6.4l1.4 1.4" stroke-linecap="round" />
            </svg>
          </div>
          <span class="profile-sheet__action-title">Settings</span>
          <svg class="profile-sheet__chevron" fill="none" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <button @click="handleThemeToggle" class="profile-sheet__action-btn">
          <div class="profile-sheet__action-icon">
            <svg v-if="resolvedTheme === 'dark'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79Z" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 4V3M12 21v-1M4 12H3M21 12h-1M6.34 6.34 5.63 5.63M18.37 18.37l-.71-.71M6.34 17.66l-.71.71M18.37 5.63l-.71.71" stroke-linecap="round" />
            </svg>
          </div>
          <span class="profile-sheet__action-title">{{ themeLabelMap[theme] }}</span>
          <svg class="profile-sheet__chevron" fill="none" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </nav>

      <!-- Sign out -->
      <div class="profile-sheet__footer">
        <button @click="handleSignOut" class="profile-sheet__signout-btn">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
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
import { ref, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTauriPlugins } from '@/composables/useTauriPlugins';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  userName: { type: String, default: 'User' },
  avatarInitials: { type: String, default: 'SF' },
  credits: { type: Number, default: 0 },
  theme: { type: String, default: 'system' },
  resolvedTheme: { type: String, default: 'light' },
});

const emit = defineEmits(['close', 'purchase-credits', 'theme-toggle', 'sign-out']);

const router = useRouter();
const { triggerHaptic } = useTauriPlugins();
const sheetRef = ref(null);
const dragOffset = ref(0);
const isDragging = ref(false);
const startY = ref(0);
const startTime = ref(0);

const themeLabelMap = { light: 'Light', dark: 'Dark', system: 'System' };
const CLOSE_THRESHOLD = 150;
const VELOCITY_THRESHOLD = 0.5;

const handleBackdropClick = () => closeSheet();

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
  dragOffset.value = 0;
  isDragging.value = false;
};

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
  const diff = e.touches[0].clientY - startY.value;
  if (diff > 0) { dragOffset.value = diff; e.preventDefault(); }
};

const handleTouchEnd = () => {
  if (!isDragging.value) return;
  const velocity = dragOffset.value / (Date.now() - startTime.value);
  if (dragOffset.value > CLOSE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
    closeSheet();
  } else {
    triggerHaptic('impact', 'light');
    dragOffset.value = 0;
  }
  isDragging.value = false;
};

const handleKeyDown = (e) => {
  if (e.key === 'Escape' && props.isOpen) closeSheet();
};

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
.profile-sheet__backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.35);
}

.profile-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 101;
  max-height: 80vh;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  border-radius: 1rem 1rem 0 0;
  box-shadow: 0 -4px 24px -4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom);
}

.profile-sheet__handle-container {
  display: flex;
  justify-content: center;
  padding: 0.625rem 0 0.375rem;
  cursor: grab;
}

.profile-sheet__handle-container:active {
  cursor: grabbing;
}

.profile-sheet__handle {
  width: 2rem;
  height: 3px;
  background: var(--color-border);
  border-radius: 999px;
}

.profile-sheet__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1.25rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.profile-sheet__avatar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--color-muted);
}

.profile-sheet__avatar-text {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-card-foreground);
  text-transform: uppercase;
}

.profile-sheet__user-info {
  flex: 1;
  min-width: 0;
}

.profile-sheet__name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-card-foreground);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-sheet__role {
  font-size: 0.75rem;
  color: var(--color-muted-foreground);
  margin: 0;
}

.profile-sheet__actions {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.profile-sheet__action-btn {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-align: left;
  width: 100%;
  min-height: 2.75rem;
  transition: border-color 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

.profile-sheet__action-btn:active {
  transform: scale(0.98);
  border-color: var(--color-muted-foreground);
}

.profile-sheet__action-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-sm);
  background: var(--color-muted);
  color: var(--color-card-foreground);
}

.profile-sheet__action-title {
  flex: 1;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-card-foreground);
}

.profile-sheet__chevron {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  color: var(--color-muted-foreground);
}

.profile-sheet__footer {
  padding: 0.5rem 1.25rem 1rem;
  border-top: 1px solid var(--color-border);
}

.profile-sheet__signout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: 1px solid oklch(0.58 0.22 27 / 0.15);
  border-radius: var(--radius-md);
  color: var(--color-destructive-500);
  font-size: 0.8125rem;
  font-weight: 500;
  min-height: 2.75rem;
  -webkit-tap-highlight-color: transparent;
}

.profile-sheet__signout-btn:active {
  transform: scale(0.98);
  background: oklch(0.58 0.22 27 / 0.04);
}

/* Transitions */
.backdrop-enter-active, .backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.backdrop-enter-from, .backdrop-leave-to {
  opacity: 0;
}

.sheet-enter-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-leave-active {
  transition: transform 0.2s cubic-bezier(0.4, 0, 1, 1);
}
.sheet-enter-from, .sheet-leave-to {
  transform: translateY(100%);
}
</style>
