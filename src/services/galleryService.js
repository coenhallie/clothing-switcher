import { supabase, TABLES } from './supabaseClient.js';
import LocalStorageService from './localStorageService.js';
import BrowserStorageService from './browserStorageService.js';

/**
 * Check if running in Tauri mobile environment
 */
async function isTauriMobile() {
  try {
    if (window.__TAURI__) {
      const { platform } = await import('@tauri-apps/plugin-os');
      const platformType = await platform();
      return platformType === 'android' || platformType === 'ios';
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Check if should use local storage based on platform and user preference
 * Returns object with storage type: 'tauri', 'browser', or 'supabase'
 */
async function shouldUseLocalStorage() {
  const isMobile = await isTauriMobile();
  
  // Check user preference from settings
  const settings = localStorage.getItem('app_settings');
  let useLocalStorage = isMobile; // Default: mobile uses local, web uses Supabase
  
  if (settings) {
    try {
      const parsed = JSON.parse(settings);
      // Check if user has explicitly set a preference
      if (typeof parsed.useLocalStorage === 'boolean') {
        useLocalStorage = parsed.useLocalStorage;
      }
    } catch (error) {
      console.error('[GalleryService] Error parsing settings:', error);
    }
  }
  
  // Determine storage type
  if (!useLocalStorage) {
    return { type: 'supabase', service: null };
  }
  
  // Use local storage - determine which service
  if (isMobile) {
    return { type: 'tauri', service: LocalStorageService };
  } else {
    return { type: 'browser', service: BrowserStorageService };
  }
}

/**
 * Gallery service for managing generated images
 * Automatically uses local storage on Tauri mobile, Supabase otherwise
 */
export class GalleryService {
  /**
   * Save a generated image to the gallery
   * @param {Object} imageData - The image data to save
   * @param {string} imageData.originalImageUrl - URL of the original image
   * @param {string} imageData.generatedImageUrl - URL of the generated image
   * @param {string} imageData.prompt - The prompt used for generation
   * @param {string} imageData.styleDescription - Description of the style applied
   * @param {number} imageData.fileSize - Size of the generated image file
   * @param {number} imageData.imageWidth - Width of the generated image
   * @param {number} imageData.imageHeight - Height of the generated image
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  static async saveImage(imageData) {
    try {
      // Check storage preference
      const storage = await shouldUseLocalStorage();
      
      if (storage.type !== 'supabase') {
        console.log(`[GalleryService] Using ${storage.type} storage`);
        return await storage.service.saveImage(imageData);
      }

      // Use Supabase storage
      console.log('[GalleryService] Using Supabase storage');
      
      // Get the current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error getting user for gallery save:', userError);
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from(TABLES.GALLERY_IMAGES)
        .insert([
          {
            user_id: user.id,
            original_image_url: imageData.originalImageUrl,
            generated_image_url: imageData.generatedImageUrl,
            prompt: imageData.prompt,
            style_description: imageData.styleDescription,
            file_size: imageData.fileSize,
            image_width: imageData.imageWidth,
            image_height: imageData.imageHeight,
            generation_status: 'completed',
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error saving image to gallery:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error saving image to gallery:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all gallery images for the current user
   * @param {Object} options - Query options
   * @param {number} options.limit - Maximum number of images to fetch
   * @param {number} options.offset - Number of images to skip
   * @param {string} options.orderBy - Field to order by (default: 'created_at')
   * @param {boolean} options.ascending - Sort order (default: false)
   * @returns {Promise<{success: boolean, data?: Array, error?: string, count?: number}>}
   */
  static async getGalleryImages(options = {}) {
    try {
      // Check storage preference
      const storage = await shouldUseLocalStorage();
      
      if (storage.type !== 'supabase') {
        console.log(`[GalleryService] Fetching from ${storage.type} storage`);
        return await storage.service.getGalleryImages(options);
      }

      // Use Supabase storage
      console.log('[GalleryService] Fetching from Supabase');
      
      // Get the current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error getting user for gallery fetch:', userError);
        return { success: false, error: 'User not authenticated' };
      }

      const {
        limit = 20,
        offset = 0,
        orderBy = 'created_at',
        ascending = false,
      } = options;

      let query = supabase
        .from(TABLES.GALLERY_IMAGES)
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order(orderBy, { ascending });

      if (limit) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching gallery images:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [], count };
    } catch (error) {
      console.error('Error fetching gallery images:', error);
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
      // Check storage preference
      const storage = await shouldUseLocalStorage();
      
      if (storage.type !== 'supabase') {
        return await storage.service.getImageById(imageId);
      }

      // Use Supabase storage
      const { data, error } = await supabase
        .from(TABLES.GALLERY_IMAGES)
        .select('*')
        .eq('id', imageId)
        .single();

      if (error) {
        console.error('Error fetching image by ID:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching image by ID:', error);
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
      // Check storage preference
      const storage = await shouldUseLocalStorage();
      
      if (storage.type !== 'supabase') {
        return await storage.service.deleteImage(imageId);
      }

      // Use Supabase storage
      const { error } = await supabase
        .from(TABLES.GALLERY_IMAGES)
        .delete()
        .eq('id', imageId);

      if (error) {
        console.error('Error deleting gallery image:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting gallery image:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update gallery image metadata
   * @param {string} imageId - The ID of the image to update
   * @param {Object} updates - The fields to update
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  static async updateImage(imageId, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.GALLERY_IMAGES)
        .update(updates)
        .eq('id', imageId)
        .select()
        .single();

      if (error) {
        console.error('Error updating gallery image:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error updating gallery image:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Download an image from URL
   * @param {string} imageUrl - The URL of the image to download
   * @param {string} filename - The filename for the downloaded image
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  static async downloadImage(imageUrl, filename) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'generated-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Error downloading image:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get gallery statistics for the current user
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  static async getGalleryStats() {
    try {
      // Check storage preference
      const storage = await shouldUseLocalStorage();
      
      if (storage.type !== 'supabase') {
        return await storage.service.getGalleryStats();
      }

      // Use Supabase storage
      // Get the current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error getting user for gallery stats:', userError);
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from(TABLES.GALLERY_IMAGES)
        .select('id, file_size, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching gallery stats:', error);
        return { success: false, error: error.message };
      }

      const totalImages = data.length;
      const totalSize = data.reduce(
        (sum, img) => sum + (img.file_size || 0),
        0
      );
      const latestImage = data[0]?.created_at;

      return {
        success: true,
        data: {
          totalImages,
          totalSize,
          latestImage,
        },
      };
    } catch (error) {
      console.error('Error fetching gallery stats:', error);
      return { success: false, error: error.message };
    }
  }
}

export default GalleryService;
