/**
 * Composable for managing user menu state and interactions
 * Extracted from App.vue for better separation of concerns
 */

import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/authStore.js';
import { useCreditStore } from '../stores/creditStore.js';
import { storeToRefs } from 'pinia';

export function useUserMenu() {
  const authStore = useAuthStore();
  const creditStore = useCreditStore();

  const { isAuthenticated, userName } = storeToRefs(authStore);
  const { credits } = storeToRefs(creditStore);

  const showUserMenu = ref(false);
  const userMenuRef = ref(null);

  /**
   * Compute avatar initials from user name
   */
  const avatarInitials = computed(() => {
    if (!userName.value) return 'SF';
    return userName.value
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  });

  /**
   * Toggle user menu visibility
   */
  const toggleUserMenu = () => {
    showUserMenu.value = !showUserMenu.value;
  };

  /**
   * Close user menu
   */
  const closeUserMenu = () => {
    showUserMenu.value = false;
  };

  /**
   * Open user menu
   */
  const openUserMenu = () => {
    showUserMenu.value = true;
  };

  /**
   * Handle click outside user menu to close it
   * @param {Event} event - Click event
   */
  const handleClickOutside = (event) => {
    if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
      closeUserMenu();
    }
  };

  return {
    // State
    showUserMenu,
    userMenuRef,
    isAuthenticated,
    userName,
    credits,
    avatarInitials,

    // Actions
    toggleUserMenu,
    closeUserMenu,
    openUserMenu,
    handleClickOutside,
  };
}