<template>
  <div class="w-full">
    <div
      ref="dropZone"
      class="upload-zone relative"
      :class="{ dragover: isDragOver }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="acceptedTypes"
        :multiple="multiple"
        class="hidden"
        @change="handleFileSelect"
      />

      <!-- Upload Content -->
      <div v-if="!previewImages.length" class="text-center">
        <svg
          class="w-16 h-16 text-gray-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">{{ title }}</h3>
        <p class="text-gray-600 mb-4">{{ description }}</p>
        <div class="flex flex-col sm:flex-row gap-2 justify-center">
          <button type="button" class="btn-primary" @click="triggerFileInput">
            Choose {{ multiple ? 'Files' : 'File' }}
          </button>
          <span class="text-sm text-gray-500 self-center"
            >or drag and drop</span
          >
        </div>
        <p class="text-xs text-gray-400 mt-2">
          {{ acceptedFormats }} (max {{ maxSizeMB }}MB{{
            multiple ? ' each' : ''
          }})
        </p>
      </div>

      <!-- Preview Images -->
      <div v-else class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="(image, index) in previewImages"
            :key="index"
            class="relative group"
          >
            <div
              class="aspect-w-16 aspect-h-12 bg-gray-100 rounded-lg overflow-hidden"
            >
              <img
                :src="image.url"
                :alt="image.name"
                class="w-full h-full object-cover"
              />

              <!-- Image overlay -->
              <div
                class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center"
              >
                <div
                  class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2"
                >
                  <button
                    @click.stop="viewImage(index)"
                    class="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 transition-colors"
                    title="View full size"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                  <button
                    @click.stop="removeImage(index)"
                    class="p-2 bg-white rounded-full text-gray-700 hover:text-red-600 transition-colors"
                    title="Remove image"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Image info -->
            <div class="mt-2">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ image.name }}
              </p>
              <p class="text-xs text-gray-500">
                {{ formatFileSize(image.size) }} • {{ image.dimensions }}
              </p>

              <!-- Upload progress -->
              <div v-if="image.uploading" class="mt-2">
                <div
                  class="flex items-center justify-between text-xs text-gray-600 mb-1"
                >
                  <span>Uploading...</span>
                  <span>{{ image.progress }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-1">
                  <div
                    class="bg-blue-600 h-1 rounded-full transition-all duration-300"
                    :style="{ width: `${image.progress}%` }"
                  ></div>
                </div>
              </div>

              <!-- Upload error -->
              <div v-if="image.error" class="mt-2 text-xs text-red-600">
                {{ image.error }}
              </div>
            </div>
          </div>
        </div>

        <!-- Add more button -->
        <div
          v-if="multiple && previewImages.length < maxFiles"
          class="text-center"
        >
          <button type="button" class="btn-secondary" @click="triggerFileInput">
            Add More Images
          </button>
        </div>
      </div>
    </div>

    <!-- Image viewer modal -->
    <div
      v-if="viewerImage"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      @click="closeViewer"
    >
      <div class="max-w-4xl max-h-full p-4">
        <img
          :src="viewerImage.url"
          :alt="viewerImage.name"
          class="max-w-full max-h-full object-contain"
          @click.stop
        />
        <button
          @click="closeViewer"
          class="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
        >
          <svg
            class="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits, defineProps } from 'vue';
import imageProcessor from '../utils/imageUtils';

const props = defineProps({
  title: {
    type: String,
    default: 'Upload Images',
  },
  description: {
    type: String,
    default: 'Drag and drop your images here',
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  maxFiles: {
    type: Number,
    default: 10,
  },
  maxSize: {
    type: Number,
    default: 20 * 1024 * 1024, // 20MB
  },
  acceptedTypes: {
    type: String,
    default: 'image/jpeg,image/jpg,image/png,image/webp',
  },
});

const emit = defineEmits(['upload', 'remove', 'error']);

// Reactive state
const dropZone = ref(null);
const fileInput = ref(null);
const isDragOver = ref(false);
const previewImages = ref([]);
const viewerImage = ref(null);

// Computed properties
const acceptedFormats = computed(() => {
  return props.acceptedTypes
    .split(',')
    .map((type) => type.split('/')[1].toUpperCase())
    .join(', ');
});

const maxSizeMB = computed(() => {
  return Math.round(props.maxSize / (1024 * 1024));
});

// Drag and drop handlers
const handleDragOver = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

const handleDragEnter = (e) => {
  e.preventDefault();
  e.stopPropagation();
  isDragOver.value = true;
};

const handleDragLeave = (e) => {
  e.preventDefault();
  e.stopPropagation();

  // Only set isDragOver to false if we're leaving the drop zone entirely
  if (!dropZone.value.contains(e.relatedTarget)) {
    isDragOver.value = false;
  }
};

const handleDrop = (e) => {
  e.preventDefault();
  e.stopPropagation();
  isDragOver.value = false;

  const files = Array.from(e.dataTransfer.files);
  processFiles(files);
};

// File input handlers
const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileSelect = (e) => {
  const files = Array.from(e.target.files);
  processFiles(files);

  // Reset file input
  e.target.value = '';
};

// File processing
const processFiles = async (files) => {
  if (!props.multiple && files.length > 1) {
    emit('error', 'Only one file is allowed');
    return;
  }

  if (
    props.multiple &&
    previewImages.value.length + files.length > props.maxFiles
  ) {
    emit('error', `Maximum ${props.maxFiles} files allowed`);
    return;
  }

  for (const file of files) {
    try {
      // Validate file
      imageProcessor.validateImageFile(file, props.maxSize);

      // Get image metadata with orientation correction
      const metadata = await imageProcessor.getImageMetadata(file);

      // Process image with high-quality preservation for preview
      const processedImage = await imageProcessor.processImageFile(
        file,
        1920,
        1920,
        {
          aiProcessing: false,
          preserveDetail: true,
          targetType: 'general',
          highQuality: true,
          disableOrientationCorrection: true,
        }
      );

      // Create preview using the orientation-corrected image
      const preview = {
        file,
        name: file.name,
        size: file.size,
        url: processedImage.dataUrl, // Use corrected image data URL
        dimensions: `${metadata.width}×${metadata.height}`,
        uploading: false,
        progress: 0,
        error: null,
        processedImage, // Store the processed image data
      };

      if (!props.multiple) {
        // Clear existing images for single upload
        previewImages.value.forEach((img) => {
          if (img.url.startsWith('blob:')) {
            URL.revokeObjectURL(img.url);
          }
        });
        previewImages.value = [preview];
      } else {
        previewImages.value.push(preview);
      }

      // Emit upload event with both original file and processed image
      emit('upload', { file, metadata, preview, processedImage });
    } catch (error) {
      emit('error', error.message);
    }
  }
};

// Image management
const removeImage = (index) => {
  const image = previewImages.value[index];
  // Only revoke blob URLs, not data URLs
  if (image.url.startsWith('blob:')) {
    URL.revokeObjectURL(image.url);
  }
  previewImages.value.splice(index, 1);
  emit('remove', { index, image });
};

const viewImage = (index) => {
  viewerImage.value = previewImages.value[index];
};

const closeViewer = () => {
  viewerImage.value = null;
};

// Utility functions
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Update upload progress
const updateProgress = (index, progress) => {
  if (previewImages.value[index]) {
    previewImages.value[index].progress = progress;
    previewImages.value[index].uploading = progress < 100;
  }
};

const setError = (index, error) => {
  if (previewImages.value[index]) {
    previewImages.value[index].error = error;
    previewImages.value[index].uploading = false;
  }
};

// Expose methods for parent component
defineExpose({
  updateProgress,
  setError,
  clearImages: () => {
    previewImages.value.forEach((img) => {
      // Only revoke blob URLs, not data URLs
      if (img.url.startsWith('blob:')) {
        URL.revokeObjectURL(img.url);
      }
    });
    previewImages.value = [];
  },
  getImages: () => previewImages.value,
});
</script>

<style scoped>
.upload-zone {
  min-height: 200px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-zone:hover {
  border-color: #3b82f6;
  background-color: #f8fafc;
}

.upload-zone.dragover {
  border-color: #3b82f6;
  background-color: #eff6ff;
  transform: scale(1.02);
}

.aspect-w-16 {
  position: relative;
  padding-bottom: 75%; /* 16:12 aspect ratio */
}

.aspect-w-16 > * {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
</style>
