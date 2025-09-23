<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p class="text-gray-600">
          Configure your API keys and application preferences.
        </p>
      </div>

      <div class="space-y-6">
        <!-- API Configuration -->
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">
            API Configuration
          </h2>

          <!-- API Provider Selection -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              AI Provider for Image Generation
            </label>
            <div class="grid grid-cols-2 gap-4">
              <label
                class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  v-model="selectedProvider"
                  type="radio"
                  value="openrouter"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div class="ml-3">
                  <div class="text-sm font-medium text-gray-900">
                    OpenRouter
                  </div>
                  <div class="text-xs text-gray-500">
                    Advanced image generation
                  </div>
                </div>
              </label>
              <label
                class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  v-model="selectedProvider"
                  type="radio"
                  value="gemini"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div class="ml-3">
                  <div class="text-sm font-medium text-gray-900">
                    Google Gemini
                  </div>
                  <div class="text-xs text-gray-500">Analysis only</div>
                </div>
              </label>
            </div>
          </div>

          <!-- OpenRouter API Key -->
          <div v-if="selectedProvider === 'openrouter'" class="mb-6">
            <label
              for="openrouter-api-key"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              OpenRouter API Key
              <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                id="openrouter-api-key"
                v-model="tempApiKey"
                :type="showApiKey ? 'text' : 'password'"
                class="input-field pr-20"
                placeholder="Enter your OpenRouter API key"
                @input="validateApiKey"
              />
              <div class="absolute inset-y-0 right-0 flex items-center">
                <button
                  type="button"
                  @click="showApiKey = !showApiKey"
                  class="px-3 py-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <svg
                    v-if="showApiKey"
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                  <svg
                    v-else
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  @click="testApiKey"
                  :disabled="!tempApiKey || isTestingApi"
                  class="mr-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="isTestingApi" class="flex items-center">
                    <div class="w-4 h-4 loading-spinner mr-1"></div>
                    Testing
                  </span>
                  <span v-else>Test</span>
                </button>
              </div>
            </div>

            <!-- API Key Status -->
            <div class="mt-2">
              <div
                v-if="apiKeyStatus === 'valid'"
                class="flex items-center text-sm text-green-600"
              >
                <svg
                  class="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                API key is valid and working
              </div>
              <div
                v-else-if="apiKeyStatus === 'invalid'"
                class="flex items-center text-sm text-red-600"
              >
                <svg
                  class="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd"
                  />
                </svg>
                API key is invalid or expired
              </div>
              <div
                v-else-if="apiKeyStatus === 'error'"
                class="flex items-center text-sm text-yellow-600"
              >
                <svg
                  class="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
                Unable to verify API key
              </div>
            </div>

            <p class="mt-2 text-sm text-gray-500">
              Get your API key from
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener"
                class="text-blue-600 hover:text-blue-800 underline"
              >
                OpenRouter
              </a>
            </p>
          </div>

          <!-- Google Gemini API Key -->
          <div v-if="selectedProvider === 'gemini'" class="mb-6">
            <label
              for="gemini-api-key"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Google Gemini API Key
              <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                id="gemini-api-key"
                v-model="tempApiKey"
                :type="showApiKey ? 'text' : 'password'"
                class="input-field pr-20"
                placeholder="Enter your Google Gemini API key"
                @input="validateApiKey"
              />
              <div class="absolute inset-y-0 right-0 flex items-center">
                <button
                  type="button"
                  @click="showApiKey = !showApiKey"
                  class="px-3 py-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <svg
                    v-if="showApiKey"
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                  <svg
                    v-else
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  @click="testApiKey"
                  :disabled="!tempApiKey || isTestingApi"
                  class="mr-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="isTestingApi" class="flex items-center">
                    <div class="w-4 h-4 loading-spinner mr-1"></div>
                    Testing
                  </span>
                  <span v-else>Test</span>
                </button>
              </div>
            </div>

            <!-- API Key Status -->
            <div class="mt-2">
              <div
                v-if="apiKeyStatus === 'valid'"
                class="flex items-center text-sm text-green-600"
              >
                <svg
                  class="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                API key is valid and working
              </div>
              <div
                v-else-if="apiKeyStatus === 'invalid'"
                class="flex items-center text-sm text-red-600"
              >
                <svg
                  class="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd"
                  />
                </svg>
                API key is invalid or expired
              </div>
              <div
                v-else-if="apiKeyStatus === 'error'"
                class="flex items-center text-sm text-yellow-600"
              >
                <svg
                  class="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
                Unable to verify API key
              </div>
            </div>

            <p class="mt-2 text-sm text-gray-500">
              Get your API key from the
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener"
                class="text-blue-600 hover:text-blue-800 underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          <!-- Save Button -->
          <div class="flex justify-end">
            <button
              @click="saveApiKey"
              :disabled="!tempApiKey || apiKeyStatus === 'invalid'"
              class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save API Key
            </button>
          </div>
        </div>

        <!-- Image Processing Settings -->
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">
            Image Processing
          </h2>

          <div class="space-y-4">
            <!-- Max Image Size -->
            <div>
              <label
                for="max-image-size"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Maximum Image Size (MB)
              </label>
              <select
                id="max-image-size"
                v-model="settings.maxImageSize"
                class="input-field"
              >
                <option value="5">5 MB</option>
                <option value="10">10 MB</option>
                <option value="15">15 MB</option>
                <option value="20">20 MB</option>
              </select>
              <p class="mt-1 text-sm text-gray-500">
                Larger images provide better quality but take longer to process
              </p>
            </div>

            <!-- Image Quality -->
            <div>
              <label
                for="image-quality"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Output Image Quality
              </label>
              <select
                id="image-quality"
                v-model="settings.imageQuality"
                class="input-field"
              >
                <option value="0.7">Standard (70%)</option>
                <option value="0.8">High (80%)</option>
                <option value="0.9">Very High (90%)</option>
                <option value="1.0">Maximum (100%)</option>
              </select>
            </div>

            <!-- Auto-resize -->
            <div class="flex items-center">
              <input
                id="auto-resize"
                v-model="settings.autoResize"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="auto-resize" class="ml-2 block text-sm text-gray-700">
                Automatically resize large images for faster processing
              </label>
            </div>
          </div>
        </div>

        <!-- Privacy & Data -->
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">
            Privacy & Data
          </h2>

          <div class="space-y-4">
            <!-- Save History -->
            <div class="flex items-center">
              <input
                id="save-history"
                v-model="settings.saveHistory"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                for="save-history"
                class="ml-2 block text-sm text-gray-700"
              >
                Save try-on history locally
              </label>
            </div>

            <!-- Auto-delete -->
            <div>
              <label
                for="auto-delete"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Auto-delete history after
              </label>
              <select
                id="auto-delete"
                v-model="settings.autoDeleteDays"
                :disabled="!settings.saveHistory"
                class="input-field disabled:opacity-50"
              >
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="0">Never</option>
              </select>
            </div>

            <!-- Clear Data Button -->
            <div class="pt-4 border-t border-gray-200">
              <button
                @click="clearAllData"
                class="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear All Local Data
              </button>
              <p class="mt-1 text-sm text-gray-500">
                This will remove all saved try-ons and settings
              </p>
            </div>
          </div>
        </div>

        <!-- About -->
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">About</h2>

          <div class="space-y-4">
            <div>
              <h3 class="text-sm font-medium text-gray-700">Version</h3>
              <p class="text-sm text-gray-600">ClothingAI v1.0.0</p>
            </div>

            <div>
              <h3 class="text-sm font-medium text-gray-700">Technology</h3>
              <p class="text-sm text-gray-600">
                Powered by Google Gemini 2.5 Flash AI, Vue 3, and advanced
                computer vision algorithms
              </p>
            </div>

            <div>
              <h3 class="text-sm font-medium text-gray-700">Support</h3>
              <p class="text-sm text-gray-600">
                For help and support, visit our
                <a href="#" class="text-blue-600 hover:text-blue-800 underline"
                  >documentation</a
                >
                or contact
                <a
                  href="mailto:support@clothingai.com"
                  class="text-blue-600 hover:text-blue-800 underline"
                  >support</a
                >
              </p>
            </div>
          </div>
        </div>

        <!-- Save Settings -->
        <div class="flex justify-end">
          <button @click="saveSettings" class="btn-primary">
            Save All Settings
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAppStore } from '../stores/app';
import { storeToRefs } from 'pinia';
import geminiService from '../services/geminiService';
import openRouterService from '../services/openRouterService';

const appStore = useAppStore();
const { apiKey, provider } = storeToRefs(appStore);

// Reactive state
const tempApiKey = ref('');
const showApiKey = ref(false);
const apiKeyStatus = ref(null); // null, 'valid', 'invalid', 'error'
const isTestingApi = ref(false);
const selectedProvider = ref('openrouter'); // 'openrouter' or 'gemini'

const settings = reactive({
  maxImageSize: 10,
  imageQuality: 0.9,
  autoResize: true,
  saveHistory: true,
  autoDeleteDays: 30,
});

// Load settings on mount
onMounted(() => {
  loadSettings();
  tempApiKey.value = apiKey.value;
  selectedProvider.value = provider.value || 'openrouter';
  if (apiKey.value) {
    apiKeyStatus.value = 'valid';
  }
});

// API Key functions
const validateApiKey = () => {
  apiKeyStatus.value = null;
  if (tempApiKey.value && tempApiKey.value.length < 20) {
    apiKeyStatus.value = 'invalid';
  }
};

const testApiKey = async () => {
  if (!tempApiKey.value) return;

  isTestingApi.value = true;
  apiKeyStatus.value = null;

  try {
    if (selectedProvider.value === 'openrouter') {
      // Test OpenRouter API key
      openRouterService.initialize(tempApiKey.value);
      const testResult = await openRouterService.testConnection();

      if (testResult.success) {
        apiKeyStatus.value = 'valid';
        appStore.addToast({
          type: 'success',
          title: 'API Key Valid',
          message: 'Your OpenRouter API key is working correctly!',
        });
      } else {
        apiKeyStatus.value = 'invalid';
      }
    } else {
      // Test Gemini API key
      geminiService.initialize(tempApiKey.value);
      const testResult = await geminiService.model.generateContent(
        'Hello, this is a test.'
      );

      if (testResult && testResult.response) {
        apiKeyStatus.value = 'valid';
        appStore.addToast({
          type: 'success',
          title: 'API Key Valid',
          message: 'Your Google Gemini API key is working correctly!',
        });
      } else {
        apiKeyStatus.value = 'invalid';
      }
    }
  } catch (error) {
    console.error('API key test failed:', error);
    apiKeyStatus.value = 'invalid';
    appStore.addToast({
      type: 'error',
      title: 'API Key Invalid',
      message: 'The API key is invalid or has insufficient permissions.',
    });
  } finally {
    isTestingApi.value = false;
  }
};

const saveApiKey = () => {
  if (!tempApiKey.value || apiKeyStatus.value === 'invalid') return;

  appStore.setApiKey(tempApiKey.value);
  appStore.setProvider(selectedProvider.value);
  appStore.addToast({
    type: 'success',
    title: 'API Key Saved',
    message: 'Your API key and provider have been saved successfully!',
  });
};

// Settings functions
const loadSettings = () => {
  const stored = localStorage.getItem('app_settings');
  if (stored) {
    try {
      const parsedSettings = JSON.parse(stored);
      Object.assign(settings, parsedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }
};

const saveSettings = () => {
  localStorage.setItem('app_settings', JSON.stringify(settings));
  appStore.addToast({
    type: 'success',
    title: 'Settings Saved',
    message: 'Your settings have been saved successfully!',
  });
};

const clearAllData = () => {
  if (
    confirm(
      'Are you sure you want to clear all local data? This action cannot be undone.'
    )
  ) {
    // Clear all localStorage data
    localStorage.removeItem('app_settings');
    localStorage.removeItem('recentTryOns');
    localStorage.removeItem('wardrobe_items');
    localStorage.removeItem('gemini_api_key');

    // Reset settings
    Object.assign(settings, {
      maxImageSize: 10,
      imageQuality: 0.9,
      autoResize: true,
      saveHistory: true,
      autoDeleteDays: 30,
    });

    // Clear API key
    tempApiKey.value = '';
    apiKeyStatus.value = null;
    appStore.setApiKey('');

    appStore.addToast({
      type: 'success',
      title: 'Data Cleared',
      message: 'All local data has been cleared successfully!',
    });
  }
};
</script>

<style scoped>
.loading-spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
