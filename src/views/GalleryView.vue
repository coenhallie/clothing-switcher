<template>
  <div class="gallery-view">
    <!-- Header -->
    <div class="gallery-view__header">
      <div>
        <h1 class="text-xl font-semibold text-[var(--color-card-foreground)] tracking-tight">Gallery</h1>
        <p class="text-xs text-[var(--color-muted-foreground)] mt-0.5">Your generated looks.</p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="refreshGallery"
          :disabled="isLoading"
          class="gallery-btn"
        >
          <svg class="w-3.5 h-3.5" :class="{ 'animate-spin': isLoading }" fill="none" viewBox="0 0 24 24">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Refresh
        </button>

        <select
          v-model="sortOrder"
          @change="loadGalleryImages"
          class="gallery-select"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="galleryStats" class="gallery-view__stats">
      <span class="text-xs text-[var(--color-muted-foreground)]">
        {{ images.length }} of {{ totalImages }} images
      </span>
    </div>

    <!-- Loading -->
    <div v-if="isLoading && images.length === 0" class="gallery-view__empty">
      <div class="w-6 h-6 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-foreground)]"></div>
      <p class="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
    </div>

    <!-- Empty -->
    <div v-else-if="!isLoading && images.length === 0" class="gallery-view__empty">
      <div class="w-10 h-10 rounded-lg bg-[var(--color-muted)] flex items-center justify-center">
        <svg class="w-5 h-5 text-[var(--color-muted-foreground)]" fill="none" viewBox="0 0 24 24">
          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <div class="text-center">
        <p class="text-sm font-medium text-[var(--color-card-foreground)]">No images yet</p>
        <p class="text-xs text-[var(--color-muted-foreground)] mt-0.5">Generate your first look to get started.</p>
      </div>
      <router-link to="/" class="gallery-btn gallery-btn--primary mt-2">
        Create first image
      </router-link>
    </div>

    <!-- Grid -->
    <div v-else class="gallery-grid">
      <div
        v-for="image in images"
        :key="image.id"
        class="gallery-card group"
      >
        <div class="gallery-card__image">
          <img
            :src="image.generated_image_url"
            :alt="`Generated image from ${formatDate(image.created_at)}`"
            class="w-full h-full object-cover transition duration-200 group-hover:scale-[1.02]"
            @error="handleImageError"
          />
        </div>

        <div class="gallery-card__overlay">
          <div class="flex items-center gap-1.5">
            <button
              @click="downloadImage(image)"
              class="gallery-card__action"
              title="Download"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <button
              @click="deleteImage(image)"
              class="gallery-card__action gallery-card__action--danger"
              title="Delete"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
          <p class="text-[11px] text-white/70">{{ formatDate(image.created_at) }}</p>
        </div>
      </div>
    </div>

    <!-- Load more -->
    <div v-if="hasMore && !isLoading" class="flex justify-center mt-4">
      <button @click="loadMore" class="gallery-btn">
        Load more
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

const images = ref([]);
const isLoading = ref(false);
const galleryStats = ref(null);
const sortOrder = ref('newest');
const currentPage = ref(0);
const pageSize = 20;
const totalImages = ref(0);

const hasMore = computed(() => images.value.length < totalImages.value);

const loadGalleryImages = async (reset = true) => {
  if (reset) { currentPage.value = 0; images.value = []; }
  isLoading.value = true;

  try {
    const result = await GalleryService.getGalleryImages({
      limit: pageSize,
      offset: currentPage.value * pageSize,
      orderBy: 'created_at',
      ascending: sortOrder.value === 'oldest',
    });

    if (result.success) {
      if (reset) { images.value = result.data; } else { images.value.push(...result.data); }
      totalImages.value = result.count || 0;
    } else {
      addToast({ type: 'error', title: 'Failed to load gallery', message: result.error });
    }
  } catch (error) {
    addToast({ type: 'error', title: 'Gallery error', message: 'Failed to load images.' });
  } finally {
    isLoading.value = false;
  }
};

const loadGalleryStats = async () => {
  try {
    const result = await GalleryService.getGalleryStats();
    if (result.success) galleryStats.value = result.data;
  } catch (error) {
    console.error('Stats error:', error);
  }
};

const loadMore = async () => { currentPage.value++; await loadGalleryImages(false); };

const refreshGallery = async () => {
  await Promise.all([loadGalleryImages(true), loadGalleryStats()]);
};

const downloadImage = async (image) => {
  try {
    const filename = `switchfit-${image.id}-${formatDate(image.created_at, 'filename')}.png`;
    const result = await GalleryService.downloadImage(image.generated_image_url, filename);
    if (result.success) {
      addToast({ type: 'success', title: 'Downloaded', message: 'Image saved.' });
    } else {
      addToast({ type: 'error', title: 'Download failed', message: result.error });
    }
  } catch (error) {
    addToast({ type: 'error', title: 'Download error', message: 'Failed to download.' });
  }
};

const deleteImage = async (image) => {
  if (!confirm('Delete this image? This cannot be undone.')) return;

  try {
    const result = await GalleryService.deleteImage(image.id);
    if (result.success) {
      const index = images.value.findIndex((img) => img.id === image.id);
      if (index > -1) { images.value.splice(index, 1); totalImages.value--; }
      await loadGalleryStats();
      addToast({ type: 'success', title: 'Deleted', message: 'Image removed.' });
    } else {
      addToast({ type: 'error', title: 'Delete failed', message: result.error });
    }
  } catch (error) {
    addToast({ type: 'error', title: 'Delete error', message: 'Failed to delete.' });
  }
};

const handleImageError = (event) => {
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgMTZsNC41ODYtNC41ODZhMiAyIDAgMDEyLjgyOCAwTDE2IDE2bS0yLTJsMS41ODYtMS41ODZhMiAyIDAgMDEyLjgyOCAwTDIwIDE0bS02LTZoLjAxTTYgMjBoMTJhMiAyIDAgMDAyLTJWNmEyIDIgMCAwMC0yLTJINmEyIDIgMCAwMC0yIDJ2MTJhMiAyIDAgMDAyIDJ6IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHN2Zz4K';
};

const formatDate = (dateString, format = 'display') => {
  const date = new Date(dateString);
  if (format === 'filename') return date.toISOString().split('T')[0];
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

onMounted(async () => { await refreshGallery(); });
</script>

<style scoped>
.gallery-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.gallery-view__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.gallery-view__stats {
  display: flex;
  align-items: center;
}

.gallery-view__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
}

.gallery-grid {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(2, 1fr);
}

@media (min-width: 640px) {
  .gallery-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .gallery-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.gallery-card {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-muted);
}

.gallery-card__image {
  aspect-ratio: 3 / 4;
  overflow: hidden;
}

.gallery-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgb(0 0 0 / 0.5) 0%, transparent 40%);
  opacity: 0;
  transition: opacity 0.15s ease;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0.5rem;
}

.gallery-card:hover .gallery-card__overlay {
  opacity: 1;
}

.gallery-card__action {
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

.gallery-card__action:hover {
  background: rgb(255 255 255 / 0.25);
}

.gallery-card__action--danger:hover {
  background: rgb(239 68 68 / 0.4);
}

/* Shared button styles */
.gallery-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-card-foreground);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: border-color 0.15s ease;
  text-decoration: none;
  white-space: nowrap;
}

.gallery-btn:hover:not(:disabled) {
  border-color: var(--color-foreground);
}

.gallery-btn:disabled {
  opacity: 0.4;
}

.gallery-btn--primary {
  background: var(--color-foreground);
  color: var(--color-background);
  border-color: var(--color-foreground);
}

.gallery-btn--primary:hover {
  opacity: 0.88;
}

.gallery-select {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-card-foreground);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: border-color 0.15s ease;
}

.gallery-select:hover {
  border-color: var(--color-foreground);
}
</style>
