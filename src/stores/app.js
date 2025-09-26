import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAppStore = defineStore('app', () => {
  // State
  const isLoading = ref(false);
  const loadingMessage = ref('');
  const toasts = ref([]);
  const user = ref(null);
  const theme = ref('system');
  const resolvedTheme = ref('light');

  // Toast management
  let toastId = 0;

  const addToast = (toast) => {
    const id = ++toastId;
    const newToast = {
      id,
      type: toast.type || 'info',
      title: toast.title,
      message: toast.message || '',
      duration: toast.duration || 5000,
    };

    toasts.value.push(newToast);

    // Auto remove toast after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  };

  const removeToast = (id) => {
    const index = toasts.value.findIndex((toast) => toast.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  const clearToasts = () => {
    toasts.value = [];
  };

  // Loading management
  const setLoading = (loading, message = '') => {
    isLoading.value = loading;
    loadingMessage.value = message;
  };

  // Theme management
  let themeMediaQuery = null;

  const evaluateTheme = (targetTheme = theme.value) => {
    if (typeof window === 'undefined') return targetTheme;
    if (targetTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return targetTheme;
  };

  const applyTheme = (targetTheme = theme.value) => {
    if (typeof document === 'undefined') return;
    const resolved = evaluateTheme(targetTheme);
    resolvedTheme.value = resolved;
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  };

  const setTheme = (value) => {
    theme.value = value;
    localStorage.setItem('app_theme', value);
    applyTheme(value);
  };

  const loadTheme = () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('app_theme');
    if (stored) {
      theme.value = stored;
    }
    applyTheme(theme.value);

    if (!themeMediaQuery) {
      themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      themeMediaQuery.addEventListener('change', handleSystemThemeChange);
    }
  };

  const handleSystemThemeChange = () => {
    if (theme.value === 'system') {
      applyTheme('system');
    }
  };

  const teardownThemeWatcher = () => {
    if (themeMediaQuery) {
      themeMediaQuery.removeEventListener('change', handleSystemThemeChange);
      themeMediaQuery = null;
    }
  };

  // User management
  const setUser = (userData) => {
    user.value = userData;
  };

  // Computed
  const isAuthenticated = computed(() => !!user.value);

  // Initialize store
  const initialize = () => {
    loadTheme();
  };

  return {
    // State
    isLoading,
    loadingMessage,
    toasts,
    user,
    theme,
    resolvedTheme,

    // Getters
    isAuthenticated,

    // Actions
    addToast,
    removeToast,
    clearToasts,
    setLoading,
    setTheme,
    loadTheme,
    teardownThemeWatcher,
    setUser,
    initialize,
  };
});
