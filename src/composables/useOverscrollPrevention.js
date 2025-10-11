/**
 * Composable for preventing overscroll/bounce behavior on mobile
 * Extracted from App.vue for better maintainability and reusability
 */

import { ref, onMounted, onUnmounted } from 'vue';
import { usePlatform } from './usePlatform.js';
import { TOUCH } from '../constants/index.js';

export function useOverscrollPrevention() {
  const { isMobile } = usePlatform();
  const isEnabled = ref(false);

  let startY = 0;
  let lastY = 0;
  let pullDownActive = false;
  let activeScrollContainer = null;
  let initialScrollTop = 0;

  /**
   * Find the scrollable container for a given element
   * @param {HTMLElement} node - Starting element
   * @returns {HTMLElement} Scrollable container
   */
  const findScrollableContainer = (node) => {
    let current = node;
    const docScroll = document.scrollingElement || document.documentElement;

    while (current && current !== document.body) {
      const style = window.getComputedStyle(current);
      const overflowY = style.overflowY;
      const canScroll =
        (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
        current.scrollHeight > current.clientHeight;

      if (canScroll) {
        return current;
      }
      current = current.parentElement;
    }

    return docScroll;
  };

  /**
   * Reset pull-to-refresh state
   */
  const resetPullState = () => {
    pullDownActive = false;
    startY = 0;
    lastY = 0;
    activeScrollContainer = null;
    initialScrollTop = 0;
  };

  /**
   * Handle touch start event
   * @param {TouchEvent} e
   */
  const handleTouchStart = (e) => {
    if (!isMobile.value || e.touches.length !== 1) return;

    const touchY = e.touches[0].clientY;
    startY = touchY;
    lastY = touchY;
    pullDownActive = false;
    activeScrollContainer = findScrollableContainer(e.target);
    initialScrollTop = activeScrollContainer?.scrollTop ?? 0;
  };

  /**
   * Handle touch move event
   * @param {TouchEvent} e
   */
  const handleTouchMove = (e) => {
    if (!isMobile.value || e.touches.length !== 1) return;

    const target = e.target;
    // Allow overscroll for certain interactive elements
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input, textarea, select') ||
      target.closest('[data-allow-overscroll]')
    ) {
      return;
    }

    const currentY = e.touches[0].clientY;
    const deltaFromStart = currentY - startY;
    const deltaFromLast = currentY - lastY;
    lastY = currentY;

    const scrollContainer = activeScrollContainer ?? findScrollableContainer(target);
    const scrollTop = scrollContainer?.scrollTop ?? 0;
    const isAtTop = scrollTop <= 0;
    const movedDownEnough = deltaFromStart > TOUCH.MOVEMENT_THRESHOLD;
    const movedUpEnough = deltaFromStart < -TOUCH.MOVEMENT_THRESHOLD;

    if (!pullDownActive) {
      if (isAtTop && movedDownEnough && initialScrollTop <= 0) {
        pullDownActive = true;
      } else if (movedUpEnough) {
        pullDownActive = false;
      }
    }

    if (pullDownActive) {
      if (deltaFromLast < -TOUCH.MOVEMENT_THRESHOLD) {
        pullDownActive = false;
        return;
      }

      if (isAtTop && deltaFromStart >= 0) {
        e.preventDefault();
      } else if (!isAtTop) {
        pullDownActive = false;
      }
    }
  };

  /**
   * Handle touch end event
   */
  const handleTouchEnd = () => {
    resetPullState();
  };

  /**
   * Handle touch cancel event
   */
  const handleTouchCancel = () => {
    resetPullState();
  };

  /**
   * Enable overscroll prevention
   */
  const enable = () => {
    if (!isMobile.value || isEnabled.value) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchcancel', handleTouchCancel, { passive: true });
    
    isEnabled.value = true;
  };

  /**
   * Disable overscroll prevention
   */
  const disable = () => {
    if (!isEnabled.value) return;

    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    document.removeEventListener('touchcancel', handleTouchCancel);
    
    resetPullState();
    isEnabled.value = false;
  };

  onMounted(() => {
    if (isMobile.value) {
      enable();
    }
  });

  onUnmounted(() => {
    disable();
  });

  return {
    isEnabled,
    enable,
    disable,
  };
}