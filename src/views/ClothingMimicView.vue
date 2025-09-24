<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Simple Try-On</h1>
        <p class="text-gray-600 max-w-2xl mx-auto">
          Upload two photos: one with the clothing style you want to copy, and
          one of yourself. Our AI will generate an image of you wearing the same
          clothing style.
        </p>
      </div>

      <!-- Main Upload Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Source Image Upload -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 text-center">
            Source Clothing
          </h2>
          <p class="text-sm text-gray-600 mb-4 text-center">
            Upload a photo with the clothing style you want to copy
          </p>

          <div class="relative">
            <input
              ref="sourceFileInput"
              type="file"
              accept="image/*"
              @change="handleSourceImageUpload"
              class="hidden"
            />

            <div
              v-if="!sourceImage"
              @click="$refs.sourceFileInput.click()"
              class="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <svg
                class="mx-auto h-12 w-12 text-gray-400 mb-4"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <p class="text-gray-600 font-medium">
                Click to upload source image
              </p>
              <p class="text-gray-500 text-sm mt-1">PNG, JPG, GIF up to 10MB</p>
            </div>

            <div v-else class="relative">
              <img
                :src="sourceImage"
                alt="Source clothing"
                class="w-full h-64 object-cover rounded-lg"
              />
              <button
                @click="removeSourceImage"
                class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Target Image Upload -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 text-center">
            Your Photo
          </h2>
          <p class="text-sm text-gray-600 mb-4 text-center">
            Upload a photo of yourself to receive the new clothing style
          </p>

          <div class="relative">
            <input
              ref="targetFileInput"
              type="file"
              accept="image/*"
              @change="handleTargetImageUpload"
              class="hidden"
            />

            <div
              v-if="!targetImage"
              @click="$refs.targetFileInput.click()"
              class="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <svg
                class="mx-auto h-12 w-12 text-gray-400 mb-4"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <p class="text-gray-600 font-medium">
                Click to upload your photo
              </p>
              <p class="text-gray-500 text-sm mt-1">PNG, JPG, GIF up to 10MB</p>
            </div>

            <div v-else class="relative">
              <img
                :src="targetImage"
                alt="Your photo"
                class="w-full h-64 object-cover rounded-lg"
              />
              <button
                @click="removeTargetImage"
                class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Credit Balance (for authenticated users) -->
      <div v-if="isAuthenticated" class="mb-6">
        <CreditBalance @buy-credits="openPurchaseCredits" />
      </div>

      <!-- Generate Button -->
      <div class="text-center mb-8">
        <!-- Authenticated User Button -->
        <button
          v-if="isAuthenticated"
          @click="generateClothingMimic"
          :disabled="!canGenerate || isGenerating"
          class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="isGenerating" class="flex items-center">
            <svg
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Generating...
          </span>
          <span v-else-if="!hasCredits">No Credits - Buy Credits</span>
          <span v-else>Generate Try-On (1 Credit)</span>
        </button>

        <!-- Guest User Button -->
        <div v-else class="space-y-4">
          <button
            @click="openAuthModal"
            class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Sign Up to Generate (1 Free Credit!)
          </button>
          <p class="text-sm text-gray-600">
            Create an account to get 1 free credit and start generating images
          </p>
        </div>
      </div>

      <!-- Result Section -->
      <div
        v-if="resultImage"
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h2 class="text-lg font-semibold text-gray-900 mb-4 text-center">
          Result
        </h2>
        <div class="flex justify-center">
          <img
            :src="resultImage"
            alt="Generated result"
            class="max-w-md w-full rounded-lg shadow-md"
          />
        </div>
        <div class="text-center mt-4">
          <button
            @click="downloadResult"
            class="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Download Result
          </button>
        </div>
      </div>

      <!-- Error Message -->
      <div
        v-if="errorMessage"
        class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
      >
        <div class="flex">
          <svg
            class="w-5 h-5 text-red-400 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <p class="text-sm text-red-700 mt-1">{{ errorMessage }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useAppStore } from '../stores/app';
import { useAuthStore } from '../stores/authStore';
import { useCreditStore } from '../stores/creditStore';
import openRouterService from '../services/openRouterService';
import geminiService from '../services/geminiService';
import CreditBalance from '../components/credits/CreditBalance.vue';

// Stores
const appStore = useAppStore();
const authStore = useAuthStore();
const creditStore = useCreditStore();

// Store refs
const { apiKey, provider } = storeToRefs(appStore);
const { isAuthenticated } = storeToRefs(authStore);
const { credits, canGenerate: hasCredits } = storeToRefs(creditStore);

// Reactive state
const sourceImage = ref(null);
const targetImage = ref(null);
const sourceFile = ref(null);
const targetFile = ref(null);
const resultImage = ref(null);
const isGenerating = ref(false);
const errorMessage = ref('');

// Computed properties
const canGenerate = computed(() => {
  if (!isAuthenticated.value) return false;
  return (
    sourceFile.value &&
    targetFile.value &&
    !isGenerating.value &&
    hasCredits.value
  );
});

// Methods
const handleSourceImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    sourceFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      sourceImage.value = e.target.result;
    };
    reader.readAsDataURL(file);
    errorMessage.value = '';
  }
};

const handleTargetImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    targetFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      targetImage.value = e.target.result;
    };
    reader.readAsDataURL(file);
    errorMessage.value = '';
  }
};

const removeSourceImage = () => {
  sourceImage.value = null;
  sourceFile.value = null;
  resultImage.value = null;
};

const removeTargetImage = () => {
  targetImage.value = null;
  targetFile.value = null;
  resultImage.value = null;
};

const generateClothingMimic = async () => {
  if (!canGenerate.value) return;

  // Check authentication
  if (!isAuthenticated.value) {
    appStore.addToast({
      type: 'error',
      title: 'Authentication Required',
      message: 'Please sign in to generate images',
    });
    return;
  }

  // Check credits
  if (!hasCredits.value) {
    appStore.addToast({
      type: 'error',
      title: 'No Credits',
      message: 'You need credits to generate images. Please purchase credits.',
    });
    return;
  }

  isGenerating.value = true;
  errorMessage.value = '';
  resultImage.value = null;

  try {
    // For now, we'll still use the API key from settings
    // In production, this should be moved to server-side
    if (!apiKey.value) {
      throw new Error('Please configure your API key in Settings first');
    }

    // Use credit first
    const creditResult = await creditStore.useCredit(1, 'Image generation');

    if (!creditResult.success) {
      throw new Error(creditResult.error);
    }

    let result;
    let creditUsed = true;

    try {
      if (provider.value === 'gemini') {
        geminiService.initialize(apiKey.value);
        result = await geminiService.generateClothingTransfer(
          sourceFile.value,
          targetFile.value
        );
      } else {
        openRouterService.initialize(apiKey.value);
        result = await openRouterService.generateClothingTransfer(
          sourceFile.value,
          targetFile.value
        );
      }

      if (result.success && result.imageUrl) {
        resultImage.value = result.imageUrl;
        appStore.addToast({
          type: 'success',
          title: 'Success!',
          message: `Clothing mimic generated successfully! ${creditResult.newBalance} credits remaining.`,
        });
        creditUsed = true; // Keep the credit since generation was successful
      } else {
        // Refund the credit since no image was generated
        await creditStore.addCredits(
          1,
          'refunded',
          'Refund for failed generation - no image generated'
        );
        creditUsed = false;

        // Handle specific case where no image was generated
        if (result.error === 'NO_IMAGE_GENERATED') {
          throw new Error(
            result.message ||
              'The AI was unable to generate an image. Please try again with different images.'
          );
        } else {
          throw new Error(
            result.message || 'Failed to generate clothing mimic'
          );
        }
      }
    } catch (apiError) {
      // If the API call failed and we used a credit, refund it
      if (creditUsed) {
        await creditStore.addCredits(
          1,
          'refunded',
          'Refund for failed API call'
        );
      }
      throw apiError;
    }
  } catch (error) {
    console.error('Error generating clothing mimic:', error);
    errorMessage.value = error.message;
    appStore.addToast({
      type: 'error',
      title: 'Generation Failed',
      message: error.message,
    });
  } finally {
    isGenerating.value = false;
  }
};

// New methods for auth and purchase modals
const openAuthModal = () => {
  // This will be handled by the parent App component
  // We can emit an event or use a global event bus
  window.dispatchEvent(
    new CustomEvent('open-auth-modal', { detail: 'signup' })
  );
};

const openPurchaseCredits = () => {
  // This will be handled by the parent App component
  window.dispatchEvent(new CustomEvent('open-purchase-modal'));
};

const downloadResult = () => {
  if (!resultImage.value) return;

  const link = document.createElement('a');
  link.href = resultImage.value;
  link.download = `clothing-mimic-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>
