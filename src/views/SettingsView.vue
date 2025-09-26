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
            Studio Preferences
          </div>
          <div class="space-y-3">
            <h1
              class="text-balance text-4xl font-semibold leading-tight text-[var(--color-card-foreground)] sm:text-5xl"
            >
              Fine-tune SwitchFit Studio to match your creative flow.
            </h1>
            <p
              class="text-lg leading-relaxed text-[var(--color-muted-foreground)]"
            >
              Control image processing defaults and manage privacy preferences —
              all with the same polished visual language as the rest of the
              application.
            </p>
          </div>
        </div>

        <div
          class="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_oklch,var(--color-muted)_38%,transparent)]/70 p-6 shadow-border"
        >
          <h2
            class="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-muted-foreground)]"
          >
            Current status
          </h2>
          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between gap-3">
              <span class="text-[var(--color-muted-foreground)]"
                >AI Service</span
              >
              <span
                class="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklch,var(--color-success-500)_32%,transparent)] bg-[color-mix(in_oklch,var(--color-success-500)_12%,transparent)] px-3 py-1 text-xs font-semibold text-[color-mix(in_oklch,var(--color-success-500)_80%,transparent)]"
              >
                <span
                  class="h-2 w-2 rounded-full bg-[var(--color-success-500)]"
                ></span>
                Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div class="space-y-6">
        <div
          class="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-6 shadow-soft"
        >
          <header class="flex items-start justify-between gap-3">
            <div class="space-y-1.5">
              <h2
                class="text-xl font-semibold text-[var(--color-card-foreground)]"
              >
                Image processing defaults
              </h2>
              <p
                class="text-sm leading-relaxed text-[var(--color-muted-foreground)]"
              >
                These defaults are applied whenever you launch a new outfit
                blend session. Override them per generation whenever you need
                finer control.
              </p>
            </div>
          </header>

          <div class="mt-6 space-y-5">
            <div class="grid gap-5 sm:grid-cols-2">
              <div class="space-y-2">
                <label
                  for="max-image-size"
                  class="text-sm font-semibold text-[var(--color-card-foreground)]"
                >
                  Maximum image size (MB)
                </label>
                <select
                  id="max-image-size"
                  v-model="settings.maxImageSize"
                  class="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium text-[var(--color-card-foreground)] transition focus:border-[var(--color-brand-500)] focus:outline-none focus:ring-0"
                >
                  <option value="5">5 MB</option>
                  <option value="10">10 MB</option>
                  <option value="15">15 MB</option>
                  <option value="20">20 MB</option>
                </select>
                <p class="text-xs text-[var(--color-muted-foreground)]">
                  Larger image uploads provide more detail but will take longer
                  to process.
                </p>
              </div>

              <div class="space-y-2">
                <label
                  for="image-quality"
                  class="text-sm font-semibold text-[var(--color-card-foreground)]"
                >
                  Output image quality
                </label>
                <select
                  id="image-quality"
                  v-model="settings.imageQuality"
                  class="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium text-[var(--color-card-foreground)] transition focus:border-[var(--color-brand-500)] focus:outline-none focus:ring-0"
                >
                  <option value="0.7">Standard (70%)</option>
                  <option value="0.8">High (80%)</option>
                  <option value="0.9">Very High (90%)</option>
                  <option value="1.0">Maximum (100%)</option>
                </select>
                <p class="text-xs text-[var(--color-muted-foreground)]">
                  Higher quality improves textures and lighting continuity at
                  the cost of file size.
                </p>
              </div>
            </div>

            <div>
              <label
                class="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-muted)]/40 px-4 py-3 text-sm text-[var(--color-card-foreground)] transition hover:border-[var(--color-brand-500)]"
              >
                <input
                  id="auto-resize"
                  v-model="settings.autoResize"
                  type="checkbox"
                  class="mt-1 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-brand-500)] focus:ring-[var(--color-brand-500)]"
                />
                <div>
                  <p class="font-semibold">Automatically resize large images</p>
                  <p class="text-xs text-[var(--color-muted-foreground)]">
                    Maintain the best balance between detail and performance
                    when users upload oversized assets.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div
          class="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-6 shadow-soft"
        >
          <header class="space-y-1.5">
            <h2
              class="text-xl font-semibold text-[var(--color-card-foreground)]"
            >
              Privacy & data handling
            </h2>
            <p
              class="text-sm leading-relaxed text-[var(--color-muted-foreground)]"
            >
              Control how SwitchFit stores try-on history and when it should
              expire from your device.
            </p>
          </header>

          <div class="mt-6 space-y-5">
            <label
              class="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-muted)]/40 px-4 py-3 text-sm text-[var(--color-card-foreground)] transition hover:border-[var(--color-brand-500)]"
            >
              <input
                id="save-history"
                v-model="settings.saveHistory"
                type="checkbox"
                class="mt-1 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-brand-500)] focus:ring-[var(--color-brand-500)]"
              />
              <div>
                <p class="font-semibold">Save try-on history locally</p>
                <p class="text-xs text-[var(--color-muted-foreground)]">
                  Keep a rotating library of recently generated outfits directly
                  in your browser.
                </p>
              </div>
            </label>

            <div class="space-y-2">
              <label
                for="auto-delete"
                class="text-sm font-semibold text-[var(--color-card-foreground)]"
              >
                Auto-delete history after
              </label>
              <select
                id="auto-delete"
                v-model="settings.autoDeleteDays"
                :disabled="!settings.saveHistory"
                class="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium text-[var(--color-card-foreground)] transition focus:border-[var(--color-brand-500)] focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="0">Never</option>
              </select>
              <p class="text-xs text-[var(--color-muted-foreground)]">
                Set to “Never” to retain the full archive or shorten the window
                for added privacy.
              </p>
            </div>

            <div
              class="rounded-2xl border border-dashed border-[color-mix(in_oklch,var(--color-destructive-500)_40%,transparent)] bg-[color-mix(in_oklch,var(--color-destructive-500)_12%,transparent)]/60 px-4 py-4"
            >
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="space-y-1">
                  <p
                    class="text-sm font-semibold text-[var(--color-destructive-500)]"
                  >
                    Reset local studio data
                  </p>
                  <p class="text-xs text-[var(--color-destructive-500)]/80">
                    Clears settings, saved try-ons, and cached API credentials
                    from this device.
                  </p>
                </div>
                <button
                  type="button"
                  @click="clearAllData"
                  class="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklch,var(--color-destructive-500)_60%,transparent)] bg-[color-mix(in_oklch,var(--color-destructive-500)_16%,transparent)] px-4 py-2 text-xs font-semibold text-[var(--color-destructive-500)] transition hover:opacity-90"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M6 6h12m-9 3v8m6-8v8M10 6l1-2h2l1 2"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  Clear all data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div
          class="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-6 shadow-soft"
        >
          <h2 class="text-xl font-semibold text-[var(--color-card-foreground)]">
            About
          </h2>
          <div
            class="mt-5 space-y-4 text-sm text-[var(--color-muted-foreground)]"
          >
            <div class="flex items-start justify-between gap-3">
              <span class="font-semibold text-[var(--color-card-foreground)]"
                >Version</span
              >
              <span>SwitchFit Studio v1.0.0</span>
            </div>
            <div>
              <p class="font-semibold text-[var(--color-card-foreground)]">
                Technology
              </p>
              <p class="mt-1 leading-relaxed">
                Powered by Google Gemini 2.5 Flash, OpenRouter, Vue 3, and
                custom computer-vision pipelines for premium outfit synthesis.
              </p>
            </div>
            <div>
              <p class="font-semibold text-[var(--color-card-foreground)]">
                Support
              </p>
              <p class="mt-1 leading-relaxed">
                Visit our
                <a
                  href="#"
                  class="font-semibold text-[var(--color-brand-600)] underline transition hover:text-[var(--color-brand-500)]"
                >
                  documentation
                </a>
                or contact
                <a
                  href="mailto:support@clothingai.com"
                  class="font-semibold text-[var(--color-brand-600)] underline transition hover:text-[var(--color-brand-500)]"
                >
                  support@clothingai.com
                </a>
                for assistance.
              </p>
            </div>
          </div>
        </div>

        <div
          class="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[color-mix(in_oklch,var(--color-muted)_30%,transparent)]/70 px-6 py-6 shadow-soft"
        >
          <div
            class="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-gradient-to-br from-indigo-500/25 via-purple-400/20 to-sky-400/20 blur-3xl"
          ></div>
          <div
            class="pointer-events-none absolute -bottom-28 left-0 h-60 w-60 rounded-full bg-gradient-to-tl from-emerald-400/20 via-sky-300/18 to-transparent blur-3xl"
          ></div>

          <div class="relative space-y-4">
            <div class="space-y-1">
              <p
                class="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-muted-foreground)]"
              >
                Save configuration
              </p>
              <h3
                class="text-lg font-semibold text-[var(--color-card-foreground)]"
              >
                Apply your latest preferences across the studio.
              </h3>
              <p class="text-sm text-[var(--color-muted-foreground)]">
                Settings persist locally so each session starts ready for new
                inspiration.
              </p>
            </div>
            <button
              type="button"
              @click="saveSettings"
              class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:opacity-95"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Save all settings
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { useAppStore } from '../stores/app';

const appStore = useAppStore();

const settings = reactive({
  maxImageSize: 10,
  imageQuality: 0.9,
  autoResize: true,
  saveHistory: true,
  autoDeleteDays: 30,
});

onMounted(() => {
  loadSettings();
});

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
    localStorage.removeItem('app_settings');
    localStorage.removeItem('recentTryOns');
    localStorage.removeItem('wardrobe_items');

    Object.assign(settings, {
      maxImageSize: 10,
      imageQuality: 0.9,
      autoResize: true,
      saveHistory: true,
      autoDeleteDays: 30,
    });

    appStore.addToast({
      type: 'success',
      title: 'Data Cleared',
      message: 'All local data has been cleared successfully!',
    });
  }
};
</script>
