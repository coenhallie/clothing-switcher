<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-xl font-bold text-gray-900">
              Clothing Switcher
            </router-link>
          </div>
          <div class="flex items-center space-x-8">
            <router-link
              to="/"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              :class="{
                'text-blue-600 bg-blue-50': $route.name === 'TryOn',
              }"
            >
              Try-On
            </router-link>
            <router-link
              to="/settings"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              :class="{
                'text-blue-600 bg-blue-50': $route.name === 'Settings',
              }"
            >
              Settings
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <router-view />

    <!-- Toast Notifications -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="bg-white rounded-lg shadow-lg border p-4 max-w-sm animate-slide-up"
        :class="{
          'border-green-200 bg-green-50': toast.type === 'success',
          'border-red-200 bg-red-50': toast.type === 'error',
          'border-yellow-200 bg-yellow-50': toast.type === 'warning',
          'border-blue-200 bg-blue-50': toast.type === 'info',
        }"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg
              v-if="toast.type === 'success'"
              class="w-5 h-5 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else-if="toast.type === 'error'"
              class="w-5 h-5 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else
              class="w-5 h-5 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <p
              class="text-sm font-medium"
              :class="{
                'text-green-800': toast.type === 'success',
                'text-red-800': toast.type === 'error',
                'text-yellow-800': toast.type === 'warning',
                'text-blue-800': toast.type === 'info',
              }"
            >
              {{ toast.title }}
            </p>
            <p
              v-if="toast.message"
              class="mt-1 text-sm"
              :class="{
                'text-green-700': toast.type === 'success',
                'text-red-700': toast.type === 'error',
                'text-yellow-700': toast.type === 'warning',
                'text-blue-700': toast.type === 'info',
              }"
            >
              {{ toast.message }}
            </p>
          </div>
          <button
            @click="removeToast(toast.id)"
            class="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAppStore } from './stores/app';
import { storeToRefs } from 'pinia';

const appStore = useAppStore();
const { toasts } = storeToRefs(appStore);
const { removeToast, initialize } = appStore;

// Initialize the app
onMounted(() => {
  initialize();
});
</script>

<style scoped>
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>
