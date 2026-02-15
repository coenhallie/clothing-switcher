<template>
  <div class="settings-view">
    <!-- Header -->
    <div>
      <h1 class="text-xl font-semibold text-[var(--color-card-foreground)] tracking-tight">Settings</h1>
      <p class="text-xs text-[var(--color-muted-foreground)] mt-0.5">Preferences and account management.</p>
    </div>

    <div class="settings-layout">
      <!-- Privacy & Data -->
      <div class="settings-card">
        <div class="settings-card__header">
          <h2 class="settings-card__title">Privacy & data</h2>
          <p class="settings-card__desc">Control storage and history settings.</p>
        </div>

        <div class="settings-card__body">
          <!-- Storage - Mobile Only -->
          <label v-if="isTauriMobile" class="settings-toggle">
            <input id="use-local-storage" v-model="settings.useLocalStorage" type="checkbox" class="settings-toggle__input" />
            <div>
              <p class="settings-toggle__label">Local device storage</p>
              <p class="settings-toggle__desc">Save images on your device for offline access.</p>
            </div>
          </label>

          <!-- Cloud Storage - Web Only -->
          <label v-if="!isTauriMobile && isAuthenticated" class="settings-toggle">
            <input id="save-to-supabase" v-model="settings.saveToSupabase" type="checkbox" class="settings-toggle__input" />
            <div>
              <p class="settings-toggle__label">Cloud storage</p>
              <p class="settings-toggle__desc">Sync images across devices via Supabase.</p>
            </div>
          </label>

          <!-- History Toggle -->
          <label class="settings-toggle">
            <input id="save-history" v-model="settings.saveHistory" type="checkbox" class="settings-toggle__input" />
            <div>
              <p class="settings-toggle__label">Save try-on history</p>
              <p class="settings-toggle__desc">Keep recent generations in your browser.</p>
            </div>
          </label>

          <!-- Auto-delete -->
          <div class="settings-field">
            <label for="auto-delete" class="settings-toggle__label">Auto-delete after</label>
            <select
              id="auto-delete"
              v-model="settings.autoDeleteDays"
              :disabled="!settings.saveHistory"
              class="settings-select"
            >
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="0">Never</option>
            </select>
          </div>

          <!-- Danger zone -->
          <div class="settings-danger">
            <div>
              <p class="text-xs font-medium text-[var(--color-destructive-500)]">Clear all local data</p>
              <p class="text-[11px] text-[var(--color-destructive-500)] opacity-70">Removes settings, history, and cached data.</p>
            </div>
            <button type="button" @click="clearAllData" class="settings-danger__btn">
              Clear data
            </button>
          </div>
        </div>
      </div>

      <div class="settings-sidebar">
          <!-- AI Provider -->
          <div class="settings-card">
            <div class="settings-card__header">
              <h2 class="settings-card__title">AI provider</h2>
              <p class="settings-card__desc">Choose which backend processes image generation.</p>
            </div>
            <div class="settings-card__body">
              <label
                class="settings-toggle"
                :class="{ 'settings-toggle--active': settings.aiProvider === 'openrouter' }"
              >
                <input
                  type="radio"
                  name="ai-provider"
                  value="openrouter"
                  v-model="settings.aiProvider"
                  class="settings-toggle__input"
                />
                <div>
                  <p class="settings-toggle__label">OpenRouter</p>
                  <p class="settings-toggle__desc">
                    Routes through OpenRouter to Gemini.
                    <span v-if="!openrouterAvailable" class="text-[var(--color-destructive-500)]"> (no API key)</span>
                  </p>
                </div>
              </label>
  
              <label
                class="settings-toggle"
                :class="{ 'settings-toggle--active': settings.aiProvider === 'gemini' }"
              >
                <input
                  type="radio"
                  name="ai-provider"
                  value="gemini"
                  v-model="settings.aiProvider"
                  class="settings-toggle__input"
                />
                <div>
                  <p class="settings-toggle__label">Google AI (direct)</p>
                  <p class="settings-toggle__desc">
                    Calls Gemini API directly with your Google AI key.
                    <span v-if="!geminiAvailable" class="text-[var(--color-destructive-500)]"> (no API key)</span>
                  </p>
                </div>
              </label>
            </div>
          </div>

          <!-- API Keys -->
          <div class="settings-card">
            <div class="settings-card__header">
              <h2 class="settings-card__title">API keys</h2>
              <p class="settings-card__desc">Add your own API keys so image generation works after deployment. Keys are stored locally in your browser.</p>
            </div>
            <div class="settings-card__body">
              <!-- Gemini API Key -->
              <div class="settings-field">
                <label for="gemini-api-key" class="settings-toggle__label">Gemini API key</label>
                <p class="settings-toggle__desc" style="margin-bottom: 0.25rem;">
                  Get yours at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" class="settings-link">Google AI Studio</a>
                </p>
                <div class="settings-key-input">
                  <input
                    id="gemini-api-key"
                    :type="showGeminiKey ? 'text' : 'password'"
                    v-model="apiKeys.gemini"
                    placeholder="AIza..."
                    autocomplete="off"
                    spellcheck="false"
                    class="settings-input"
                  />
                  <button type="button" @click="showGeminiKey = !showGeminiKey" class="settings-key-toggle" :title="showGeminiKey ? 'Hide key' : 'Show key'">
                    <svg v-if="!showGeminiKey" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/></svg>
                    <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                  </button>
                </div>
                <p v-if="apiKeys.gemini" class="settings-key-status settings-key-status--set">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  Key set
                </p>
              </div>

              <!-- OpenRouter API Key -->
              <div class="settings-field">
                <label for="openrouter-api-key" class="settings-toggle__label">OpenRouter API key</label>
                <p class="settings-toggle__desc" style="margin-bottom: 0.25rem;">
                  Get yours at <a href="https://openrouter.ai/keys" target="_blank" rel="noopener" class="settings-link">openrouter.ai/keys</a>
                </p>
                <div class="settings-key-input">
                  <input
                    id="openrouter-api-key"
                    :type="showOpenRouterKey ? 'text' : 'password'"
                    v-model="apiKeys.openrouter"
                    placeholder="sk-or-v1-..."
                    autocomplete="off"
                    spellcheck="false"
                    class="settings-input"
                  />
                  <button type="button" @click="showOpenRouterKey = !showOpenRouterKey" class="settings-key-toggle" :title="showOpenRouterKey ? 'Hide key' : 'Show key'">
                    <svg v-if="!showOpenRouterKey" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/></svg>
                    <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                  </button>
                </div>
                <p v-if="apiKeys.openrouter" class="settings-key-status settings-key-status--set">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  Key set
                </p>
              </div>

              <p class="text-[11px] text-[var(--color-muted-foreground)] leading-relaxed">
                <svg class="w-3 h-3 inline-block mr-0.5 -mt-px" fill="none" viewBox="0 0 24 24"><path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                Keys are stored only in your browser's local storage and never sent to our servers.
              </p>
            </div>
          </div>
  
          <!-- Account -->
          <div v-if="isAuthenticated" class="settings-card">
          <div class="settings-card__header">
            <h2 class="settings-card__title">Account</h2>
          </div>
          <div class="settings-card__body">
            <div class="settings-info-row">
              <span class="text-xs text-[var(--color-muted-foreground)]">Name</span>
              <span class="text-xs font-medium text-[var(--color-card-foreground)]">{{ userDisplayName }}</span>
            </div>
            <div class="settings-info-row">
              <span class="text-xs text-[var(--color-muted-foreground)]">Email</span>
              <span class="text-xs font-medium text-[var(--color-card-foreground)] text-right">{{ userEmail }}</span>
            </div>
            <button @click="handleSignOut" type="button" class="settings-signout-btn">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <path d="M9 6 5 6 5 18 9 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                <path d="M13 12h8m0 0-3-3m3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Sign out
            </button>
          </div>
        </div>

        <!-- Biometric - Mobile Only -->
        <div v-if="isMobile && isAuthenticated" class="settings-card">
          <div class="settings-card__header">
            <h2 class="settings-card__title">Biometrics</h2>
            <p class="settings-card__desc">Use fingerprint or face recognition to sign in.</p>
          </div>
          <div class="settings-card__body">
            <label
              class="settings-toggle"
              :class="{ 'opacity-50 pointer-events-none': !biometricAvailable || isTogglingBiometric }"
            >
              <input
                id="biometric-enabled"
                type="checkbox"
                :checked="biometricEnabled"
                :disabled="!biometricAvailable || isTogglingBiometric"
                @change="toggleBiometric"
                class="settings-toggle__input"
              />
              <div>
                <p class="settings-toggle__label">Enable biometric sign-in</p>
                <p class="settings-toggle__desc">
                  {{ biometricAvailable ? 'Sign in faster with device biometrics.' : 'Only available on mobile devices.' }}
                </p>
              </div>
            </label>
          </div>
        </div>

        <!-- About -->
        <div class="settings-card">
          <div class="settings-card__header">
            <h2 class="settings-card__title">About</h2>
          </div>
          <div class="settings-card__body">
            <div class="settings-info-row">
              <span class="text-xs text-[var(--color-muted-foreground)]">Version</span>
              <span class="text-xs font-medium text-[var(--color-card-foreground)]">1.0.0</span>
            </div>
            <p class="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
              Powered by Gemini, OpenRouter, Vue 3 and custom vision pipelines.
            </p>
          </div>
        </div>

        <!-- Save -->
        <button type="button" @click="saveSettings" class="settings-save-btn">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Save settings
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAppStore } from '../stores/app';
import { useAuthStore } from '../stores/authStore';
import { usePlatform } from '../composables/usePlatform';
import { useBiometricAuth } from '../composables/useBiometricAuth';
import aiProviderService, { PROVIDERS } from '../services/aiProviderService';
import geminiService from '../services/geminiService';
import openRouterService from '../services/openRouterService';

const router = useRouter();
const appStore = useAppStore();
const authStore = useAuthStore();
const { isMobile, isTauriMobile } = usePlatform();
const {
  isBiometricEnabled,
  isBiometricAvailable,
  enableBiometric,
  disableBiometric
} = useBiometricAuth();

const { isAuthenticated, userName, user } = storeToRefs(authStore);

const biometricEnabled = computed(() => isBiometricEnabled.value);
const biometricAvailable = computed(() => isBiometricAvailable.value);
const isTogglingBiometric = ref(false);

const openrouterAvailable = computed(() => aiProviderService.isProviderAvailable(PROVIDERS.OPENROUTER));
const geminiAvailable = computed(() => aiProviderService.isProviderAvailable(PROVIDERS.GEMINI));

const apiKeys = reactive({
  gemini: '',
  openrouter: '',
});
const showGeminiKey = ref(false);
const showOpenRouterKey = ref(false);

const settings = reactive({
  saveHistory: true,
  autoDeleteDays: 30,
  useLocalStorage: true,
  saveToSupabase: false,
  aiProvider: aiProviderService.provider,
});

onMounted(() => { loadSettings(); });

const loadSettings = () => {
  const stored = localStorage.getItem('app_settings');
  if (stored) {
    try {
      const parsedSettings = JSON.parse(stored);
      Object.assign(settings, parsedSettings);
      if (!isTauriMobile.value && typeof parsedSettings.saveToSupabase === 'boolean') {
        settings.useLocalStorage = !parsedSettings.saveToSupabase;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }
  // Always sync AI provider from the facade (source of truth)
  settings.aiProvider = aiProviderService.provider;

  // Load user-provided API keys
  apiKeys.gemini = geminiService.getUserApiKey();
  apiKeys.openrouter = openRouterService.getUserApiKey();
};

const saveSettings = () => {
  if (!isTauriMobile.value) settings.useLocalStorage = !settings.saveToSupabase;
  // Persist AI provider choice via the facade (writes its own localStorage key)
  aiProviderService.provider = settings.aiProvider;

  // Persist user-provided API keys and reload them into the services
  geminiService.setApiKey(apiKeys.gemini);
  openRouterService.setApiKey(apiKeys.openrouter);

  localStorage.setItem('app_settings', JSON.stringify(settings));
  appStore.addToast({ type: 'success', title: 'Saved', message: 'Settings updated.' });
};

const clearAllData = () => {
  if (confirm('Clear all local data? This cannot be undone.')) {
    localStorage.removeItem('app_settings');
    localStorage.removeItem('recentTryOns');
    localStorage.removeItem('wardrobe_items');
    localStorage.removeItem('ai_provider');
    // Clear user-provided API keys
    geminiService.setApiKey('');
    openRouterService.setApiKey('');
    apiKeys.gemini = '';
    apiKeys.openrouter = '';

    aiProviderService.provider = 'openrouter';
    Object.assign(settings, { saveHistory: true, autoDeleteDays: 30, useLocalStorage: true, saveToSupabase: false, aiProvider: 'openrouter' });
    appStore.addToast({ type: 'success', title: 'Cleared', message: 'All local data removed.' });
  }
};

const handleSignOut = async () => {
  const result = await authStore.signOut();
  if (result.success) {
    appStore.addToast({ type: 'success', title: 'Signed out', message: 'Session ended.' });
    if (isMobile.value) { router.push('/auth'); } else { router.push('/'); }
  } else {
    appStore.addToast({ type: 'error', title: 'Sign out failed', message: result.error });
  }
};

const userEmail = computed(() => user.value?.email || 'Not available');
const userDisplayName = computed(() => userName.value || 'User');

const toggleBiometric = async (event) => {
  const isChecked = event.target.checked;
  isTogglingBiometric.value = true;

  try {
    if (isChecked) {
      const result = await enableBiometric();
      if (result.success) {
        appStore.addToast({ type: 'success', title: 'Biometric enabled', message: 'You can now use biometric sign-in.' });
      } else {
        event.target.checked = false;
        appStore.addToast({ type: 'error', title: 'Failed', message: result.error || 'Could not enable biometrics.' });
      }
    } else {
      disableBiometric();
      appStore.addToast({ type: 'success', title: 'Biometric disabled', message: 'Biometric sign-in turned off.' });
    }
  } catch (error) {
    event.target.checked = !isChecked;
    appStore.addToast({ type: 'error', title: 'Error', message: 'Failed to change biometric settings.' });
  } finally {
    isTogglingBiometric.value = false;
  }
};
</script>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.settings-layout {
  display: grid;
  gap: 1rem;
}

@media (min-width: 1024px) {
  .settings-layout {
    grid-template-columns: 2fr 1fr;
  }
}

.settings-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.settings-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  overflow: hidden;
}

.settings-card__header {
  padding: 0.875rem 1rem 0;
}

.settings-card__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-card-foreground);
}

.settings-card__desc {
  font-size: 0.75rem;
  color: var(--color-muted-foreground);
  margin-top: 0.125rem;
}

.settings-card__body {
  padding: 0.75rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.settings-toggle {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.settings-toggle:hover {
  border-color: var(--color-muted-foreground);
}

.settings-toggle--active {
  border-color: var(--color-foreground);
  background: oklch(0.97 0.003 250);
}

.dark .settings-toggle--active {
  background: oklch(0.2 0.005 250);
}

.settings-toggle__input {
  margin-top: 0.125rem;
  width: 0.875rem;
  height: 0.875rem;
  accent-color: var(--color-foreground);
  flex-shrink: 0;
}

.settings-toggle__label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-card-foreground);
}

.settings-toggle__desc {
  font-size: 0.6875rem;
  color: var(--color-muted-foreground);
  margin-top: 0.0625rem;
}

.settings-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.settings-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-card-foreground);
  transition: border-color 0.15s ease;
}

.settings-select:focus {
  outline: none;
  border-color: var(--color-ring);
  box-shadow: var(--shadow-focus);
}

.settings-select:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.settings-danger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px dashed oklch(0.58 0.22 27 / 0.2);
  border-radius: var(--radius-md);
  background: oklch(0.58 0.22 27 / 0.03);
}

.settings-danger__btn {
  flex-shrink: 0;
  padding: 0.375rem 0.75rem;
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--color-destructive-500);
  border: 1px solid oklch(0.58 0.22 27 / 0.2);
  border-radius: var(--radius-md);
  transition: background 0.15s ease;
}

.settings-danger__btn:hover {
  background: oklch(0.58 0.22 27 / 0.06);
}

.settings-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.settings-signout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  width: 100%;
  padding: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-destructive-500);
  border: 1px solid oklch(0.58 0.22 27 / 0.15);
  border-radius: var(--radius-md);
  margin-top: 0.25rem;
  transition: background 0.15s ease;
}

.settings-signout-btn:hover {
  background: oklch(0.58 0.22 27 / 0.04);
}

.settings-save-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  width: 100%;
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-weight: 500;
  background: var(--color-foreground);
  color: var(--color-background);
  border-radius: var(--radius-md);
  transition: opacity 0.15s ease;
}

.settings-save-btn:hover {
  opacity: 0.88;
}

/* ── API Key inputs ─────────────────────────────── */

.settings-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
  letter-spacing: -0.01em;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-card-foreground);
  transition: border-color 0.15s ease;
}

.settings-input::placeholder {
  color: var(--color-muted-foreground);
  opacity: 0.5;
}

.settings-input:focus {
  outline: none;
  border-color: var(--color-ring);
  box-shadow: var(--shadow-focus);
}

.settings-key-input {
  display: flex;
  gap: 0.375rem;
}

.settings-key-input .settings-input {
  flex: 1;
  min-width: 0;
}

.settings-key-toggle {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-muted-foreground);
  transition: border-color 0.15s ease, color 0.15s ease;
}

.settings-key-toggle:hover {
  border-color: var(--color-muted-foreground);
  color: var(--color-card-foreground);
}

.settings-key-status {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 500;
}

.settings-key-status--set {
  color: oklch(0.55 0.18 145);
}

.settings-link {
  color: var(--color-foreground);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: opacity 0.15s ease;
}

.settings-link:hover {
  opacity: 0.7;
}
</style>
