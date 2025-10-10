import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable for detecting and watching theme changes
 * Detects dark mode based on the 'dark' class on document.documentElement
 * 
 * @returns {Object} { isDark: Ref<boolean> } - Reactive dark mode state
 */
export function useTheme() {
  const isDark = ref(false)
  let observer = null

  /**
   * Check if dark mode is currently active
   */
  const checkDarkMode = () => {
    isDark.value = document.documentElement.classList.contains('dark')
  }

  onMounted(() => {
    // Initial check
    checkDarkMode()

    // Watch for class changes on document.documentElement
    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          checkDarkMode()
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    isDark
  }
}