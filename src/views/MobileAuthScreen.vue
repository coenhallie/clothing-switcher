<template>
  <div class="mobile-auth-container h-screen flex flex-col overflow-hidden">
    <!-- Header with Brand Name -->
    <header class="mobile-section pt-6 pb-4">
      <div class="text-center">
        <img
          :src="currentLogo"
          alt="SwitchFit"
          class="w-24 h-24 mx-auto"
        />
      </div>
    </header>

    <!-- Main Content Area - scrollable if needed but optimized to fit -->
    <main class="flex-1 mobile-section overflow-y-auto">
      <div class="h-full flex flex-col justify-center py-4">
        <!-- Landing View with Direct Auth Options -->
        <MobileAuthLanding
          @google-auth-initiated="handleGoogleAuthInitiated"
          @magic-link-sent="handleMagicLinkSent"
        />
      </div>
    </main>

    <!-- Footer Actions -->
    <footer class="mobile-section sticky bottom-0 pb-safe">
      <slot name="actions">
        <!-- Default actions slot - can be overridden per step -->
      </slot>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useTheme } from '@/composables/useTheme'
import MobileAuthLanding from '@/components/auth/MobileAuthLanding.vue'
import logoBlack from '@/assets/images/logo-switchfit-black.png'
import logoWhite from '@/assets/images/logo-switchfit-white.png'


const emit = defineEmits(['close', 'google-auth-initiated', 'magic-link-sent'])

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { isDark } = useTheme()

/**
 * Computed property to select the appropriate logo based on current theme
 */
const currentLogo = computed(() => isDark.value ? logoWhite : logoBlack)

/**
 * Handles Google OAuth initiation
 */
const handleGoogleAuthInitiated = () => {
  console.log('[MobileAuthScreen] Google auth initiated')
  emit('google-auth-initiated')
  // OAuth redirect will happen automatically
  // The callback will be handled by AuthCallback.vue
}

/**
 * Handles magic link sent successfully
 * @param {string} email - Email where magic link was sent
 */
const handleMagicLinkSent = (email) => {
  console.log('[MobileAuthScreen] Magic link sent to:', email)
  emit('magic-link-sent', email)
  // Success message is displayed in the component
}

/**
 * Check if user is already authenticated on mount
 * Redirect to intended destination if they are
 */
onMounted(async () => {
  if (authStore.isAuthenticated) {
    console.log('[MobileAuthScreen] User already authenticated, redirecting...')
    const redirectPath = route.query.redirect || '/'
    router.push(redirectPath)
  }
})

/**
 * Handles closing the auth flow
 */
const handleClose = () => {
  // Navigate back to home if user closes auth screen
  router.push('/')
  emit('close')
}

// Expose methods for parent component control
defineExpose({
  handleClose
})
</script>

<style scoped>
/* Additional mobile-specific styles if needed beyond Tailwind utilities */
</style>