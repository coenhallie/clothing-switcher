<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <!-- Credit Icon -->
        <div class="flex-shrink-0">
          <div
            class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
        </div>

        <!-- Credit Info -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900">
            {{ credits }} Credit{{ credits !== 1 ? 's' : '' }}
          </h3>
          <p class="text-sm text-gray-600">Available for image generation</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center space-x-2">
        <!-- Refresh Button -->
        <button
          @click="refreshCredits"
          :disabled="isLoading"
          class="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          title="Refresh credit balance"
        >
          <svg
            class="w-5 h-5"
            :class="{ 'animate-spin': isLoading }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>

        <!-- Buy Credits Button -->
        <button
          @click="$emit('buy-credits')"
          class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Buy Credits
        </button>
      </div>
    </div>

    <!-- Low Credit Warning -->
    <div
      v-if="showLowCreditWarning"
      class="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-3"
    >
      <div class="flex items-center">
        <svg
          class="h-5 w-5 text-yellow-400 mr-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        <div>
          <p class="text-sm text-yellow-700">
            <strong>Low credits!</strong> You have {{ credits }} credit{{
              credits !== 1 ? 's' : ''
            }}
            remaining.
            <button
              @click="$emit('buy-credits')"
              class="underline hover:no-underline ml-1"
            >
              Buy more credits
            </button>
            to continue generating images.
          </p>
        </div>
      </div>
    </div>

    <!-- No Credits Warning -->
    <div
      v-if="credits === 0"
      class="mt-4 bg-red-50 border border-red-200 rounded-md p-3"
    >
      <div class="flex items-center">
        <svg
          class="h-5 w-5 text-red-400 mr-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <div>
          <p class="text-sm text-red-700">
            <strong>No credits remaining!</strong> You need to purchase credits
            to generate images.
            <button
              @click="$emit('buy-credits')"
              class="underline hover:no-underline ml-1"
            >
              Buy credits now
            </button>
          </p>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div
      v-if="error"
      class="mt-4 bg-red-50 border border-red-200 rounded-md p-3"
    >
      <p class="text-sm text-red-600">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useCreditStore } from '../../stores/creditStore.js';
import { storeToRefs } from 'pinia';

// Emits
const emit = defineEmits(['buy-credits']);

// Store
const creditStore = useCreditStore();
const { credits, isLoading, error } = storeToRefs(creditStore);

// Computed
const showLowCreditWarning = computed(() => {
  return credits.value > 0 && credits.value <= 2;
});

// Methods
const refreshCredits = async () => {
  await creditStore.loadCredits();
};
</script>
