<template>
  <div class="home-view">
    <!-- Hero — desktop only -->
    <section class="hero-container">
      <div class="max-w-xl">
        <h1 class="text-3xl font-semibold tracking-tight text-[var(--color-card-foreground)] leading-tight sm:text-4xl">
          Try on any look in seconds.
        </h1>
        <p class="mt-2 text-[var(--color-muted-foreground)] leading-relaxed">
          Upload an outfit you love, add your photo, and get a realistic try-on preview.
        </p>
      </div>
    </section>

    <!-- Upload cards -->
    <section class="grid gap-4 lg:grid-cols-2">
      <!-- Source inspiration -->
      <div class="upload-card">
        <div class="upload-card__header">
          <div>
            <h3 class="upload-card__title">
              Inspiration
              <span v-if="sourceImages.length > 0" class="upload-card__count">
                {{ sourceImages.length }}/{{ maxSourceImages }}
              </span>
            </h3>
            <p class="upload-card__desc">
              Reference outfit{{ maxSourceImages > 1 ? 's' : '' }} — up to {{ maxSourceImages }} images.
            </p>
          </div>
        </div>

        <input
          ref="sourceFileInput"
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          @change="handleSourceImageUpload"
        />

        <!-- Empty state -->
        <div
          v-if="sourceImages.length === 0"
          class="upload-card__dropzone"
          role="button"
          tabindex="0"
          aria-label="Add inspiration images — PNG, JPG, WEBP, max 10 MB"
          @click="$refs.sourceFileInput.click()"
          @keydown.enter.prevent="$refs.sourceFileInput.click()"
          @keydown.space.prevent="$refs.sourceFileInput.click()"
          @dragover.prevent="onDragOver($event, 'source')"
          @dragleave.prevent="onDragLeave('source')"
          @drop.prevent="onDropSource"
          :class="{ 'upload-card__dropzone--drag-active': isDraggingSource }"
        >
          <div class="upload-card__icon">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24">
              <path d="M12 5v14m7-7H5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </div>
          <p class="text-sm font-medium text-[var(--color-card-foreground)]">Add inspiration images</p>
          <p class="text-xs text-[var(--color-muted-foreground)]">PNG, JPG, WEBP · max 10 MB</p>
        </div>

        <!-- Preview state -->
        <template v-else>
          <div class="upload-card__preview">
            <img
              :src="sourceImage"
              alt="Source clothing reference"
              class="upload-card__preview-img"
            />
            <span class="upload-card__badge">Inspiration</span>
            <button
              type="button"
              @click="removeSourceImage()"
              class="upload-card__remove"
              title="Remove inspiration image"
              aria-label="Remove inspiration image"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <path d="m8 8 8 8m0-8-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <!-- Thumbnail strip -->
          <div class="upload-card__thumbs">
            <button
              v-for="(img, index) in sourceImages"
              :key="index"
              type="button"
              @click="selectSourceImage(index)"
              class="upload-card__thumb"
              :class="{ 'upload-card__thumb--active': index === selectedSourceIndex }"
            >
              <img :src="img.preview" :alt="`Inspiration ${index + 1}`" class="w-full h-full object-cover" />
              <div v-if="resultImages[index]" class="upload-card__thumb-dot" />
              <button
                type="button"
                @click.stop="removeSourceImage(index)"
                class="upload-card__thumb-remove"
                title="Remove inspiration image"
                aria-label="Remove inspiration {{ index + 1 }}"
              >
                <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24">
                  <path d="m8 8 8 8m0-8-8 8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
                </svg>
              </button>
            </button>

            <button
              v-if="sourceImages.length < maxSourceImages"
              type="button"
              @click="$refs.sourceFileInput.click()"
              class="upload-card__thumb upload-card__thumb--add"
            >
              <svg class="w-4 h-4 text-[var(--color-muted-foreground)]" fill="none" viewBox="0 0 24 24">
                <path d="M12 5v14m7-7H5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </template>
      </div>

      <!-- Subject portrait -->
      <div class="upload-card">
        <div class="upload-card__header">
          <div>
            <h3 class="upload-card__title">Your photo</h3>
            <p class="upload-card__desc">Full or half-body with clear lighting.</p>
          </div>
        </div>

        <input
          ref="targetFileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleTargetImageUpload"
        />

        <div
          v-if="!targetImage"
          class="upload-card__dropzone"
          role="button"
          tabindex="0"
          aria-label="Add your portrait photo — PNG, JPG, WEBP, max 10 MB"
          @click="$refs.targetFileInput.click()"
          @keydown.enter.prevent="$refs.targetFileInput.click()"
          @keydown.space.prevent="$refs.targetFileInput.click()"
          @dragover.prevent="onDragOver($event, 'target')"
          @dragleave.prevent="onDragLeave('target')"
          @drop.prevent="onDropTarget"
          :class="{ 'upload-card__dropzone--drag-active': isDraggingTarget }"
        >
          <div class="upload-card__icon">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24">
              <path d="M12 5v14m7-7H5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </div>
          <p class="text-sm font-medium text-[var(--color-card-foreground)]">Add your portrait</p>
          <p class="text-xs text-[var(--color-muted-foreground)]">Drag &amp; drop or click · max 10 MB</p>
        </div>

        <template v-else>
          <div class="upload-card__preview">
            <img :src="targetImage" alt="Target portrait" class="upload-card__preview-img" />
            <span class="upload-card__badge">You</span>
            <button
              type="button"
              @click="removeTargetImage"
              class="upload-card__remove"
              title="Remove portrait"
              aria-label="Remove portrait photo"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <path d="m8 8 8 8m0-8-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </template>
      </div>
    </section>

    <!-- Action bar -->
    <section class="action-bar">
      <div class="action-bar__text">
        <p class="text-sm font-medium text-[var(--color-card-foreground)]">{{ ctaHeadline }}</p>
        <p class="text-xs text-[var(--color-muted-foreground)]">{{ ctaSubtext }}</p>
      </div>

      <div v-if="isAuthenticated" class="action-bar__buttons">
        <button
          type="button"
          @click="generateClothingMimic()"
          :disabled="!canGenerate || isGenerating || isGeneratingPhotoAndVideo"
          class="btn-primary"
        >
          <template v-if="isGenerating && !isBulkGenerating && !isGeneratingPhotoAndVideo">
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
              <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            Generating…
          </template>
          <template v-else>
            {{ hasCredits ? 'Generate photo (1 credit)' : 'Purchase credits' }}
          </template>
        </button>

        <button
          type="button"
          @click="generatePhotoAndVideo()"
          :disabled="!canGenerate || isGenerating || isGeneratingPhotoAndVideo || credits < 2"
          class="btn-primary"
        >
          <template v-if="isGeneratingPhotoAndVideo">
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
              <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            {{ photoAndVideoProgress || 'Generating…' }}
          </template>
          <template v-else>
            <template v-if="credits >= 2">Generate video (2 credits)</template>
            <template v-else>
              <span @click.stop="openPurchaseCredits" class="cursor-pointer underline underline-offset-2">Need 2 credits</span>
            </template>
          </template>
        </button>

        <button
          v-if="sourceImages.length > 1 && hasCredits"
          type="button"
          @click="generateAllImages()"
          :disabled="!canGenerateAll || isGenerating || isGeneratingPhotoAndVideo"
          class="btn-secondary"
        >
          <template v-if="isBulkGenerating">
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
              <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            {{ bulkProgress.current }}/{{ bulkProgress.total }}
          </template>
          <template v-else>
            Generate all {{ sourceImages.length }} ({{ ungeneratedCount }} credits)
          </template>
        </button>
      </div>

      <div v-else-if="!isMobile" class="action-bar__buttons">
        <button type="button" @click="openAuthModalSignup" class="btn-primary">
          Get started free
        </button>
      </div>
    </section>

    <!-- Results — Photo-only results (non-video-pipeline) -->
    <section v-if="photoOnlyResults.length > 0" class="results-section">
      <div class="results-section__header">
        <h2 class="text-lg font-semibold text-[var(--color-card-foreground)]">
          Results
          <span class="text-xs font-normal text-[var(--color-muted-foreground)]">
            {{ photoOnlyResults.length }}/{{ sourceImages.length }}
          </span>
        </h2>
      </div>

      <div class="results-grid">
        <div
          v-for="{ index, imageUrl } in photoOnlyResults"
          :key="'photo-' + index"
          class="result-item"
        >
          <div class="result-item__images">
            <!-- Generated image -->
            <div class="result-item__image group">
              <img :src="imageUrl" :alt="`Generated outfit ${index + 1}`" class="w-full h-auto" loading="lazy" />

              <!-- Hover overlay -->
              <div class="result-item__overlay">
                <span class="text-white text-xs font-medium">Inspiration {{ index + 1 }}</span>
                <div class="flex gap-1.5">
                  <button
                    type="button"
                    @click.stop="generateVideo(index)"
                    :disabled="isGeneratingVideo || !hasCredits"
                    class="result-item__action"
                    :title="videoResults[index] ? 'Regenerate 360° video' : 'Generate 360° video (1 credit)'"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="1.5" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    @click="downloadSingleResult(imageUrl, index)"
                    class="result-item__action"
                    title="Download"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <path d="M12 4v12m0 0 4-4m-4 4-4-4m-4 8h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    @click="viewFullSize(imageUrl)"
                    class="result-item__action"
                    title="Expand"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <path d="M15 3h6m0 0v6m0-6l-7 7M9 21H3m0 0v-6m0 6l7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Source thumb -->
              <div class="result-item__source-thumb">
                <img :src="sourceImages[index]?.preview" :alt="`Source ${index + 1}`" class="w-full h-full object-cover" />
              </div>

              <!-- Video generating overlay -->
              <div
                v-if="isGeneratingVideo && selectedSourceIndex === index"
                class="result-item__loading"
              >
                <svg class="w-6 h-6 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
                  <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                </svg>
                <span class="text-white text-xs">{{ videoProgress || 'Generating video…' }}</span>
              </div>

              <!-- Video badge -->
              <div v-if="videoResults[index]" class="result-item__video-badge">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
                </svg>
                Video
              </div>
            </div>

            <!-- Video player (for photo-first results that later got a video) -->
            <div v-if="videoResults[index]" class="result-item__video">
              <video
                :ref="el => { if (el) videoRefs[index] = el }"
                :src="videoResults[index]"
                class="w-full h-auto"
                controls autoplay loop muted playsinline
              />
              <div class="result-item__video-footer">
                <span class="text-xs text-[var(--color-muted-foreground)]">360° turnaround</span>
                <a
                  :href="videoResults[index]"
                  :download="`switchfit-video-${index + 1}-${Date.now()}.mp4`"
                  class="text-xs font-medium text-[var(--color-card-foreground)] hover:opacity-70 transition"
                >
                  Download
                </a>
              </div>
            </div>

            <!-- Video placeholder -->
            <div v-if="!videoResults[index]" class="result-item__video-placeholder">
              <p class="text-xs font-medium text-[var(--color-card-foreground)]">Create video</p>
              <p class="text-[11px] text-[var(--color-muted-foreground)]">360° turnaround clip</p>
              <button
                type="button"
                @click="generateVideo(index)"
                :disabled="isGeneratingVideo || !hasCredits"
                class="mt-2 btn-secondary text-xs !py-1.5 !px-3"
              >
                <template v-if="isGeneratingVideo && selectedSourceIndex === index">
                  {{ videoProgress || 'Generating…' }}
                </template>
                <template v-else>
                  Generate (1 credit)
                </template>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Download all -->
      <div v-if="photoOnlyResults.length > 1" class="mt-4 flex justify-center">
        <button type="button" @click="downloadAllResults" class="btn-secondary text-xs">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
            <path d="M12 4v12m0 0 4-4m-4 4-4-4m-4 8h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          Download all {{ photoOnlyResults.length }}
        </button>
      </div>
    </section>

    <!-- Results — Video-pipeline results (video is the star) -->
    <section v-if="videoPipelineResults.length > 0" class="video-results-section">
      <div class="video-results-section__header">
        <div class="video-results-section__title-row">
          <svg class="w-5 h-5 text-[var(--color-success-500)]" fill="none" viewBox="0 0 24 24">
            <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" fill="currentColor" />
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="1.5" />
          </svg>
          <h2 class="text-lg font-semibold text-[var(--color-card-foreground)]">
            Generated Video
          </h2>
        </div>
        <p class="text-xs text-[var(--color-muted-foreground)] mt-0.5">360° turnaround · video-first generation</p>
      </div>

      <div class="video-results-grid">
        <div
          v-for="{ index, videoUrl, photoUrl } in videoPipelineResults"
          :key="'video-' + index"
          class="video-result-item"
        >
          <!-- Primary: Video player (prominent) -->
          <div class="video-result-item__primary">
            <div class="video-result-item__player">
              <video
                :ref="el => { if (el) videoRefs[index] = el }"
                :src="videoUrl"
                class="video-result-item__video"
                controls autoplay loop muted playsinline
              />
            </div>
            <div class="video-result-item__player-footer">
              <div class="video-result-item__label">
                <svg class="w-3.5 h-3.5 text-[var(--color-success-500)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
                </svg>
                <span class="text-sm font-medium text-[var(--color-card-foreground)]">360° turnaround video</span>
              </div>
              <div class="flex gap-2 items-center">
                <a
                  :href="videoUrl"
                  :download="`switchfit-video-${index + 1}-${Date.now()}.mp4`"
                  class="btn-secondary text-xs !py-1 !px-2.5"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                    <path d="M12 4v12m0 0 4-4m-4 4-4-4m-4 8h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                  Download video
                </a>
              </div>
            </div>
          </div>

          <!-- Secondary: Photo reveal button + optional photo -->
          <div class="video-result-item__secondary">
            <button
              v-if="!showPhotoForVideoResult[index]"
              type="button"
              @click="showPhotoForVideoResult[index] = true"
              class="btn-secondary video-result-item__show-photo-btn"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5" />
                <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="1.5" />
                <path d="m21 15-5-5L5 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Show generated photo
            </button>

            <div v-if="showPhotoForVideoResult[index] && photoUrl" class="video-result-item__photo-reveal">
              <div class="video-result-item__photo-header">
                <span class="text-xs font-medium text-[var(--color-muted-foreground)]">Associated photo</span>
                <button
                  type="button"
                  @click="showPhotoForVideoResult[index] = false"
                  class="text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-card-foreground)] transition"
                >
                  Hide
                </button>
              </div>
              <div class="video-result-item__photo group">
                <img :src="photoUrl" :alt="`Generated outfit ${index + 1}`" class="w-full h-auto" loading="lazy" />
                <div class="result-item__overlay">
                  <span class="text-white text-xs font-medium">Photo</span>
                  <div class="flex gap-1.5">
                    <button
                      type="button"
                      @click="downloadSingleResult(photoUrl, index)"
                      class="result-item__action"
                      title="Download photo"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <path d="M12 4v12m0 0 4-4m-4 4-4-4m-4 8h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      @click="viewFullSize(photoUrl)"
                      class="result-item__action"
                      title="Expand"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <path d="M15 3h6m0 0v6m0-6l-7 7M9 21H3m0 0v-6m0 6l7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Video pipeline in-progress (photo done, video generating) -->
    <section v-if="videoPipelineInProgress.length > 0 && !videoPipelineResults.length" class="video-results-section">
      <div class="video-results-section__header">
        <div class="video-results-section__title-row">
          <svg class="w-5 h-5 text-[var(--color-success-500)] animate-pulse" fill="none" viewBox="0 0 24 24">
            <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" fill="currentColor" />
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="1.5" />
          </svg>
          <h2 class="text-lg font-semibold text-[var(--color-card-foreground)]">
            Generating Video…
          </h2>
        </div>
        <p class="text-xs text-[var(--color-muted-foreground)] mt-0.5">{{ photoAndVideoProgress || 'Processing your video…' }}</p>
      </div>

      <div class="video-results-grid">
        <div
          v-for="{ index, photoUrl } in videoPipelineInProgress"
          :key="'video-progress-' + index"
          class="video-result-item"
        >
          <div class="video-result-item__primary video-result-item__primary--loading">
            <div class="video-result-item__generating-placeholder">
              <svg class="w-10 h-10 animate-spin text-[var(--color-muted-foreground)]" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
                <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
              <p class="text-sm font-medium text-[var(--color-card-foreground)]">{{ photoAndVideoProgress || 'Generating video…' }}</p>
              <p class="text-xs text-[var(--color-muted-foreground)]">This can take up to a minute</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Lightbox -->
    <div
      v-if="fullSizeImage"
      class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 cursor-zoom-out"
      @click="closeFullSize"
    >
      <img
        :src="fullSizeImage"
        alt="Full size preview"
        class="max-w-full max-h-[90vh] object-contain"
        loading="eager"
        @click.stop
      />
      <button
        @click="closeFullSize"
        class="absolute top-4 right-4 text-white/60 hover:text-white transition"
      >
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24">
          <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <!-- Error -->
    <section v-if="errorMessage" class="error-banner">
      <svg class="w-4 h-4 text-[var(--color-destructive-500)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24">
        <path d="M12 8v5m0 4h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <path d="M4.47 19h15.06a1 1 0 0 0 .87-1.5L12.87 4.5a1 1 0 0 0-1.74 0L3.6 17.5A1 1 0 0 0 4.47 19Z" stroke="currentColor" stroke-width="1.5" />
      </svg>
      <div>
        <p class="text-sm font-medium text-[var(--color-card-foreground)]">Generation failed</p>
        <p class="text-xs text-[var(--color-muted-foreground)] mt-0.5">{{ errorMessage }}</p>
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
import { usePlatform } from '../composables/usePlatform';
import aiProviderService from '../services/aiProviderService';
import decartService from '../services/decartService';
import GalleryService from '../services/galleryService';

/** Maximum file size per uploaded image (10 MB). */
const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_UPLOAD_SIZE_LABEL = '10 MB';

const appStore = useAppStore();
const authStore = useAuthStore();
const creditStore = useCreditStore();
const { openAuthModal, openPurchaseModal } = useModals();
const { isMobile } = usePlatform();

const { isAuthenticated } = storeToRefs(authStore);
const { canGenerate: hasCredits, credits } = storeToRefs(creditStore);

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

const isGeneratingVideo = ref(false);
const isGeneratingPhotoAndVideo = ref(false);
const photoAndVideoProgress = ref('');
const videoResults = ref({});
const videoProgress = ref('');
const videoRefs = ref({});
const videoGenerationMode = ref({});   // tracks indices generated via video pipeline
const showPhotoForVideoResult = ref({}); // tracks which video results have photo revealed

// ── Drag-and-drop state ──
const isDraggingSource = ref(false);
const isDraggingTarget = ref(false);

const onDragOver = (_event, zone) => {
  if (zone === 'source') isDraggingSource.value = true;
  else isDraggingTarget.value = true;
};

const onDragLeave = (zone) => {
  if (zone === 'source') isDraggingSource.value = false;
  else isDraggingTarget.value = false;
};

const onDropSource = (event) => {
  isDraggingSource.value = false;
  const files = Array.from(event.dataTransfer?.files || []);
  const imageFiles = files.filter((f) => f.type.startsWith('image/'));
  if (imageFiles.length === 0) return;

  // Reuse the existing upload handler by synthesising a change-like event
  const fakeEvent = { target: { files: imageFiles, value: '' } };
  handleSourceImageUpload(fakeEvent);
};

const onDropTarget = (event) => {
  isDraggingTarget.value = false;
  const files = Array.from(event.dataTransfer?.files || []);
  const imageFile = files.find((f) => f.type.startsWith('image/'));
  if (!imageFile) return;

  const fakeEvent = { target: { files: [imageFile], value: '' } };
  handleTargetImageUpload(fakeEvent);
};

const sourceImage = computed(() => {
  return sourceImages.value[selectedSourceIndex.value]?.preview || null;
});

// Split results into photo-only and video-pipeline categories
const photoOnlyResults = computed(() => {
  return Object.entries(resultImages.value)
    .filter(([index]) => !videoGenerationMode.value[index])
    .map(([index, imageUrl]) => ({ index: parseInt(index), imageUrl }));
});

const videoPipelineResults = computed(() => {
  return Object.entries(resultImages.value)
    .filter(([index]) => videoGenerationMode.value[index] && videoResults.value[index])
    .map(([index]) => ({
      index: parseInt(index),
      videoUrl: videoResults.value[index],
      photoUrl: resultImages.value[index],
    }));
});

// Video pipeline items where photo is done but video is still generating
const videoPipelineInProgress = computed(() => {
  return Object.entries(resultImages.value)
    .filter(([index]) => videoGenerationMode.value[index] && !videoResults.value[index])
    .map(([index, photoUrl]) => ({
      index: parseInt(index),
      photoUrl,
    }));
});

const hasAnyVideoPipelineItems = computed(() => {
  return videoPipelineResults.value.length > 0 || videoPipelineInProgress.value.length > 0;
});

const sourceFile = computed(() => {
  return sourceImages.value[selectedSourceIndex.value]?.file || null;
});

const resultImage = computed(() => {
  return resultImages.value[selectedSourceIndex.value] || null;
});

const hasImages = computed(() => sourceFile.value && targetFile.value);

const ctaHeadline = computed(() =>
  hasImages.value
    ? 'Ready to generate your look.'
    : 'Upload both images to continue.'
);

const ctaSubtext = computed(() => {
  if (!hasImages.value) {
    return 'Add an inspiration outfit and your portrait.';
  }
  if (!isAuthenticated.value) {
    return 'Sign in to start generating.';
  }
  if (!hasCredits.value) {
    return 'Purchase credits to generate looks.';
  }
  return '1 credit per generation.';
});

const canGenerate = computed(() => {
  return isAuthenticated.value && hasImages.value && !isGenerating.value && hasCredits.value;
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

  // Validate file sizes before processing
  const oversized = files.filter((f) => f.size > MAX_UPLOAD_SIZE_BYTES);
  if (oversized.length > 0) {
    appStore.addToast({
      type: 'error',
      title: 'File too large',
      message: `${oversized.map((f) => f.name).join(', ')} exceed${oversized.length === 1 ? 's' : ''} the ${MAX_UPLOAD_SIZE_LABEL} limit. Please use smaller images.`,
    });
    event.target.value = '';
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

      if (sourceImages.value.length === 1) {
        selectedSourceIndex.value = 0;
      }
    };
    reader.readAsDataURL(file);
  });

  errorMessage.value = '';
  canUseOneTimeRetry.value = false;
  event.target.value = '';
};

const handleTargetImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      appStore.addToast({
        type: 'error',
        title: 'File too large',
        message: `${file.name} exceeds the ${MAX_UPLOAD_SIZE_LABEL} limit. Please use a smaller image.`,
      });
      event.target.value = '';
      return;
    }

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
  delete resultImages.value[indexToRemove];
  sourceImages.value.splice(indexToRemove, 1);

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
  // Clear all result images when removing the target portrait
  Object.keys(resultImages.value).forEach(key => delete resultImages.value[key]);
  errorMessage.value = '';
  canUseOneTimeRetry.value = false;
};

const generateClothingMimic = async (isOneTimeRetry = false) => {
  if (!canGenerate.value && !isOneTimeRetry) return;

  if (!isAuthenticated.value) {
    appStore.addToast({ type: 'error', title: 'Authentication required', message: 'Sign in to generate outfit blends.' });
    return;
  }

  if (!hasCredits.value && !isOneTimeRetry) {
    appStore.addToast({ type: 'error', title: 'No credits available', message: 'Top up your credits to continue.' });
    return;
  }

  isGenerating.value = true;
  errorMessage.value = '';
  delete resultImages.value[selectedSourceIndex.value];

  try {
    let creditUsed = false;

    if (!isOneTimeRetry) {
      const creditResult = await creditStore.useCredit(1, 'AI outfit generation');
      if (!creditResult.success) throw new Error(creditResult.error);
      creditUsed = true;
    }

    let result;

    try {
      result = await aiProviderService.generateClothingTransfer(sourceFile.value, targetFile.value);

      if (result.success && result.imageUrl) {
        resultImages.value[selectedSourceIndex.value] = result.imageUrl;
        canUseOneTimeRetry.value = !isOneTimeRetry;

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
          await GalleryService.saveImage(imageData);
        } catch (galleryError) {
          console.error('Error saving to gallery:', galleryError);
        }

        appStore.addToast({
          type: 'success',
          title: 'Look generated',
          message: isOneTimeRetry
            ? `Free retry used. ${credits.value} credits remaining.`
            : `${credits.value} credits remaining.`,
        });
      } else {
        if (creditUsed) {
          await creditStore.addCredits(1, 'refunded', 'Refund for failed generation');
          creditUsed = false;
        }
        throw new Error(result.message || 'Failed to generate outfit blend.');
      }
    } catch (apiError) {
      if (creditUsed) {
        await creditStore.addCredits(1, 'refunded', 'Refund for failed API call');
      }
      throw apiError;
    }
  } catch (error) {
    console.error('Error generating clothing mimic:', error);
    errorMessage.value = error.message;
    appStore.addToast({ type: 'error', title: 'Generation failed', message: error.message });
  } finally {
    isGenerating.value = false;
  }
};

const useOneTimeRetry = () => {
  if (!canUseOneTimeRetry.value || isGenerating.value) return;
  canUseOneTimeRetry.value = false;
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
    setTimeout(() => downloadSingleResult(imageUrl, index), parseInt(index) * 500);
  });
  appStore.addToast({ type: 'success', title: 'Downloading', message: `${Object.keys(resultImages.value).length} images…` });
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

  if (imagesToGenerate.length === 0) return;

  isBulkGenerating.value = true;
  isGenerating.value = true;
  bulkProgress.value = { current: 0, total: imagesToGenerate.length };
  errorMessage.value = '';

  let successCount = 0;
  let failCount = 0;

  for (const { img, index } of imagesToGenerate) {
    bulkProgress.value.current++;

    try {
      const creditResult = await creditStore.useCredit(1, `AI outfit generation (${index + 1}/${sourceImages.value.length})`);
      if (!creditResult.success) { failCount++; continue; }
      let creditUsed = true;

      try {
        const result = await aiProviderService.generateClothingTransfer(img.file, targetFile.value);
        if (result.success && result.imageUrl) {
          resultImages.value[index] = result.imageUrl;
          successCount++;
          try {
            await GalleryService.saveImage({
              originalImageUrl: img.preview,
              generatedImageUrl: result.imageUrl,
              prompt: result.prompt || 'AI outfit generation (bulk)',
              styleDescription: 'Clothing style transfer',
              fileSize: null, imageWidth: null, imageHeight: null,
            });
          } catch (e) { console.error('Gallery save error:', e); }
        } else {
          await creditStore.addCredits(1, 'refunded', `Refund for failed generation (image ${index + 1})`);
          creditUsed = false;
          failCount++;
        }
      } catch (apiError) {
        if (creditUsed) await creditStore.addCredits(1, 'refunded', `Refund for failed API call (image ${index + 1})`);
        failCount++;
      }

      if (bulkProgress.value.current < bulkProgress.value.total) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      failCount++;
    }
  }

  isBulkGenerating.value = false;
  isGenerating.value = false;

  if (successCount > 0) {
    appStore.addToast({
      type: failCount > 0 ? 'warning' : 'success',
      title: 'Generation complete',
      message: `${successCount} generated${failCount > 0 ? `, ${failCount} failed` : ''}. ${credits.value} credits left.`,
    });
  } else {
    appStore.addToast({ type: 'error', title: 'Generation failed', message: 'No outfits were generated.' });
  }
};

const generatePhotoAndVideo = async () => {
  if (!canGenerate.value) return;

  if (!isAuthenticated.value) {
    appStore.addToast({ type: 'error', title: 'Authentication required', message: 'Sign in to generate outfit videos.' });
    return;
  }

  if (credits.value < 2) {
    appStore.addToast({ type: 'error', title: 'Insufficient credits', message: 'You need at least 2 credits (1 photo + 1 video).' });
    return;
  }

  isGeneratingPhotoAndVideo.value = true;
  isGenerating.value = true;
  photoAndVideoProgress.value = 'Generating photo…';
  errorMessage.value = '';
  delete resultImages.value[selectedSourceIndex.value];
  delete videoResults.value[selectedSourceIndex.value];
  delete videoGenerationMode.value[selectedSourceIndex.value];
  delete showPhotoForVideoResult.value[selectedSourceIndex.value];

  const idx = selectedSourceIndex.value;

  try {
    // --- Step 1: Generate the photo (1 credit) ---
    const creditResult = await creditStore.useCredit(1, 'AI outfit generation (photo+video pipeline)');
    if (!creditResult.success) throw new Error(creditResult.error);
    let photoCreditUsed = true;

    let photoUrl;
    try {
      const result = await aiProviderService.generateClothingTransfer(sourceFile.value, targetFile.value);

      if (result.success && result.imageUrl) {
        resultImages.value[idx] = result.imageUrl;
        videoGenerationMode.value[idx] = true;   // mark as video pipeline
        photoUrl = result.imageUrl;

        try {
          await GalleryService.saveImage({
            originalImageUrl: sourceImage.value,
            generatedImageUrl: result.imageUrl,
            prompt: result.prompt || 'AI outfit generation',
            styleDescription: 'Clothing style transfer',
            fileSize: null, imageWidth: null, imageHeight: null,
          });
        } catch (galleryError) {
          console.error('Error saving to gallery:', galleryError);
        }
      } else {
        if (photoCreditUsed) {
          await creditStore.addCredits(1, 'refunded', 'Refund for failed photo in photo+video pipeline');
          photoCreditUsed = false;
        }
        throw new Error(result.message || 'Failed to generate outfit photo.');
      }
    } catch (apiError) {
      if (photoCreditUsed) {
        await creditStore.addCredits(1, 'refunded', 'Refund for failed photo API in photo+video pipeline');
      }
      throw apiError;
    }

    // --- Step 2: Generate the video from the photo (1 credit) ---
    photoAndVideoProgress.value = 'Submitting video…';
    isGeneratingVideo.value = true;

    const videoCreditResult = await creditStore.useCredit(1, 'AI outfit video generation (photo+video pipeline)');
    if (!videoCreditResult.success) throw new Error(videoCreditResult.error);
    let videoCreditUsed = true;

    try {
      const videoResult = await decartService.generateVideoFromImage(photoUrl, {
        onStatusChange: (status) => {
          const statusMap = { pending: 'Video queued…', processing: 'Generating video…', completed: 'Finalizing video…' };
          photoAndVideoProgress.value = statusMap[status.status] || status.status;
        },
      });

      if (videoResult.success && videoResult.videoUrl) {
        videoResults.value[idx] = videoResult.videoUrl;
        appStore.addToast({
          type: 'success',
          title: 'Video ready',
          message: `Photo and video generated. ${credits.value} credits remaining.`,
        });
      } else {
        if (videoCreditUsed) {
          await creditStore.addCredits(1, 'refunded', 'Refund for failed video in photo+video pipeline');
          videoCreditUsed = false;
        }
        throw new Error(videoResult.message || 'Video generation failed.');
      }
    } catch (videoApiError) {
      if (videoCreditUsed) {
        await creditStore.addCredits(1, 'refunded', 'Refund for failed video API in photo+video pipeline');
      }
      // Photo was still generated successfully — notify the user
      appStore.addToast({
        type: 'warning',
        title: 'Photo generated, video failed',
        message: `The photo was created but video generation failed: ${videoApiError.message}. Video credit refunded.`,
      });
      // Don't re-throw — photo succeeded
      return;
    }
  } catch (error) {
    console.error('Error in photo+video pipeline:', error);
    errorMessage.value = error.message;
    appStore.addToast({ type: 'error', title: 'Generation failed', message: error.message });
  } finally {
    isGeneratingPhotoAndVideo.value = false;
    isGenerating.value = false;
    isGeneratingVideo.value = false;
    photoAndVideoProgress.value = '';
    videoProgress.value = '';
  }
};

const generateVideo = async (sourceIndex = null) => {
  const idx = sourceIndex !== null ? sourceIndex : selectedSourceIndex.value;
  const imageUrl = resultImages.value[idx];

  if (!imageUrl) {
    appStore.addToast({ type: 'error', title: 'No image', message: 'Generate an outfit image first.' });
    return;
  }

  if (!isAuthenticated.value) {
    appStore.addToast({ type: 'error', title: 'Sign in required', message: 'Sign in to generate videos.' });
    return;
  }

  if (!hasCredits.value) {
    appStore.addToast({ type: 'error', title: 'No credits', message: 'Purchase credits for video generation.' });
    return;
  }

  isGeneratingVideo.value = true;
  videoProgress.value = 'Submitting…';
  errorMessage.value = '';

  try {
    const creditResult = await creditStore.useCredit(1, 'AI outfit video generation');
    if (!creditResult.success) throw new Error(creditResult.error);
    let creditUsed = true;

    try {
      const result = await decartService.generateVideoFromImage(imageUrl, {
        onStatusChange: (status) => {
          const statusMap = { pending: 'Queued…', processing: 'Generating…', completed: 'Finalizing…' };
          videoProgress.value = statusMap[status.status] || status.status;
        },
      });

      if (result.success && result.videoUrl) {
        videoResults.value[idx] = result.videoUrl;
        appStore.addToast({ type: 'success', title: 'Video ready', message: `${credits.value} credits remaining.` });
      } else {
        if (creditUsed) { await creditStore.addCredits(1, 'refunded', 'Refund for failed video'); creditUsed = false; }
        throw new Error(result.message || 'Video generation failed.');
      }
    } catch (apiError) {
      if (creditUsed) await creditStore.addCredits(1, 'refunded', 'Refund for failed video API');
      throw apiError;
    }
  } catch (error) {
    console.error('Video error:', error);
    errorMessage.value = error.message;
    appStore.addToast({ type: 'error', title: 'Video failed', message: error.message });
  } finally {
    isGeneratingVideo.value = false;
    videoProgress.value = '';
  }
};

</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Hero */
.hero-container {
  padding: 0.5rem 0 0.5rem;
}

@media (max-width: 767px) {
  .hero-container {
    display: none;
  }
}

/* Upload cards */
.upload-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  padding: 1rem;
}

.upload-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.upload-card__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-card-foreground);
}

.upload-card__count {
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--color-muted-foreground);
}

.upload-card__desc {
  font-size: 0.75rem;
  color: var(--color-muted-foreground);
  margin-top: 0.125rem;
}

.upload-card__dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2.5rem 1.5rem;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-muted);
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
  text-align: center;
}

.upload-card__dropzone:hover {
  border-color: var(--color-muted-foreground);
  background: color-mix(in oklch, var(--color-muted) 80%, var(--color-surface));
}

.upload-card__dropzone:focus-visible {
  outline: none;
  border-color: var(--color-ring);
  box-shadow: var(--shadow-focus);
}

.upload-card__dropzone--drag-active {
  border-color: var(--color-foreground);
  border-style: solid;
  background: color-mix(in oklch, var(--color-foreground) 6%, var(--color-surface));
}

.upload-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-muted-foreground);
}

.upload-card__preview {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-muted);
}

.upload-card__preview-img {
  width: 100%;
  height: 16rem;
  object-fit: cover;
  display: block;
}

.upload-card__badge {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  padding: 0.2rem 0.5rem;
  font-size: 0.6875rem;
  font-weight: 500;
  background: rgb(0 0 0 / 0.55);
  color: white;
  border-radius: var(--radius-sm);
  backdrop-filter: blur(4px);
}

.upload-card__remove {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--radius-sm);
  background: rgb(0 0 0 / 0.55);
  color: white;
  transition: background 0.15s ease;
  backdrop-filter: blur(4px);
}

.upload-card__remove:hover {
  background: rgb(0 0 0 / 0.75);
}

/* Thumbnail strip */
.upload-card__thumbs {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.upload-card__thumb {
  position: relative;
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1.5px solid var(--color-border);
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.upload-card__thumb--active {
  border-color: var(--color-foreground);
}

.upload-card__thumb--add {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-muted);
  border-style: dashed;
}

.upload-card__thumb-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-success-500);
  border: 1px solid var(--color-surface);
}

.upload-card__thumb-remove {
  position: absolute;
  top: 1px;
  left: 1px;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: rgb(0 0 0 / 0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.upload-card__thumb:hover .upload-card__thumb-remove {
  opacity: 1;
}

/* Action bar */
.action-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  padding: 0.875rem 1rem;
}

.action-bar__text {
  min-width: 0;
}

.action-bar__buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-weight: 500;
  background: var(--color-foreground);
  color: var(--color-background);
  border-radius: var(--radius-md);
  transition: opacity 0.15s ease;
  white-space: nowrap;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.88;
}

.btn-primary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-background), 0 0 0 4px var(--color-foreground);
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-weight: 500;
  background: var(--color-surface);
  color: var(--color-card-foreground);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: border-color 0.15s ease, background 0.15s ease;
  white-space: nowrap;
}

.btn-secondary:hover:not(:disabled) {
  border-color: var(--color-foreground);
}

.btn-secondary:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}

.btn-secondary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Results */
.results-section {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  padding: 1rem;
}

.results-section__header {
  margin-bottom: 0.75rem;
}

.results-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-item__images {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

@media (max-width: 640px) {
  .result-item__images {
    grid-template-columns: 1fr;
  }
}

.result-item__image {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-muted);
}

.result-item__image img {
  display: block;
}

.result-item__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgb(0 0 0 / 0.5) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.15s ease;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0.75rem;
}

.result-item__image:hover .result-item__overlay {
  opacity: 1;
}

.result-item__action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-sm);
  background: rgb(255 255 255 / 0.15);
  color: white;
  backdrop-filter: blur(4px);
  transition: background 0.15s ease;
}

.result-item__action:hover {
  background: rgb(255 255 255 / 0.25);
}

.result-item__action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.result-item__source-thumb {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1.5px solid rgb(255 255 255 / 0.5);
}

.result-item__loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgb(0 0 0 / 0.65);
  backdrop-filter: blur(4px);
}

.result-item__video-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.45rem;
  font-size: 0.625rem;
  font-weight: 500;
  background: var(--color-success-500);
  color: white;
  border-radius: var(--radius-sm);
}

.result-item__video {
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: black;
}

.result-item__video video {
  display: block;
}

.result-item__video-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background: var(--color-surface);
}

.result-item__video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-muted);
  padding: 2rem 1rem;
}

/* ── Video-pipeline results (video-first layout) ── */
.video-results-section {
  border: 1px solid var(--color-success-500, #22c55e);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  padding: 1.25rem;
  position: relative;
  overflow: hidden;
}

.video-results-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, oklch(0.72 0.19 155 / 0.04) 0%, transparent 60%);
  pointer-events: none;
}

.video-results-section__header {
  margin-bottom: 1rem;
  position: relative;
}

.video-results-section__title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.video-results-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: relative;
}

.video-result-item {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.video-result-item__primary {
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: black;
}

.video-result-item__player {
  position: relative;
}

.video-result-item__video {
  display: block;
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
  background: black;
}

.video-result-item__player-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0.875rem;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
}

.video-result-item__label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.video-result-item__secondary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.video-result-item__show-photo-btn {
  width: 100%;
  justify-content: center;
}

.video-result-item__photo-reveal {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 280px;
}

@media (min-width: 768px) {
  .video-result-item__photo-reveal {
    max-width: 320px;
  }
}

.video-result-item__photo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.video-result-item__photo {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-muted);
  border: 1px solid var(--color-border);
  opacity: 0.85;
  transition: opacity 0.15s ease;
}

.video-result-item__photo:hover {
  opacity: 1;
}

.video-result-item__photo:hover .result-item__overlay {
  opacity: 1;
}

.video-result-item__photo img {
  display: block;
}

.video-result-item__primary--loading {
  background: var(--color-muted);
  border-color: var(--color-border);
}

.video-result-item__generating-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 4rem 2rem;
  text-align: center;
}

/* Error banner */
.error-banner {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid oklch(0.58 0.22 27 / 0.15);
  border-radius: var(--radius-lg);
  background: oklch(0.58 0.22 27 / 0.04);
}

/* Mobile spacing */
@media (max-width: 767px) {
  .home-view {
    gap: 1rem;
  }
}
</style>
