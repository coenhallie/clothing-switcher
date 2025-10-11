import { writeFile, readDir, exists, remove, BaseDirectory } from '@tauri-apps/plugin-fs';

/**
 * Local storage service for Tauri mobile apps
 * Saves generated images locally instead of to Supabase
 */
export class LocalStorageService {
  static IMAGES_DIR = 'generated-images';
  static METADATA_FILE = 'gallery-metadata.json';

  /**
   * Initialize the local storage directory
   */
  static async initialize() {
    try {
      const dirExists = await exists(this.IMAGES_DIR, {
        baseDir: BaseDirectory.AppData,
      });

      if (!dirExists) {
        // Create directory by saving a placeholder file
        await writeFile(
          `${this.IMAGES_DIR}/.placeholder`,
          new Uint8Array([]),
          {
            baseDir: BaseDirectory.AppData,
          }
        );
      }

      console.log('[LocalStorage] Initialized successfully');
      return { success: true };
    } catch (error) {
      console.error('[LocalStorage] Initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load metadata from local storage
   */
  static async loadMetadata() {
    try {
      const metadataExists = await exists(this.METADATA_FILE, {
        baseDir: BaseDirectory.AppData,
      });

      if (!metadataExists) {
        return [];
      }

      // Read metadata file
      const { readTextFile } = await import('@tauri-apps/plugin-fs');
      const metadataText = await readTextFile(this.METADATA_FILE, {
        baseDir: BaseDirectory.AppData,
      });

      return JSON.parse(metadataText);
    } catch (error) {
      console.error('[LocalStorage] Error loading metadata:', error);
      return [];
    }
  }

  /**
   * Save metadata to local storage
   */
  static async saveMetadata(metadata) {
    try {
      const { writeTextFile } = await import('@tauri-apps/plugin-fs');
      await writeTextFile(
        this.METADATA_FILE,
        JSON.stringify(metadata, null, 2),
        {
          baseDir: BaseDirectory.AppData,
        }
      );
      return { success: true };
    } catch (error) {
      console.error('[LocalStorage] Error saving metadata:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Convert data URL to Uint8Array
   */
  static dataUrlToUint8Array(dataUrl) {
    const base64 = dataUrl.split(',')[1];
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Save a generated image locally
   * @param {Object} imageData - The image data to save
   * @param {string} imageData.originalImageUrl - Data URL of the original image
   * @param {string} imageData.generatedImageUrl - Data URL of the generated image
   * @param {string} imageData.prompt - The prompt used for generation
   * @param {string} imageData.styleDescription - Description of the style applied
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  static async saveImage(imageData) {
    try {
      await this.initialize();

      // Generate unique ID and filename
      const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date().toISOString();
      const generatedFilename = `${id}_generated.png`;
      const originalFilename = `${id}_original.png`;

      // Convert data URLs to Uint8Array
      const generatedImageBytes = this.dataUrlToUint8Array(
        imageData.generatedImageUrl
      );
      const originalImageBytes = this.dataUrlToUint8Array(
        imageData.originalImageUrl
      );

      // Save generated image
      await writeFile(
        `${this.IMAGES_DIR}/${generatedFilename}`,
        generatedImageBytes,
        {
          baseDir: BaseDirectory.AppData,
        }
      );

      // Save original image
      await writeFile(
        `${this.IMAGES_DIR}/${originalFilename}`,
        originalImageBytes,
        {
          baseDir: BaseDirectory.AppData,
        }
      );

      // Load existing metadata
      const metadata = await this.loadMetadata();

      // Create new image record
      const imageRecord = {
        id,
        original_image_filename: originalFilename,
        generated_image_filename: generatedFilename,
        prompt: imageData.prompt || '',
        style_description: imageData.styleDescription || '',
        file_size: generatedImageBytes.length,
        created_at: timestamp,
        generation_status: 'completed',
      };

      // Add to metadata
      metadata.unshift(imageRecord);

      // Save updated metadata
      await this.saveMetadata(metadata);

      console.log('[LocalStorage] Image saved successfully:', id);
      return { success: true, data: imageRecord };
    } catch (error) {
      console.error('[LocalStorage] Error saving image:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all gallery images
   * @param {Object} options - Query options
   * @param {number} options.limit - Maximum number of images to fetch
   * @param {number} options.offset - Number of images to skip
   * @returns {Promise<{success: boolean, data?: Array, error?: string, count?: number}>}
   */
  static async getGalleryImages(options = {}) {
    try {
      const { limit = 20, offset = 0 } = options;

      // Load metadata
      const metadata = await this.loadMetadata();
      const totalCount = metadata.length;

      // Apply pagination
      const paginatedData = metadata.slice(offset, offset + limit);

      // Convert filenames to data URLs for display
      const imagesWithUrls = await Promise.all(
        paginatedData.map(async (image) => {
          try {
            // Read the generated image file
            const { readFile } = await import('@tauri-apps/plugin-fs');
            const imageBytes = await readFile(
              `${this.IMAGES_DIR}/${image.generated_image_filename}`,
              {
                baseDir: BaseDirectory.AppData,
              }
            );

            // Convert to base64 data URL
            const base64 = btoa(
              String.fromCharCode.apply(null, Array.from(imageBytes))
            );
            const dataUrl = `data:image/png;base64,${base64}`;

            return {
              ...image,
              generated_image_url: dataUrl,
            };
          } catch (error) {
            console.error('[LocalStorage] Error reading image:', error);
            return image;
          }
        })
      );

      return {
        success: true,
        data: imagesWithUrls,
        count: totalCount,
      };
    } catch (error) {
      console.error('[LocalStorage] Error fetching gallery images:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get a single gallery image by ID
   * @param {string} imageId - The ID of the image to fetch
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  static async getImageById(imageId) {
    try {
      const metadata = await this.loadMetadata();
      const image = metadata.find((img) => img.id === imageId);

      if (!image) {
        return { success: false, error: 'Image not found' };
      }

      // Read the image file
      const { readFile } = await import('@tauri-apps/plugin-fs');
      const imageBytes = await readFile(
        `${this.IMAGES_DIR}/${image.generated_image_filename}`,
        {
          baseDir: BaseDirectory.AppData,
        }
      );

      // Convert to base64 data URL
      const base64 = btoa(
        String.fromCharCode.apply(null, Array.from(imageBytes))
      );
      const dataUrl = `data:image/png;base64,${base64}`;

      return {
        success: true,
        data: {
          ...image,
          generated_image_url: dataUrl,
        },
      };
    } catch (error) {
      console.error('[LocalStorage] Error fetching image by ID:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a gallery image
   * @param {string} imageId - The ID of the image to delete
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  static async deleteImage(imageId) {
    try {
      const metadata = await this.loadMetadata();
      const imageIndex = metadata.findIndex((img) => img.id === imageId);

      if (imageIndex === -1) {
        return { success: false, error: 'Image not found' };
      }

      const image = metadata[imageIndex];

      // Delete image files
      try {
        await remove(`${this.IMAGES_DIR}/${image.generated_image_filename}`, {
          baseDir: BaseDirectory.AppData,
        });
      } catch (err) {
        console.warn('[LocalStorage] Error deleting generated image:', err);
      }

      try {
        await remove(`${this.IMAGES_DIR}/${image.original_image_filename}`, {
          baseDir: BaseDirectory.AppData,
        });
      } catch (err) {
        console.warn('[LocalStorage] Error deleting original image:', err);
      }

      // Remove from metadata
      metadata.splice(imageIndex, 1);
      await this.saveMetadata(metadata);

      console.log('[LocalStorage] Image deleted successfully:', imageId);
      return { success: true };
    } catch (error) {
      console.error('[LocalStorage] Error deleting image:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get gallery statistics
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  static async getGalleryStats() {
    try {
      const metadata = await this.loadMetadata();

      const totalImages = metadata.length;
      const totalSize = metadata.reduce(
        (sum, img) => sum + (img.file_size || 0),
        0
      );
      const latestImage = metadata[0]?.created_at;

      return {
        success: true,
        data: {
          totalImages,
          totalSize,
          latestImage,
        },
      };
    } catch (error) {
      console.error('[LocalStorage] Error fetching gallery stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Download an image (for mobile, this could save to the public Pictures directory)
   * @param {string} imageId - The ID of the image to download
   * @param {string} filename - The filename for the downloaded image
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  static async downloadImage(imageId, filename) {
    try {
      const imageResult = await this.getImageById(imageId);
      if (!imageResult.success) {
        return imageResult;
      }

      const image = imageResult.data;

      // Read the image file
      const { readFile } = await import('@tauri-apps/plugin-fs');
      const imageBytes = await readFile(
        `${this.IMAGES_DIR}/${image.generated_image_filename}`,
        {
          baseDir: BaseDirectory.AppData,
        }
      );

      // Save to Pictures directory
      const downloadFilename = filename || `switchfit_${imageId}.png`;
      await writeFile(downloadFilename, imageBytes, {
        baseDir: BaseDirectory.Picture,
      });

      console.log('[LocalStorage] Image downloaded to Pictures:', downloadFilename);
      return { success: true };
    } catch (error) {
      console.error('[LocalStorage] Error downloading image:', error);
      return { success: false, error: error.message };
    }
  }
}

export default LocalStorageService;