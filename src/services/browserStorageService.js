/**
 * Browser storage service for web version
 * Stores generated images locally in IndexedDB instead of Supabase
 */

const DB_NAME = 'switchfit_gallery';
const DB_VERSION = 1;
const STORE_NAME = 'generated_images';

export class BrowserStorageService {
  static db = null;

  /**
   * Initialize IndexedDB
   */
  static async initDB() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('[BrowserStorage] Error opening database');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          objectStore.createIndex('created_at', 'created_at', { unique: false });
          console.log('[BrowserStorage] Object store created');
        }
      };
    });
  }

  /**
   * Save a generated image locally in IndexedDB
   * @param {Object} imageData - The image data to save
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  static async saveImage(imageData) {
    try {
      await this.initDB();

      // Generate unique ID and timestamp
      const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date().toISOString();

      // Create image record with data URLs
      const imageRecord = {
        id,
        original_image_url: imageData.originalImageUrl,
        generated_image_url: imageData.generatedImageUrl,
        prompt: imageData.prompt || '',
        style_description: imageData.styleDescription || '',
        file_size: imageData.generatedImageUrl?.length || 0,
        image_width: imageData.imageWidth || null,
        image_height: imageData.imageHeight || null,
        created_at: timestamp,
        generation_status: 'completed',
      };

      // Save to IndexedDB
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.add(imageRecord);

        request.onsuccess = () => {
          console.log('[BrowserStorage] Image saved successfully:', id);
          resolve({ success: true, data: imageRecord });
        };

        request.onerror = () => {
          console.error('[BrowserStorage] Error saving image:', request.error);
          reject({ success: false, error: request.error?.message || 'Failed to save image' });
        };
      });
    } catch (error) {
      console.error('[BrowserStorage] Error saving image:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all gallery images from IndexedDB
   * @param {Object} options - Query options
   * @returns {Promise<{success: boolean, data?: Array, error?: string, count?: number}>}
   */
  static async getGalleryImages(options = {}) {
    try {
      await this.initDB();

      const { limit = 20, offset = 0 } = options;

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME);
        const index = objectStore.index('created_at');
        
        // Get all records in reverse chronological order
        const request = index.openCursor(null, 'prev');
        const results = [];
        let skipCount = 0;

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          
          if (cursor) {
            // Skip offset records
            if (skipCount < offset) {
              skipCount++;
              cursor.continue();
              return;
            }

            // Collect records up to limit
            if (results.length < limit) {
              results.push(cursor.value);
              cursor.continue();
            } else {
              // Got enough records
              resolve({
                success: true,
                data: results,
                count: results.length,
              });
            }
          } else {
            // No more records
            resolve({
              success: true,
              data: results,
              count: results.length,
            });
          }
        };

        request.onerror = () => {
          console.error('[BrowserStorage] Error fetching images:', request.error);
          reject({ success: false, error: request.error?.message || 'Failed to fetch images' });
        };
      });
    } catch (error) {
      console.error('[BrowserStorage] Error fetching gallery images:', error);
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
      await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.get(imageId);

        request.onsuccess = () => {
          if (request.result) {
            resolve({ success: true, data: request.result });
          } else {
            resolve({ success: false, error: 'Image not found' });
          }
        };

        request.onerror = () => {
          console.error('[BrowserStorage] Error fetching image:', request.error);
          reject({ success: false, error: request.error?.message || 'Failed to fetch image' });
        };
      });
    } catch (error) {
      console.error('[BrowserStorage] Error fetching image by ID:', error);
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
      await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.delete(imageId);

        request.onsuccess = () => {
          console.log('[BrowserStorage] Image deleted successfully:', imageId);
          resolve({ success: true });
        };

        request.onerror = () => {
          console.error('[BrowserStorage] Error deleting image:', request.error);
          reject({ success: false, error: request.error?.message || 'Failed to delete image' });
        };
      });
    } catch (error) {
      console.error('[BrowserStorage] Error deleting image:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get gallery statistics
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  static async getGalleryStats() {
    try {
      await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.getAll();

        request.onsuccess = () => {
          const images = request.result;
          const totalImages = images.length;
          const totalSize = images.reduce((sum, img) => sum + (img.file_size || 0), 0);
          const latestImage = images.length > 0 
            ? images.reduce((latest, img) => 
                new Date(img.created_at) > new Date(latest.created_at) ? img : latest
              ).created_at
            : null;

          resolve({
            success: true,
            data: {
              totalImages,
              totalSize,
              latestImage,
            },
          });
        };

        request.onerror = () => {
          console.error('[BrowserStorage] Error fetching stats:', request.error);
          reject({ success: false, error: request.error?.message || 'Failed to fetch stats' });
        };
      });
    } catch (error) {
      console.error('[BrowserStorage] Error fetching gallery stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear all images from IndexedDB
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  static async clearAll() {
    try {
      await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.clear();

        request.onsuccess = () => {
          console.log('[BrowserStorage] All images cleared');
          resolve({ success: true });
        };

        request.onerror = () => {
          console.error('[BrowserStorage] Error clearing images:', request.error);
          reject({ success: false, error: request.error?.message || 'Failed to clear images' });
        };
      });
    } catch (error) {
      console.error('[BrowserStorage] Error clearing all images:', error);
      return { success: false, error: error.message };
    }
  }
}

export default BrowserStorageService;