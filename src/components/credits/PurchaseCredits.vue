<template>
  <div
    class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6"
  >
    <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">
      Purchase Credits
    </h2>

    <!-- Credit Packages -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <div
        v-for="package_item in creditPackages"
        :key="package_item.credits"
        class="relative border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md"
        :class="{
          'border-blue-500 bg-blue-50':
            selectedPackage?.credits === package_item.credits,
          'border-gray-200': selectedPackage?.credits !== package_item.credits,
        }"
        @click="selectPackage(package_item)"
      >
        <!-- Popular Badge -->
        <div
          v-if="package_item.credits === 25"
          class="absolute -top-2 left-1/2 transform -translate-x-1/2"
        >
          <span
            class="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full"
          >
            Most Popular
          </span>
        </div>

        <!-- Best Value Badge -->
        <div
          v-if="package_item.credits === 100"
          class="absolute -top-2 left-1/2 transform -translate-x-1/2"
        >
          <span
            class="bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-full"
          >
            Best Value
          </span>
        </div>

        <div class="text-center">
          <!-- Credits Amount -->
          <div class="text-3xl font-bold text-gray-900 mb-2">
            {{ package_item.credits }}
          </div>
          <div class="text-sm text-gray-600 mb-3">
            Credit{{ package_item.credits !== 1 ? 's' : '' }}
          </div>

          <!-- Price -->
          <div class="text-2xl font-bold text-blue-600 mb-2">
            ${{ package_item.price.toFixed(2) }}
          </div>

          <!-- Price per Credit -->
          <div class="text-sm text-gray-500 mb-4">
            ${{ package_item.pricePerCredit.toFixed(3) }} per credit
          </div>

          <!-- Savings -->
          <div
            v-if="package_item.credits > 5"
            class="text-sm text-green-600 font-medium"
          >
            Save {{ calculateSavings(package_item) }}%
          </div>
        </div>

        <!-- Selection Indicator -->
        <div
          v-if="selectedPackage?.credits === package_item.credits"
          class="absolute top-2 right-2"
        >
          <svg
            class="w-6 h-6 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Selected Package Summary -->
    <div v-if="selectedPackage" class="bg-gray-50 rounded-lg p-4 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Order Summary</h3>
      <div class="flex justify-between items-center">
        <span class="text-gray-600">
          {{ selectedPackage.credits }} Credit{{
            selectedPackage.credits !== 1 ? 's' : ''
          }}
        </span>
        <span class="text-xl font-bold text-gray-900">
          ${{ selectedPackage.price.toFixed(2) }}
        </span>
      </div>
      <div class="text-sm text-gray-500 mt-1">
        ${{ selectedPackage.pricePerCredit.toFixed(3) }} per credit
      </div>
    </div>

    <!-- Payment Button -->
    <div class="text-center">
      <button
        @click="handlePurchase"
        :disabled="!selectedPackage || isLoading"
        class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span v-if="isLoading" class="flex items-center">
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
          Processing...
        </span>
        <span v-else-if="selectedPackage">
          Purchase {{ selectedPackage.credits }} Credit{{
            selectedPackage.credits !== 1 ? 's' : ''
          }}
          - ${{ selectedPackage.price.toFixed(2) }}
        </span>
        <span v-else>Select a Package</span>
      </button>
    </div>

    <!-- Payment Info -->
    <div class="mt-6 text-center text-sm text-gray-500">
      <p>Secure payment powered by Stripe</p>
      <p class="mt-1">Credits never expire and are non-refundable</p>
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
import { ref, computed } from 'vue';
import { useCreditStore } from '../../stores/creditStore.js';
import { storeToRefs } from 'pinia';

// Emits
const emit = defineEmits(['purchase-initiated', 'purchase-completed']);

// Store
const creditStore = useCreditStore();
const { creditPackages, isLoading, error } = storeToRefs(creditStore);

// Reactive state
const selectedPackage = ref(null);

// Computed
const basePrice = computed(() => {
  // Use the 5-credit package as base for calculating savings
  const basePackage = creditPackages.value.find((pkg) => pkg.credits === 5);
  return basePackage ? basePackage.pricePerCredit : 0.998;
});

// Methods
const selectPackage = (package_item) => {
  selectedPackage.value = package_item;
};

const calculateSavings = (package_item) => {
  if (!basePrice.value) return 0;
  const savings =
    ((basePrice.value - package_item.pricePerCredit) / basePrice.value) * 100;
  return Math.round(savings);
};

const handlePurchase = async () => {
  if (!selectedPackage.value) return;

  emit('purchase-initiated', selectedPackage.value);

  try {
    // This will be implemented when we add Stripe integration
    // For now, we'll emit the event and let the parent handle it
    console.log('Initiating purchase for:', selectedPackage.value);

    // TODO: Implement Stripe checkout
    // const result = await initiateStripeCheckout(selectedPackage.value)
    // if (result.success) {
    //   emit('purchase-completed', result)
    // }
  } catch (err) {
    console.error('Purchase error:', err);
  }
};

// Auto-select the most popular package on mount
const autoSelectPopular = () => {
  const popularPackage = creditPackages.value.find((pkg) => pkg.credits === 25);
  if (popularPackage) {
    selectedPackage.value = popularPackage;
  }
};

// Initialize
autoSelectPopular();
</script>
