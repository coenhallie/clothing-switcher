import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAppStore = defineStore('app', () => {
  // State
  const isLoading = ref(false);
  const loadingMessage = ref('');
  const toasts = ref([]);
  const user = ref(null);
  const apiKey = ref('');
  const provider = ref('openrouter'); // Default to OpenRouter

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

  // API Key management
  const setApiKey = (key) => {
    apiKey.value = key;
    localStorage.setItem('ai_api_key', key);
  };

  const loadApiKey = () => {
    const stored = localStorage.getItem('ai_api_key');
    if (stored) {
      apiKey.value = stored;
    }
  };

  // Provider management
  const setProvider = (providerName) => {
    provider.value = providerName;
    localStorage.setItem('ai_provider', providerName);
  };

  const loadProvider = () => {
    const stored = localStorage.getItem('ai_provider');
    if (stored) {
      provider.value = stored;
    }
  };

  // User management
  const setUser = (userData) => {
    user.value = userData;
  };

  // Computed
  const isAuthenticated = computed(() => !!user.value);
  const hasApiKey = computed(() => !!apiKey.value);

  // Initialize store
  const initialize = () => {
    loadApiKey();
    loadProvider();
  };

  return {
    // State
    isLoading,
    loadingMessage,
    toasts,
    user,
    apiKey,
    provider,

    // Getters
    isAuthenticated,
    hasApiKey,

    // Actions
    addToast,
    removeToast,
    clearToasts,
    setLoading,
    setApiKey,
    loadApiKey,
    setProvider,
    loadProvider,
    setUser,
    initialize,
  };
});
