<template>
  <div class="flex flex-col min-h-full text-[var(--color-card-foreground)]">
    <div class="flex flex-col gap-8 pb-40">
      <div class="flex flex-col items-center gap-3 text-center">
        <p
          class="max-w-2xl text-sm leading-relaxed text-[color-mix(in_oklch,var(--color-muted-foreground)_88%,transparent)]"
        >
          Choose the bundle that matches your creative flow. Credits power
          outfit transformations and never expire.
        </p>
      </div>

      <div
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        role="radiogroup"
        aria-label="Choose a credit package"
      >
        <button
          v-for="package_item in creditPackages"
          :key="package_item.credits"
          type="button"
          role="radio"
          :aria-checked="selectedPackage?.credits === package_item.credits"
          @click="selectPackage(package_item)"
          class="group relative flex h-full w-full flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_oklch,var(--color-card)_94%,transparent)] p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-[var(--color-brand-400)] hover:bg-[color-mix(in_oklch,var(--color-brand-500)_12%,var(--color-card))] hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]"
          :class="{
            'border-transparent ring-2 ring-[var(--color-brand-500)] ring-offset-2 ring-offset-[var(--color-surface)] bg-[color-mix(in_oklch,var(--color-brand-500)_18%,var(--color-card))] shadow-soft':
              selectedPackage?.credits === package_item.credits,
          }"
        >
          <div
            v-if="package_item.credits === 25 || package_item.credits === 100"
            class="absolute left-1/2 top-0 -translate-y-1/2 -translate-x-1/2"
          >
            <span
              class="inline-flex items-center gap-1 rounded-full border border-[color-mix(in_oklch,var(--color-brand-500)_55%,transparent)] bg-[color-mix(in_oklch,var(--color-brand-500)_20%,var(--color-card))] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-brand-600)] shadow-[0_10px_25px_-18px_color-mix(in_oklch,var(--color-brand-500)_100%,transparent)]"
            >
              <svg
                class="h-3 w-3"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M9.5 2.5 7 7l-4.5.65L5.5 11l-.8 4.5L9.5 13l4.8 2.5-.8-4.5L18 7.65 13.5 7l-2.5-4.5Z"
                  stroke-width="1.4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              {{ package_item.credits === 25 ? 'Most popular' : 'Best value' }}
            </span>
          </div>

          <div
            v-if="selectedPackage?.credits === package_item.credits"
            class="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-[color-mix(in_oklch,var(--color-brand-500)_55%,transparent)] bg-[color-mix(in_oklch,var(--color-brand-500)_18%,var(--color-card))] text-[var(--color-brand-600)] shadow-soft"
          >
            <svg
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M5 10.5 8.5 14 15 7"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <div class="flex flex-1 flex-col items-center gap-2 text-center">
            <p
              class="text-xs font-semibold uppercase tracking-[0.3em] text-[color-mix(in_oklch,var(--color-muted-foreground)_80%,transparent)]"
            >
              {{ package_item.credits }} credit{{
                package_item.credits !== 1 ? 's' : ''
              }}
            </p>
            <p class="text-4xl font-bold text-[var(--color-card-foreground)]">
              ${{ package_item.price.toFixed(2) }}
            </p>
            <p
              class="text-sm text-[color-mix(in_oklch,var(--color-muted-foreground)_85%,transparent)]"
            >
              ${{ package_item.pricePerCredit.toFixed(3) }} per credit
            </p>
            <p
              v-if="package_item.credits > 5"
              class="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_oklch,var(--color-success-500)_16%,var(--color-card))] px-3 py-1 text-xs font-semibold text-[var(--color-success-500)]"
            >
              <svg
                class="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M4.5 10.5 8 14l7.5-8"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Save {{ calculateSavings(package_item) }}%
            </p>
          </div>

          <div
            class="grid w-full gap-2 text-sm text-[color-mix(in_oklch,var(--color-muted-foreground)_85%,transparent)]"
          ></div>
        </button>
      </div>
    </div>

    <div
      class="sticky bottom-0 -mx-6 -mb-6 space-y-4 border-t border-[var(--color-border)] bg-[color-mix(in_oklch,var(--color-surface)_97%,transparent)] px-6 pt-6 pb-6 backdrop-blur-lg"
    >
      <div
        class="rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_oklch,var(--color-card)_96%,transparent)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
      >
        <template v-if="selectedPackage">
          <div
            class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="text-center sm:text-left">
              <p
                class="text-xs font-semibold uppercase tracking-[0.28em] text-[color-mix(in_oklch,var(--color-muted-foreground)_80%,transparent)]"
              >
                Order summary
              </p>
              <h3
                class="mt-1 text-xl font-semibold text-[var(--color-card-foreground)]"
              >
                {{ selectedPackage.credits }} credit{{
                  selectedPackage.credits !== 1 ? 's' : ''
                }}
              </h3>
            </div>
            <div
              class="flex flex-col items-center gap-1 text-center sm:items-end sm:text-right"
            >
              <p
                class="text-3xl font-semibold text-[var(--color-card-foreground)]"
              >
                ${{ selectedPackage.price.toFixed(2) }}
              </p>
              <span
                class="text-sm text-[color-mix(in_oklch,var(--color-muted-foreground)_85%,transparent)]"
              >
                ${{ selectedPackage.pricePerCredit.toFixed(3) }}/credit
              </span>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="flex flex-col items-center gap-3 text-center">
            <p
              class="text-xs font-semibold uppercase tracking-[0.28em] text-[color-mix(in_oklch,var(--color-muted-foreground)_80%,transparent)]"
            >
              Order summary
            </p>
            <p
              class="text-sm leading-relaxed text-[color-mix(in_oklch,var(--color-muted-foreground)_85%,transparent)]"
            >
              Select a credit package to view pricing details and checkout
              options.
            </p>
          </div>
        </template>
      </div>

      <div class="flex flex-col items-center gap-4">
        <button
          @click="handlePurchase"
          :disabled="!selectedPackage || isLoading"
          class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-brand-500)] via-[color-mix(in_oklch,var(--color-brand-500)_70%,var(--color-brand-300))] to-[var(--color-brand-400)] px-10 py-3 text-base font-semibold text-white shadow-soft transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <span v-if="isLoading" class="flex items-center gap-3">
            <svg
              class="h-5 w-5 animate-spin text-white"
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
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing checkout…
          </span>
          <span v-else-if="selectedPackage">
            Purchase {{ selectedPackage.credits }} credit{{
              selectedPackage.credits !== 1 ? 's' : ''
            }}
            · ${{ selectedPackage.price.toFixed(2) }}
          </span>
          <span v-else>Select a package</span>
        </button>

        <div
          class="flex flex-col items-center gap-1 text-xs text-[color-mix(in_oklch,var(--color-muted-foreground)_80%,transparent)]"
        >
          <p class="inline-flex items-center gap-2">
            <svg
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
            Secure checkout powered by Stripe
          </p>
          <p>Credits are non-refundable and can be shared across workspaces.</p>
        </div>
      </div>

      <div
        v-if="error"
        class="rounded-2xl border border-[color-mix(in_oklch,var(--color-destructive-500)_55%,transparent)] bg-[color-mix(in_oklch,var(--color-destructive-500)_16%,var(--color-card))] p-4 text-sm text-[var(--color-destructive-500)]"
      >
        {{ error }}
      </div>
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
