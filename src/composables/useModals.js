import { ref } from 'vue';

// Global modal state
const isAuthModalOpen = ref(false);
const isPurchaseModalOpen = ref(false);
const authModalMode = ref('login'); // 'login' or 'signup'

export function useModals() {
  const openAuthModal = (mode = 'login') => {
    authModalMode.value = mode;
    isAuthModalOpen.value = true;
  };

  const closeAuthModal = () => {
    isAuthModalOpen.value = false;
  };

  const openPurchaseModal = () => {
    isPurchaseModalOpen.value = true;
  };

  const closePurchaseModal = () => {
    isPurchaseModalOpen.value = false;
  };

  return {
    // State
    isAuthModalOpen,
    isPurchaseModalOpen,
    authModalMode,

    // Actions
    openAuthModal,
    closeAuthModal,
    openPurchaseModal,
    closePurchaseModal,
  };
}
