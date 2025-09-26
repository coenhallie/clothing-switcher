<template>
  <div class="flex flex-col gap-10">
    <section
      class="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[color-mix(in_oklch,var(--color-surface)_85%,transparent)] px-8 py-10 shadow-soft"
    >
      <div
        class="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/30 via-purple-400/25 to-sky-300/20 blur-3xl"
      ></div>
      <div
        class="pointer-events-none absolute -left-16 bottom-[-120px] h-72 w-72 rounded-full bg-gradient-to-tr from-sky-400/25 via-emerald-400/15 to-indigo-300/10 blur-3xl"
      ></div>

      <div
        class="flex flex-col gap-8 md:flex-row md:items-start md:justify-between"
      >
        <div class="max-w-2xl space-y-5">
          <div
            class="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklch,var(--color-brand-500)_25%,transparent)] bg-[color-mix(in_oklch,var(--color-brand-500)_12%,transparent)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-brand-600)]"
          >
            Simple Try-On Engine
          </div>
          <div class="space-y-3">
            <h1
              class="text-balance text-4xl font-semibold leading-tight text-[var(--color-card-foreground)] sm:text-5xl"
            >
              Blend your inspiration with your own wardrobe in seconds.
            </h1>
            <p
              class="text-lg leading-relaxed text-[var(--color-muted-foreground)]"
            >
              Upload the look you love, add your portrait, and SwitchFit Studio
              synthesizes a realistic try-on that fuses silhouettes, fabrics,
              and lighting for a polished preview.
            </p>
          </div>
        </div>

        <div
          class="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_oklch,var(--color-muted)_38%,transparent)]/70 p-6 shadow-border"
        >
          <h2
            class="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-muted-foreground)]"
          >
            Workflow
          </h2>
          <ol class="space-y-4">
            <li
              v-for="(step, index) in workflowSteps"
              :key="step.title"
              class="flex items-start gap-3"
            >
              <span
                class="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-[var(--color-border)] bg-[color-mix(in_oklch,var(--color-brand-500)_12%,transparent)] text-sm font-semibold text-[var(--color-brand-600)]"
              >
                {{ index + 1 }}
              </span>
              <div class="space-y-1">
                <p
                  class="text-sm font-semibold text-[var(--color-card-foreground)]"
                >
                  {{ step.title }}
                </p>
                <p
                  class="text-xs leading-relaxed text-[var(--color-muted-foreground)]"
                >
                  {{ step.description }}
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>

    <section class="space-y-6">
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div
          class="flex flex-col gap-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-6 shadow-soft"
        >
          <header class="flex items-center justify-between">
            <div class="space-y-1.5">
              <h3
                class="text-lg font-semibold text-[var(--color-card-foreground)]"
              >
                Source inspiration
              </h3>
              <p
                class="text-sm leading-relaxed text-[var(--color-muted-foreground)]"
              >
                Upload the reference outfit you want mimicked. High-quality
                lighting improves texture blending.
              </p>
            </div>
          </header>

          <div
            class="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[color-mix(in_oklch,var(--color-border)_80%,transparent)] bg-[color-mix(in_oklch,var(--color-muted)_35%,transparent)]/80 p-10 transition"
            :class="{
              'border-[var(--color-brand-500)] bg-[color-mix(in_oklch,var(--color-brand-500)_10%,transparent)]':
                sourceImage,
            }"
          >
            <input
              ref="sourceFileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleSourceImageUpload"
            />

            <template v-if="!sourceImage">
              <div class="flex flex-col items-center gap-4 text-center">
                <div
                  class="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--color-border)] bg-[color-mix(in_oklch,var(--color-muted)_45%,transparent)]"
                >
                  <svg
                    class="h-8 w-8 text-[var(--color-muted-foreground)]"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 5v14m7-7H5"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                  </svg>
                </div>
                <div class="space-y-1">
                  <p
                    class="text-base font-semibold text-[var(--color-card-foreground)]"
                  >
                    Drag & drop or browse
                  </p>
                  <p class="text-xs text-[var(--color-muted-foreground)]">
                    Upload PNG, JPG, WEBP up to 10MB
                  </p>
                </div>
                <button
                  type="button"
                  @click="$refs.sourceFileInput.click()"
                  class="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2 text-sm font-medium text-[var(--color-card-foreground)] transition hover:border-[var(--color-brand-500)] hover:bg-[color-mix(in_oklch,var(--color-brand-500)_12%,transparent)]"
                >
                  Select inspiration
                </button>
              </div>
            </template>

            <template v-else>
              <div
                class="relative w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-black/10"
              >
                <img
                  :src="sourceImage"
                  alt="Source clothing reference"
                  class="h-72 w-full object-cover"
                />
                <div
                  class="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs font-semibold text-white shadow-soft backdrop-blur-md"
                >
                  Inspiration
                </div>
                <button
                  type="button"
                  @click="removeSourceImage"
                  class="absolute top-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white transition hover:border-white/60 hover:bg-black/80"
                  title="Remove source image"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <path
                      d="m8 8 8 8m0-8-8 8"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
              </div>
            </template>
          </div>
        </div>

        <div
          class="flex flex-col gap-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-6 shadow-soft"
        >
          <header class="flex items-center justify-between">
            <div class="space-y-1.5">
              <h3
                class="text-lg font-semibold text-[var(--color-card-foreground)]"
              >
                Subject portrait
              </h3>
              <p
                class="text-sm leading-relaxed text-[var(--color-muted-foreground)]"
              >
                Add your full or half-body photo with clear lighting. The AI
                will match the pose to the source.
              </p>
            </div>
          </header>

          <div
            class="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[color-mix(in_oklch,var(--color-border)_80%,transparent)] bg-[color-mix(in_oklch,var(--color-muted)_35%,transparent)]/80 p-10 transition"
            :class="{
              'border-[var(--color-brand-500)] bg-[color-mix(in_oklch,var(--color-brand-500)_10%,transparent)]':
                targetImage,
            }"
          >
            <input
              ref="targetFileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleTargetImageUpload"
            />

            <template v-if="!targetImage">
              <div class="flex flex-col items-center gap-4 text-center">
                <div
                  class="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--color-border)] bg-[color-mix(in_oklch,var(--color-muted)_45%,transparent)]"
                >
                  <svg
                    class="h-8 w-8 text-[var(--color-muted-foreground)]"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="m7 14 3-3 4 4 2-2 4 4M3 5h6M5 3v6"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                  </svg>
                </div>
                <div class="space-y-1">
                  <p
                    class="text-base font-semibold text-[var(--color-card-foreground)]"
                  >
                    Drag & drop or browse
                  </p>
                  <p class="text-xs text-[var(--color-muted-foreground)]">
                    Upload PNG, JPG, WEBP up to 10MB
                  </p>
                </div>
                <button
                  type="button"
                  @click="$refs.targetFileInput.click()"
                  class="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2 text-sm font-medium text-[var(--color-card-foreground)] transition hover:border-[var(--color-brand-500)] hover:bg-[color-mix(in_oklch,var(--color-brand-500)_12%,transparent)]"
                >
                  Upload portrait
                </button>
              </div>
            </template>

            <template v-else>
              <div
                class="relative w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-black/10"
              >
                <img
                  :src="targetImage"
                  alt="Target portrait"
                  class="h-72 w-full object-cover"
                />
                <div
                  class="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs font-semibold text-white shadow-soft backdrop-blur-md"
                >
                  Subject
                </div>
                <button
                  type="button"
                  @click="removeTargetImage"
                  class="absolute top-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white transition hover:border-white/60 hover:bg-black/80"
                  title="Remove portrait"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <path
                      d="m8 8 8 8m0-8-8 8"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div
        class="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[var(--color-border)] bg-[color-mix(in_oklch,var(--color-muted)_30%,transparent)]/70 px-6 py-5"
      >
        <div class="space-y-1">
          <p class="text-sm font-semibold text-[var(--color-card-foreground)]">
            {{ ctaHeadline }}
          </p>
          <p class="text-sm text-[var(--color-muted-foreground)]">
            {{ ctaSubtext }}
          </p>
        </div>

        <button
          v-if="isAuthenticated"
          type="button"
          @click="generateClothingMimic"
          :disabled="!canGenerate || isGenerating"
          class="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <template v-if="isGenerating">
            <svg
              class="h-4 w-4 animate-spin text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-20"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="1.5"
              />
              <path
                d="M4 12a8 8 0 0 1 8-8"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
            Generating outfit blend...
          </template>
          <template v-else>
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 5v14m7-7H5"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
            {{
              hasCredits
                ? 'Generate outfit blend (1 credit)'
                : 'Purchase credits to generate'
            }}
          </template>
        </button>

        <div
          v-else
          class="flex flex-col items-start gap-2 text-sm text-[var(--color-muted-foreground)]"
        >
          <p>
            Create a SwitchFit Studio account to receive an instant credit and
            unlock AI blending.
          </p>
          <button
            type="button"
            @click="openAuthModalSignup"
            class="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-card-foreground)] transition hover:border-[var(--color-brand-500)] hover:bg-[color-mix(in_oklch,var(--color-brand-500)_12%,transparent)]"
          >
            Get started — it’s free
          </button>
        </div>
      </div>
    </section>

    <section
      v-if="resultImage"
      class="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-6 shadow-soft"
    >
      <header class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-xl font-semibold text-[var(--color-card-foreground)]">
            Generated preview
          </h2>
          <p class="text-sm text-[var(--color-muted-foreground)]">
            Your silhouette blended with the selected inspiration.
          </p>
        </div>
        <button
          type="button"
          @click="downloadResult"
          class="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-card-foreground)] transition hover:border-[var(--color-brand-500)] hover:bg-[color-mix(in_oklch,var(--color-brand-500)_12%,transparent)]"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24">
            <path
              d="M12 4v12m0 0 4-4m-4 4-4-4m-4 8h16"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          Download PNG
        </button>
      </header>
      <div
        class="mt-6 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-black/5"
      >
        <img
          :src="resultImage"
          alt="Generated outfit result"
          class="mx-auto max-h-[520px] w-full object-contain"
        />
      </div>
    </section>

    <section
      v-if="errorMessage"
      class="rounded-3xl border border-[color-mix(in_oklch,var(--color-destructive-500)_35%,transparent)] bg-[color-mix(in_oklch,var(--color-destructive-500)_12%,transparent)]/80 px-6 py-5 shadow-soft"
    >
      <div class="flex items-start gap-3">
        <span
          class="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--color-destructive-500)_20%,transparent)] text-[var(--color-destructive-500)]"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24">
            <path
              d="M12 8v5m0 4h.01"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <path
              d="M4.47 19h15.06a1 1 0 0 0 .87-1.5L12.87 4.5a1 1 0 0 0-1.74 0L3.6 17.5A1 1 0 0 0 4.47 19Z"
              stroke="currentColor"
              stroke-width="1.5"
            />
          </svg>
        </span>
        <div>
          <h3 class="text-sm font-semibold text-[var(--color-card-foreground)]">
            Generation failed
          </h3>
          <p class="mt-1 text-sm text-[var(--color-muted-foreground)]">
            {{ errorMessage }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useAppStore } from '../stores/app';
import { useAuthStore } from '../stores/authStore';
import { useCreditStore } from '../stores/creditStore';
import { useModals } from '../composables/useModals';
import openRouterService from '../services/openRouterService';
import geminiService from '../services/geminiService';
import GalleryService from '../services/galleryService';
import CreditBalance from '../components/credits/CreditBalance.vue';

const appStore = useAppStore();
const authStore = useAuthStore();
const creditStore = useCreditStore();
const { openAuthModal, openPurchaseModal } = useModals();

const { isAuthenticated } = storeToRefs(authStore);
const { canGenerate: hasCredits, credits } = storeToRefs(creditStore);

const sourceImage = ref(null);
const targetImage = ref(null);
const sourceFile = ref(null);
const targetFile = ref(null);
const resultImage = ref(null);
const isGenerating = ref(false);
const errorMessage = ref('');

const workflowSteps = [
  {
    title: 'Upload inspiration outfit',
    description:
      'Choose the style or garment reference that captures the look you want to transfer.',
  },
  {
    title: 'Add your portrait',
    description:
      'Use a clear photo in similar lighting to ensure fabrics and tones blend realistically.',
  },
  {
    title: 'Generate outfit blend',
    description:
      'SwitchFit merges silhouettes, fabrics, and lighting to preview your tailored look.',
  },
];

const hasImages = computed(() => sourceFile.value && targetFile.value);

const ctaHeadline = computed(() =>
  hasImages.value
    ? 'Ready to blend your inspiration with your wardrobe.'
    : 'Add both images to unlock your studio preview.'
);

const ctaSubtext = computed(() => {
  if (!hasImages.value) {
    return 'Upload an inspiration outfit and your portrait to activate the generator.';
  }
  if (!isAuthenticated.value) {
    return 'Sign in or create an account to receive your free starter credit.';
  }
  if (!hasCredits.value) {
    return 'You need at least one credit available. Purchase credits to keep generating looks.';
  }
  return 'Every generation uses a single credit.';
});

const canGenerate = computed(() => {
  if (!isAuthenticated.value) return false;
  return hasImages.value && !isGenerating.value && hasCredits.value;
});

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

  if (!isAuthenticated.value) {
    appStore.addToast({
      type: 'error',
      title: 'Authentication required',
      message: 'Sign in to generate outfit blends.',
    });
    return;
  }

  if (!hasCredits.value) {
    appStore.addToast({
      type: 'error',
      title: 'No credits available',
      message: 'Top up your credits to continue generating looks.',
    });
    return;
  }

  isGenerating.value = true;
  errorMessage.value = '';
  resultImage.value = null;

  try {
    const creditResult = await creditStore.useCredit(1, 'AI outfit generation');
    if (!creditResult.success) {
      throw new Error(creditResult.error);
    }

    let result;
    let creditUsed = true;

    try {
      // Use OpenRouter service with hardcoded API key
      result = await openRouterService.generateClothingTransfer(
        sourceFile.value,
        targetFile.value
      );

      if (result.success && result.imageUrl) {
        resultImage.value = result.imageUrl;

        // Save to gallery
        try {
          const imageData = {
            originalImageUrl: sourceImage.value,
            generatedImageUrl: result.imageUrl,
            prompt: result.prompt || 'AI outfit generation',
            styleDescription: 'Clothing style transfer',
            fileSize: null, // Will be calculated if needed
            imageWidth: null, // Will be calculated if needed
            imageHeight: null, // Will be calculated if needed
          };

          const galleryResult = await GalleryService.saveImage(imageData);
          if (galleryResult.success) {
            console.log('Image saved to gallery successfully');
          } else {
            console.warn(
              'Failed to save image to gallery:',
              galleryResult.error
            );
          }
        } catch (galleryError) {
          console.error('Error saving to gallery:', galleryError);
          // Don't fail the generation if gallery save fails
        }

        appStore.addToast({
          type: 'success',
          title: 'Outfit blend ready',
          message: `Preview rendered successfully. ${creditResult.newBalance} credits remaining.`,
        });
      } else {
        await creditStore.addCredits(
          1,
          'refunded',
          'Refund for failed generation - no image generated'
        );
        creditUsed = false;

        if (result.error === 'NO_IMAGE_GENERATED') {
          throw new Error(
            result.message ||
              'The AI was unable to generate a look. Try different images or adjust lighting.'
          );
        } else {
          throw new Error(result.message || 'Failed to generate outfit blend.');
        }
      }
    } catch (apiError) {
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
      title: 'Generation failed',
      message: error.message,
    });
  } finally {
    isGenerating.value = false;
  }
};

const openAuthModalSignup = () => {
  openAuthModal('signup');
};

const openPurchaseCredits = () => {
  openPurchaseModal();
};

const downloadResult = () => {
  if (!resultImage.value) return;

  const link = document.createElement('a');
  link.href = resultImage.value;
  link.download = `switchfit-outfit-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<style scoped>
/* Add any component-specific styles here if needed */
</style>
