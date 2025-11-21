<template>
  <div class="flex flex-col gap-10">
    <!-- Hero Container - Hidden on Mobile -->
    <section
      class="hero-container relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[color-mix(in_oklch,var(--color-surface)_85%,transparent)] px-8 py-10 shadow-soft"
    >
      <div class="pointer-events-none absolute inset-0 z-0">
        <img
          :src="heroFashionBg"
          alt=""
          class="h-full w-full object-cover opacity-60"
          aria-hidden="true"
        />
        <div
          class="absolute inset-0 bg-gradient-to-br from-[rgba(16,20,38,0.85)] via-[rgba(32,21,58,0.78)] to-[rgba(18,30,52,0.7)] backdrop-blur-[2px]"
        ></div>
      </div>
      <div
        class="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/30 via-purple-400/25 to-sky-300/20 blur-3xl"
      ></div>
      <div
        class="pointer-events-none absolute -left-16 bottom-[-120px] h-72 w-72 rounded-full bg-gradient-to-tr from-sky-400/25 via-emerald-400/15 to-indigo-300/10 blur-3xl"
      ></div>

      <div
        class="relative z-10 flex flex-col gap-8 md:flex-row md:items-start md:justify-between"
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
                <span v-if="sourceImages.length > 0" class="text-sm font-normal text-[var(--color-muted-foreground)]">
                  ({{ sourceImages.length }}/{{ maxSourceImages }})
                </span>
              </h3>
              <p
                class="text-sm leading-relaxed text-[var(--color-muted-foreground)]"
              >
                Upload up to {{ maxSourceImages }} reference outfits. High-quality lighting improves texture blending.
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
              multiple
              class="hidden"
              @change="handleSourceImageUpload"
            />

            <template v-if="sourceImages.length === 0">
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
                    Upload PNG, JPG, WEBP up to 10MB (max {{ maxSourceImages }})
                  </p>
                </div>
                <button
                  type="button"
                  @click="$refs.sourceFileInput.click()"
                  class="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2 text-sm font-medium text-[var(--color-card-foreground)] transition hover:border-[var(--color-brand-500)] hover:bg-[color-mix(in_oklch,var(--color-brand-500)_12%,transparent)]"
                >
                  Select inspiration images
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
                  @click="removeSourceImage()"
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

          <!-- Thumbnail Gallery -->
          <div v-if="sourceImages.length > 0" class="space-y-3">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-[var(--color-muted-foreground)]">
                Your inspiration images
              </p>
              <button
                v-if="sourceImages.length < maxSourceImages"
                type="button"
                @click="$refs.sourceFileInput.click()"
                class="text-xs text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] font-medium"
              >
                + Add more
              </button>
            </div>
            
            <div class="grid grid-cols-5 gap-2">
              <button
                v-for="(img, index) in sourceImages"
                :key="index"
                type="button"
                @click="selectSourceImage(index)"
                class="relative aspect-square rounded-lg overflow-hidden border-2 transition group"
                :class="{
                  'border-[var(--color-brand-500)] ring-2 ring-[var(--color-brand-500)]/30': index === selectedSourceIndex,
                  'border-[var(--color-border)] hover:border-[var(--color-brand-400)]': index !== selectedSourceIndex
                }"
              >
                <img
                  :src="img.preview"
                  :alt="`Inspiration ${index + 1}`"
                  class="w-full h-full object-cover"
                />
                
                <!-- Selected indicator -->
                <div
                  v-if="index === selectedSourceIndex"
                  class="absolute inset-0 bg-[var(--color-brand-500)]/10"
                >
                  <div class="absolute top-1 right-1 bg-[var(--color-brand-500)] rounded-full p-0.5">
                    <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                </div>

                <!-- Generated indicator -->
                <div
                  v-if="resultImages[index]"
                  class="absolute bottom-1 left-1 bg-green-500 rounded-full p-0.5"
                  title="Generated"
                >
                  <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </div>

                <!-- Remove button -->
                <button
                  type="button"
                  @click.stop="removeSourceImage(index)"
                  class="absolute top-1 left-1 h-5 w-5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center hover:bg-black/80"
                  title="Remove"
                >
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24">
                    <path
                      d="m8 8 8 8m0-8-8 8"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
              </button>
            </div>
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

        <div v-if="isAuthenticated" class="flex flex-wrap gap-2">
          <button
            type="button"
            @click="generateClothingMimic()"
            :disabled="!canGenerate || isGenerating"
            class="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <template v-if="isGenerating && !isBulkGenerating">
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
              Generating...
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
                  ? 'Generate current (1 credit)'
                  : 'Purchase credits to generate'
              }}
            </template>
          </button>

          <button
            v-if="sourceImages.length > 1 && hasCredits"
            type="button"
            @click="generateAllImages()"
            :disabled="!canGenerateAll || isGenerating"
            class="group inline-flex items-center gap-3 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <template v-if="isBulkGenerating">
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
              Generating {{ bulkProgress.current }}/{{ bulkProgress.total }}...
            </template>
            <template v-else>
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </svg>
              Generate all {{ sourceImages.length }} ({{ ungeneratedCount }} credits)
            </template>
          </button>
        </div>

        <!-- Desktop: Show unauthenticated CTA with modal trigger -->
        <!-- Mobile: This block is hidden because unauthenticated mobile users are redirected to /auth -->
        <div
          v-else-if="!isMobile"
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
            Get started — it's free
          </button>
        </div>
      </div>
    </section>

    <section
      v-if="Object.keys(resultImages).length > 0"
      class="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-6 shadow-soft"
    >
      <header class="space-y-4">
        <div>
          <h2 class="text-xl font-semibold text-[var(--color-card-foreground)]">
            Generated previews
            <span class="text-sm font-normal text-[var(--color-muted-foreground)]">
              ({{ Object.keys(resultImages).length }}/{{ sourceImages.length }})
            </span>
          </h2>
          <p class="text-sm text-[var(--color-muted-foreground)]">
            Your silhouette blended with each inspiration image.
          </p>
        </div>
      </header>

      <div class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(imageUrl, index) in resultImages"
          :key="index"
          class="relative rounded-2xl border border-[var(--color-border)] bg-black/5 overflow-hidden group"
        >
          <img
            :src="imageUrl"
            :alt="`Generated outfit ${parseInt(index) + 1}`"
            class="w-full h-auto object-contain"
          />
          
          <!-- Image overlay with actions -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div class="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
              <span class="text-white text-sm font-medium">
                Inspiration {{ parseInt(index) + 1 }}
              </span>
              <div class="flex gap-2">
                <button
                  type="button"
                  @click="downloadSingleResult(imageUrl, index)"
                  class="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition"
                  title="Download"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M12 4v12m0 0 4-4m-4 4-4-4m-4 8h16"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  @click="viewFullSize(imageUrl)"
                  class="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition"
                  title="View full size"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M15 3h6m0 0v6m0-6l-7 7M9 21H3m0 0v-6m0 6l7-7"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Source thumbnail indicator -->
          <div class="absolute top-3 left-3 flex items-center gap-2">
            <div class="h-12 w-12 rounded-lg overflow-hidden border-2 border-white/50 shadow-lg">
              <img
                :src="sourceImages[index]?.preview"
                :alt="`Source ${parseInt(index) + 1}`"
                class="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Download all button -->
      <div v-if="Object.keys(resultImages).length > 1" class="mt-6 flex justify-center">
        <button
          type="button"
          @click="downloadAllResults"
          class="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3 text-sm font-medium text-[var(--color-card-foreground)] transition hover:border-[var(--color-brand-500)] hover:bg-[color-mix(in_oklch,var(--color-brand-500)_12%,transparent)]"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24">
            <path
              d="M12 4v12m0 0 4-4m-4 4-4-4m-4 8h16"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          Download all {{ Object.keys(resultImages).length }} results
        </button>
      </div>
    </section>

    <!-- Full size viewer modal -->
    <div
      v-if="fullSizeImage"
      class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
      @click="closeFullSize"
    >
      <div class="max-w-6xl max-h-full">
        <img
          :src="fullSizeImage"
          alt="Full size preview"
          class="max-w-full max-h-[90vh] object-contain"
          @click.stop
        />
        <button
          @click="closeFullSize"
          class="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
        >
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24">
            <path
              d="M6 18L18 6M6 6l12 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </div>

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
import heroFashionBg from '../assets/images/hero-fashion-bg.png';
import { useAppStore } from '../stores/app';
import { useAuthStore } from '../stores/authStore';
import { useCreditStore } from '../stores/creditStore';
import { useModals } from '../composables/useModals';
import { usePlatform } from '../composables/usePlatform';
import openRouterService from '../services/openRouterService';
import geminiService from '../services/geminiService';
import GalleryService from '../services/galleryService';
import CreditBalance from '../components/credits/CreditBalance.vue';

const appStore = useAppStore();
const authStore = useAuthStore();
const creditStore = useCreditStore();
const { openAuthModal, openPurchaseModal } = useModals();
const { isMobile } = usePlatform();

const { isAuthenticated } = storeToRefs(authStore);
const { canGenerate: hasCredits, credits } = storeToRefs(creditStore);

// TODO: This view should never show for unauthenticated mobile users
// Mobile users will be redirected to /auth by the router guard
// This is enforced by the beforeEach guard in router/index.js

const sourceImages = ref([]);
const selectedSourceIndex = ref(0);
const targetImage = ref(null);
const targetFile = ref(null);
const resultImages = ref({});
const isGenerating = ref(false);
const isBulkGenerating = ref(false);
const bulkProgress = ref({ current: 0, total: 0 });
const errorMessage = ref('');
const canUseOneTimeRetry = ref(false);
const fullSizeImage = ref(null);
const maxSourceImages = 5;

const sourceImage = computed(() => {
  return sourceImages.value[selectedSourceIndex.value]?.preview || null;
});

const sourceFile = computed(() => {
  return sourceImages.value[selectedSourceIndex.value]?.file || null;
});

const resultImage = computed(() => {
  return resultImages.value[selectedSourceIndex.value] || null;
});

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

const ungeneratedCount = computed(() => {
  return sourceImages.value.filter((_, index) => !resultImages.value[index]).length;
});

const canGenerateAll = computed(() => {
  if (!isAuthenticated.value) return false;
  if (!targetFile.value) return false;
  if (isGenerating.value) return false;
  const needed = ungeneratedCount.value;
  return needed > 0 && credits.value >= needed;
});

const handleSourceImageUpload = (event) => {
  const files = Array.from(event.target.files);
  
  if (sourceImages.value.length + files.length > maxSourceImages) {
    appStore.addToast({
      type: 'error',
      title: 'Maximum images exceeded',
      message: `You can upload a maximum of ${maxSourceImages} source images.`,
    });
    return;
  }

  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      sourceImages.value.push({
        file,
        preview: e.target.result,
        name: file.name,
      });
      
      // Auto-select the first uploaded image
      if (sourceImages.value.length === 1) {
        selectedSourceIndex.value = 0;
      }
    };
    reader.readAsDataURL(file);
  });
  
  errorMessage.value = '';
  canUseOneTimeRetry.value = false;
  
  // Reset file input
  event.target.value = '';
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
    canUseOneTimeRetry.value = false;
  }
};

const removeSourceImage = (index = null) => {
  const indexToRemove = index !== null ? index : selectedSourceIndex.value;
  
  // Remove the result for this index
  delete resultImages.value[indexToRemove];
  
  // Remove the source image
  sourceImages.value.splice(indexToRemove, 1);
  
  // Adjust selected index if needed
  if (sourceImages.value.length === 0) {
    selectedSourceIndex.value = 0;
  } else if (selectedSourceIndex.value >= sourceImages.value.length) {
    selectedSourceIndex.value = sourceImages.value.length - 1;
  }
  
  errorMessage.value = '';
  canUseOneTimeRetry.value = false;
};

const selectSourceImage = (index) => {
  if (index >= 0 && index < sourceImages.value.length) {
    selectedSourceIndex.value = index;
    errorMessage.value = '';
    canUseOneTimeRetry.value = false;
  }
};

const removeTargetImage = () => {
  targetImage.value = null;
  targetFile.value = null;
  resultImage.value = null;
  errorMessage.value = '';
  canUseOneTimeRetry.value = false;
};

const generateClothingMimic = async (isOneTimeRetry = false) => {
  if (!canGenerate.value && !isOneTimeRetry) return;

  if (!isAuthenticated.value) {
    appStore.addToast({
      type: 'error',
      title: 'Authentication required',
      message: 'Sign in to generate outfit blends.',
    });
    return;
  }

  if (!hasCredits.value && !isOneTimeRetry) {
    appStore.addToast({
      type: 'error',
      title: 'No credits available',
      message: 'Top up your credits to continue generating looks.',
    });
    return;
  }

  isGenerating.value = true;
  errorMessage.value = '';
  // Clear result for current selection
  delete resultImages.value[selectedSourceIndex.value];

  try {
    let creditUsed = false;
    
    // Only deduct credit if this is not a one-time retry
    if (!isOneTimeRetry) {
      const creditResult = await creditStore.useCredit(1, 'AI outfit generation');
      if (!creditResult.success) {
        throw new Error(creditResult.error);
      }
      creditUsed = true;
    }

    let result;

    try {
      // Use OpenRouter service
      result = await openRouterService.generateClothingTransfer(
        sourceFile.value,
        targetFile.value
      );

      if (result.success && result.imageUrl) {
        // Store result for current source image
        resultImages.value[selectedSourceIndex.value] = result.imageUrl;

        // Enable one-time retry after first generation, disable after retry is used
        canUseOneTimeRetry.value = !isOneTimeRetry;
        console.log('[DEBUG] Generation successful:', {
          isOneTimeRetry,
          canUseOneTimeRetry: canUseOneTimeRetry.value,
          resultImage: !!resultImages.value[selectedSourceIndex.value]
        });

        // Save to gallery
        try {
          const imageData = {
            originalImageUrl: sourceImage.value,
            generatedImageUrl: result.imageUrl,
            prompt: result.prompt || 'AI outfit generation',
            styleDescription: 'Clothing style transfer',
            fileSize: null,
            imageWidth: null,
            imageHeight: null,
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
        }

        const creditMessage = isOneTimeRetry
          ? `Preview rendered successfully (free retry). ${credits.value} credits remaining.`
          : `Preview rendered successfully. ${credits.value} credits remaining.`;

        appStore.addToast({
          type: 'success',
          title: 'Outfit blend ready',
          message: creditMessage,
        });
      } else {
        // Refund credit if it was used and generation failed
        if (creditUsed) {
          await creditStore.addCredits(
            1,
            'refunded',
            'Refund for failed generation - no image generated'
          );
          creditUsed = false;
        }

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
      // Refund credit if it was used and there was an API error
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

const useOneTimeRetry = () => {
  console.log('[DEBUG] Retry button clicked:', {
    canUseOneTimeRetry: canUseOneTimeRetry.value,
    isGenerating: isGenerating.value
  });
  if (!canUseOneTimeRetry.value || isGenerating.value) return;
  canUseOneTimeRetry.value = false; // Consume the retry
  generateClothingMimic(true);
};

const openAuthModalSignup = () => {
  openAuthModal('signup');
};

const openPurchaseCredits = () => {
  openPurchaseModal();
};

const downloadSingleResult = (imageUrl, index) => {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = `switchfit-outfit-${parseInt(index) + 1}-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downloadAllResults = () => {
  Object.entries(resultImages.value).forEach(([index, imageUrl]) => {
    setTimeout(() => {
      downloadSingleResult(imageUrl, index);
    }, parseInt(index) * 500); // Stagger downloads by 500ms
  });

  appStore.addToast({
    type: 'success',
    title: 'Downloading results',
    message: `Downloading ${Object.keys(resultImages.value).length} images...`,
  });
};

const viewFullSize = (imageUrl) => {
  fullSizeImage.value = imageUrl;
};

const closeFullSize = () => {
  fullSizeImage.value = null;
};

const generateAllImages = async () => {
  if (!canGenerateAll.value) return;

  const imagesToGenerate = sourceImages.value
    .map((img, index) => ({ img, index }))
    .filter(({ index }) => !resultImages.value[index]);

  if (imagesToGenerate.length === 0) {
    appStore.addToast({
      type: 'info',
      title: 'All generated',
      message: 'All source images have already been generated.',
    });
    return;
  }

  isBulkGenerating.value = true;
  isGenerating.value = true;
  bulkProgress.value = { current: 0, total: imagesToGenerate.length };
  errorMessage.value = '';

  let successCount = 0;
  let failCount = 0;

  for (const { img, index } of imagesToGenerate) {
    bulkProgress.value.current++;
    
    try {
      // Deduct credit
      const creditResult = await creditStore.useCredit(1, `AI outfit generation (${index + 1}/${sourceImages.value.length})`);
      if (!creditResult.success) {
        failCount++;
        console.error(`Failed to deduct credit for image ${index + 1}:`, creditResult.error);
        continue;
      }

      let creditUsed = true;

      try {
        // Generate for this source image
        const result = await openRouterService.generateClothingTransfer(
          img.file,
          targetFile.value
        );

        if (result.success && result.imageUrl) {
          resultImages.value[index] = result.imageUrl;
          successCount++;

          // Save to gallery
          try {
            const imageData = {
              originalImageUrl: img.preview,
              generatedImageUrl: result.imageUrl,
              prompt: result.prompt || 'AI outfit generation (bulk)',
              styleDescription: 'Clothing style transfer',
              fileSize: null,
              imageWidth: null,
              imageHeight: null,
            };

            await GalleryService.saveImage(imageData);
          } catch (galleryError) {
            console.error('Error saving to gallery:', galleryError);
          }
        } else {
          // Refund credit
          await creditStore.addCredits(
            1,
            'refunded',
            `Refund for failed generation (image ${index + 1})`
          );
          creditUsed = false;
          failCount++;
        }
      } catch (apiError) {
        // Refund credit on API error
        if (creditUsed) {
          await creditStore.addCredits(
            1,
            'refunded',
            `Refund for failed API call (image ${index + 1})`
          );
        }
        failCount++;
        console.error(`Error generating image ${index + 1}:`, apiError);
      }

      // Small delay between generations to avoid rate limiting
      if (bulkProgress.value.current < bulkProgress.value.total) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      failCount++;
      console.error(`Error processing image ${index + 1}:`, error);
    }
  }

  isBulkGenerating.value = false;
  isGenerating.value = false;

  // Show summary toast
  if (successCount > 0 && failCount === 0) {
    appStore.addToast({
      type: 'success',
      title: 'Bulk generation complete',
      message: `Successfully generated ${successCount} outfit${successCount > 1 ? 's' : ''}. ${credits.value} credits remaining.`,
    });
  } else if (successCount > 0 && failCount > 0) {
    appStore.addToast({
      type: 'warning',
      title: 'Bulk generation completed with errors',
      message: `Generated ${successCount} outfit${successCount > 1 ? 's' : ''}, ${failCount} failed. ${credits.value} credits remaining.`,
    });
  } else {
    appStore.addToast({
      type: 'error',
      title: 'Bulk generation failed',
      message: `Failed to generate any outfits. Please try again.`,
    });
  }
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
/* Hero container - hidden on mobile to improve initial viewport */
@media (max-width: 767px) {
  .hero-container {
    display: none;
  }
}

/* Mobile-optimized spacing */
@media (max-width: 767px) {
  .flex.flex-col.gap-10 {
    gap: 1.5rem;
  }
}
</style>
