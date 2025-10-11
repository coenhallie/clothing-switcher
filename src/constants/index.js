/**
 * Application-wide constants
 * Centralized location for magic numbers, breakpoints, and configuration values
 */

// Viewport breakpoints (following Material Design guidelines)
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280,
};

// Timeout durations (in milliseconds)
export const TIMEOUTS = {
  TOAST_DEFAULT: 5000,
  TOAST_SHORT: 3000,
  TOAST_LONG: 7000,
  AUTH_TIMEOUT: 10000,
  CREDITS_TIMEOUT: 10000,
  SESSION_CHECK_DELAY: 500,
  DEBOUNCE_DEFAULT: 300,
};

// Touch interaction thresholds
export const TOUCH = {
  MOVEMENT_THRESHOLD: 8,
  SWIPE_THRESHOLD: 50,
  TAP_MAX_DURATION: 200,
};

// Animation durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// Z-index layers for consistent stacking
export const Z_INDEX = {
  BASE: 1,
  DROPDOWN: 50,
  MODAL: 60,
  TOAST: 80,
  USER_MENU: 99999,
};

// API and request limits
export const LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES_PER_READ: 5,
  MAX_RETRY_ATTEMPTS: 3,
};

// LocalStorage keys
export const STORAGE_KEYS = {
  THEME: 'app_theme',
  LOGOUT_FLAG: 'logout_on_close_flag',
  LOGOUT_TIMESTAMP: 'last_logout_timestamp',
  AUTH_REDIRECT: 'postAuthRedirect',
};

// Credit transaction types (matching database enum)
export const CREDIT_TRANSACTION_TYPES = {
  EARNED: 'earned',
  PURCHASED: 'purchased',
  CONSUMED: 'consumed',
  REFUNDED: 'refunded',
  EXPIRED: 'expired',
};

// Image generation statuses
export const GENERATION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// Log levels for the logging utility
export const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};