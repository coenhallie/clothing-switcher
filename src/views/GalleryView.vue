<template>
  <div class="flex flex-col gap-10">
    <!-- Header Section -->
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
            Your Gallery
          </div>
          <div class="space-y-3">
            <h1
              class="text-balance text-4xl font-semibold leading-tight text-[var(--color-card-foreground)] sm:text-5xl"
            >
              Your generated wardrobe collection.
            </h1>
            <p
              class="text-lg leading-relaxed text-[var(--color-muted-foreground)]"
            >
              Browse, download, and manage all your AI-generated try-on images
              in one place.
            </p>
          </div>
        </div>

        <div
          v-if="galleryStats"
          class="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_oklch,var(--color-muted)_38%,transparent)]/70 p-6 shadow-border"
        >
          <h2
            class="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-muted-foreground)]"
          >
            Statistics
          </h2>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-[var(--color-muted-foreground)]"
                >Total Images</span
              >
              <span
                class="text-lg font-semibold text-[var(--color-card-foreground)]"
              >
                {{ galleryStats.totalImages }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Gallery Controls -->
    <section
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex items-center gap-3">
        <button
          @click="refreshGallery"
          :disabled="isLoading"
          class="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-card-foreground)] transition hover:border-[var(--color-brand-500)] hover:bg-[color-mix(in_oklch,var(--color-brand-500)_12%,transparent)] hover:text-[var(--color-brand-600)] disabled:opacity-50"
        >
          <svg
            class="h-4 w-4"
            :class="{ 'animate-spin': isLoading }"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Refresh
        </button>

        <select
          v-model="sortOrder"
          @change="loadGalleryImages"
          class="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-card-foreground)] transition hover:border-[var(--color-brand-500)]"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      <div class="text-sm text-[var(--color-muted-foreground)]">
        {{ images.length }} of {{ totalImages }} images
      </div>
    </section>

    <!-- Loading State -->
    <div
      v-if="isLoading && images.length === 0"
      class="flex items-center justify-center py-20"
    >
      <div class="flex flex-col items-center gap-4">
        <div
          class="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-brand-500)]"
        ></div>
        <p class="text-sm text-[var(--color-muted-foreground)]">
          Loading your gallery...
        </p>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!isLoading && images.length === 0"
      class="flex flex-col items-center justify-center py-20"
    >
      <div
        class="flex h-20 w-20 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--color-muted)_40%,transparent)]"
      >
        <svg
          class="h-10 w-10 text-[var(--color-muted-foreground)]"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div class="mt-6 text-center">
        <h3 class="text-lg font-semibold text-[var(--color-card-foreground)]">
          No images yet
        </h3>
        <p class="mt-2 text-sm text-[var(--color-muted-foreground)]">
          Start creating try-on images to build your gallery.
        </p>
        <router-link
          to="/"
          class="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:opacity-90"
        >
          Create Your First Image
        </router-link>
      </div>
    </div>

    <!-- Gallery Grid -->
    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div
        v-for="image in images"
        :key="image.id"
        class="group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-soft transition hover:shadow-lg"
      >
        <!-- Image -->
        <div class="aspect-[3/4] overflow-hidden">
          <img
            :src="image.generated_image_url"
            :alt="`Generated image from ${formatDate(image.created_at)}`"
            class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            @error="handleImageError"
          />
        </div>

        <!-- Overlay -->
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"
        ></div>

        <!-- Actions -->
        <div
          class="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 transition-opacity group-hover:opacity-100"
        >
          <div class="flex items-center gap-2">
            <button
              @click="downloadImage(image)"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
              title="Download image"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24">
                <path
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>

            <button
              @click="deleteImage(image)"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-white backdrop-blur-sm transition hover:bg-red-500/30"
              title="Delete image"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24">
                <path
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>

          <div class="text-right">
            <p class="text-xs font-medium text-white">
              {{ formatDate(image.created_at) }}
            </p>
            <p v-if="image.file_size" class="text-xs text-white/80">
              {{ formatFileSize(image.file_size) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Load More -->
    <div v-if="hasMore && !isLoading" class="flex justify-center">
      <button
        @click="loadMore"
        class="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3 text-sm font-medium text-[var(--color-card-foreground)] transition hover:border-[var(--color-brand-500)] hover:bg-[color-mix(in_oklch,var(--color-brand-500)_12%,transparent)] hover:text-[var(--color-brand-600)]"
      >
        Load More Images
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAppStore } from '../stores/app';
import GalleryService from '../services/galleryService';

const appStore = useAppStore();
const { addToast } = appStore;

// Reactive data
const images = ref([]);
const isLoading = ref(false);
const galleryStats = ref(null);
const sortOrder = ref('newest');
const currentPage = ref(0);
const pageSize = 20;
const totalImages = ref(0);

// Computed
const hasMore = computed(() => images.value.length < totalImages.value);

// Methods
const loadGalleryImages = async (reset = true) => {
  if (reset) {
    currentPage.value = 0;
    images.value = [];
  }

  isLoading.value = true;

  try {
    const result = await GalleryService.getGalleryImages({
      limit: pageSize,
      offset: currentPage.value * pageSize,
      orderBy: 'created_at',
      ascending: sortOrder.value === 'oldest',
    });

    if (result.success) {
      if (reset) {
        images.value = result.data;
      } else {
        images.value.push(...result.data);
      }
      totalImages.value = result.count || 0;
    } else {
      addToast({
        type: 'error',
        title: 'Failed to load gallery',
        message: result.error,
      });
    }
  } catch (error) {
    console.error('Error loading gallery:', error);
    addToast({
      type: 'error',
      title: 'Gallery Error',
      message: 'Failed to load your gallery images.',
    });
  } finally {
    isLoading.value = false;
  }
};

const loadGalleryStats = async () => {
  try {
    const result = await GalleryService.getGalleryStats();
    if (result.success) {
      galleryStats.value = result.data;
    }
  } catch (error) {
    console.error('Error loading gallery stats:', error);
  }
};

const loadMore = async () => {
  currentPage.value++;
  await loadGalleryImages(false);
};

const refreshGallery = async () => {
  await Promise.all([loadGalleryImages(true), loadGalleryStats()]);
};

const downloadImage = async (image) => {
  try {
    const filename = `switchfit-${image.id}-${formatDate(
      image.created_at,
      'filename'
    )}.png`;
    const result = await GalleryService.downloadImage(
      image.generated_image_url,
      filename
    );

    if (result.success) {
      addToast({
        type: 'success',
        title: 'Download Started',
        message: 'Your image is being downloaded.',
      });
    } else {
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: result.error,
      });
    }
  } catch (error) {
    console.error('Error downloading image:', error);
    addToast({
      type: 'error',
      title: 'Download Error',
      message: 'Failed to download the image.',
    });
  }
};

const deleteImage = async (image) => {
  if (
    !confirm(
      'Are you sure you want to delete this image? This action cannot be undone.'
    )
  ) {
    return;
  }

  try {
    const result = await GalleryService.deleteImage(image.id);

    if (result.success) {
      // Remove from local array
      const index = images.value.findIndex((img) => img.id === image.id);
      if (index > -1) {
        images.value.splice(index, 1);
        totalImages.value--;
      }

      // Refresh stats
      await loadGalleryStats();

      addToast({
        type: 'success',
        title: 'Image Deleted',
        message: 'The image has been removed from your gallery.',
      });
    } else {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: result.error,
      });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    addToast({
      type: 'error',
      title: 'Delete Error',
      message: 'Failed to delete the image.',
    });
  }
};

const handleImageError = (event) => {
  event.target.src =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgMTZsNC41ODYtNC41ODZhMiAyIDAgMDEyLjgyOCAwTDE2IDE2bS0yLTJsMS41ODYtMS41ODZhMiAyIDAgMDEyLjgyOCAwTDIwIDE0bS02LTZoLjAxTTYgMjBoMTJhMiAyIDAgMDAyLTJWNmEyIDIgMCAwMC0yLTJINmEyIDIgMCAwMC0yIDJ2MTJhMiAyIDAgMDAyIDJ6IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHN2Zz4K';
};

const formatDate = (dateString, format = 'display') => {
  const date = new Date(dateString);

  if (format === 'filename') {
    return date.toISOString().split('T')[0];
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Lifecycle
onMounted(async () => {
  await refreshGallery();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
