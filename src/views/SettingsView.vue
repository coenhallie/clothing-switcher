<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p class="text-gray-600">Configure your application preferences.</p>
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
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Privacy & Data</h2>

        <div class="space-y-4">
          <!-- Save History -->
          <div class="flex items-center">
            <input
              id="save-history"
              v-model="settings.saveHistory"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="save-history" class="ml-2 block text-sm text-gray-700">
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
