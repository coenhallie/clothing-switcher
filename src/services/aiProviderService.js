/**
 * AI Provider facade — delegates to either OpenRouter or Gemini Direct
 * based on the user's saved preference in localStorage.
 *
 * Both underlying services expose the same public API surface used by
 * HomeView (`generateClothingTransfer`, `isInitialized`), so this
 * module simply forwards every call to the active backend.
 */

import openRouterService from './openRouterService.js';
import geminiService from './geminiService.js';

const STORAGE_KEY = 'ai_provider';

/** @type {'openrouter' | 'gemini'} */
const PROVIDERS = {
  OPENROUTER: 'openrouter',
  GEMINI: 'gemini',
};

class AIProviderService {
  constructor() {
    this._provider = this._loadProvider();
  }

  /* ── Provider management ─────────────────────────────── */

  /** Read the persisted provider choice (defaults to openrouter). */
  _loadProvider() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === PROVIDERS.GEMINI || stored === PROVIDERS.OPENROUTER) {
        return stored;
      }
    } catch {
      // localStorage may be unavailable (SSR, private mode in some browsers)
    }
    return PROVIDERS.OPENROUTER;
  }

  /** Return the currently active provider key. */
  get provider() {
    return this._provider;
  }

  /** Switch provider and persist the choice. */
  set provider(value) {
    if (value !== PROVIDERS.OPENROUTER && value !== PROVIDERS.GEMINI) {
      console.warn(`Unknown AI provider "${value}", falling back to openrouter`);
      value = PROVIDERS.OPENROUTER;
    }
    this._provider = value;
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore write failures
    }
  }

  /** Return the underlying service instance for the active provider. */
  get activeService() {
    return this._provider === PROVIDERS.GEMINI
      ? geminiService
      : openRouterService;
  }

  /** Check whether the active provider has a valid API key configured. */
  isInitialized() {
    return this.activeService.isInitialized();
  }

  /**
   * Check whether a specific provider has a valid API key configured.
   * Useful for the Settings UI to grey-out unavailable options.
   */
  isProviderAvailable(providerKey) {
    if (providerKey === PROVIDERS.GEMINI) return geminiService.isInitialized();
    if (providerKey === PROVIDERS.OPENROUTER) return openRouterService.isInitialized();
    return false;
  }

  /* ── Delegated API surface ───────────────────────────── */

  /**
   * Generate a clothing transfer image.
   * Delegates to whatever provider is currently selected.
   */
  async generateClothingTransfer(sourceImageFile, targetImageFile, options = {}) {
    return this.activeService.generateClothingTransfer(
      sourceImageFile,
      targetImageFile,
      options,
    );
  }

  /** Analyze clothing in an image. */
  async analyzeClothing(imageFile) {
    return this.activeService.analyzeClothing(imageFile);
  }

  /** Detect body pose in an image. */
  async detectBodyPose(imageFile) {
    return this.activeService.detectBodyPose(imageFile);
  }
}

/** Expose provider keys for external consumers. */
export { PROVIDERS };

export default new AIProviderService();
