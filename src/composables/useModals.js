import { ref } from 'vue';

// Global modal state
const isAuthModalOpen = ref(false);
const isPurchaseModalOpen = ref(false);
const isWelcomeModalOpen = ref(false);
const authModalMode = ref('login'); // 'login' or 'signup'

// LocalStorage key for welcome modal
const WELCOME_MODAL_DISMISSED_KEY = 'switchfit_welcome_modal_dismissed';

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

  const openWelcomeModal = () => {
    isWelcomeModalOpen.value = true;
  };

  const closeWelcomeModal = () => {
    isWelcomeModalOpen.value = false;
    // Mark as dismissed in localStorage
    localStorage.setItem(WELCOME_MODAL_DISMISSED_KEY, 'true');
  };

  const shouldShowWelcomeModal = () => {
    // Check if the modal has been dismissed before
    return !localStorage.getItem(WELCOME_MODAL_DISMISSED_KEY);
  };

  return {
    // State
    isAuthModalOpen,
    isPurchaseModalOpen,
    isWelcomeModalOpen,
    authModalMode,

    // Actions
    openAuthModal,
    closeAuthModal,
    openPurchaseModal,
    closePurchaseModal,
    openWelcomeModal,
    closeWelcomeModal,
    shouldShowWelcomeModal,
  };
}
