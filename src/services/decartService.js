/**
 * Decart AI service — Video Generation only.
 *
 * Uses Decart's Lucy Dev I2V model via the official @decartai/sdk
 * to generate ~5 s videos from still images (queue-based API).
 *
 * Image generation is handled by the Nano Banana (Gemini) service
 * via OpenRouter — see openRouterService.js.
 *
 * Docs: https://docs.platform.decart.ai/models/video/video-generation
 *
 * API flow (Queue):
 *   1. POST /v1/jobs/lucy-dev-i2v  → { job_id }
 *   2. GET  /v1/jobs/{job_id}       → { status }   (poll)
 *   3. GET  /v1/jobs/{job_id}/content → video blob
 *
 * Auth: X-API-KEY header
 */

import { createDecartClient, models } from '@decartai/sdk';

class DecartService {
  constructor() {
    this.apiKey = import.meta.env.VITE_DECART_API_KEY;
    this.baseURL = 'https://api.decart.ai';
    this.sdkClient = null;

    if (!this.apiKey) {
      console.debug(
        'Decart API key not configured — video generation features will be unavailable'
      );
    } else {
      // Initialize the official SDK client for queue-based video operations
      this.sdkClient = createDecartClient({ apiKey: this.apiKey });
    }
  }

  initialize(apiKey) {
    // Kept for backward compatibility — uses env variable
    console.warn(
      'Decart API key is configured via environment variables. User-provided key ignored.'
    );
  }

  // ---------------------------------------------------------------------------
  // Video Generation (Queue API — lucy-dev-i2v)
  // ---------------------------------------------------------------------------

  /**
   * Generate a ~5 s video from a still image with a full 360° turnaround.
   *
   * Uses Decart's **Dev** Queue API (lucy-dev-i2v):
   *   1. POST /v1/jobs/lucy-dev-i2v  → { job_id }
   *   2. GET  /v1/jobs/{job_id}       → { status }   (poll)
   *   3. GET  /v1/jobs/{job_id}/content → video blob
   *
   * The source image's native resolution and aspect ratio are preserved
   * throughout the entire pipeline — no cropping, padding, scaling, or
   * letterboxing is applied at any stage.
   *
   * @param {string|Blob|File} imageInput – The source image (data URL, Blob, or File).
   * @param {object} [options]
   * @param {string} [options.prompt]         – Motion / scene prompt.
   * @param {number} [options.pollInterval=2000] – ms between status polls.
   * @param {number} [options.timeout=180000]    – Max wait in ms.
   * @param {(status: object) => void} [options.onStatusChange] – Callback per poll.
   * @returns {Promise<{success: boolean, videoUrl?: string, timestamp: string, error?: string, message?: string}>}
   */
  async generateVideoFromImage(imageInput, options = {}) {
    if (!this.sdkClient) {
      throw new Error('Decart service not initialized');
    }

    try {
      // Convert data URL to Blob if needed
      let imageBlob;
      if (typeof imageInput === 'string' && imageInput.startsWith('data:')) {
        imageBlob = this.dataUrlToBlob(imageInput);
      } else if (imageInput instanceof Blob || imageInput instanceof File) {
        imageBlob = imageInput;
      } else {
        throw new Error('Invalid image input — expected data URL, File, or Blob.');
      }

      // Prepare the image: convert to JPEG and flatten transparency while
      // preserving the source image's EXACT native dimensions. No resizing,
      // cropping, padding, scaling, or letterboxing is applied.
      console.log('[DecartVideo] Preparing image for i2v (dev)…', {
        originalType: imageBlob.type,
        originalSize: imageBlob.size,
      });
      const { blob: preparedBlob, width: srcWidth, height: srcHeight } =
        await this.prepareImageForVideo(imageBlob);
      imageBlob = preparedBlob;

      // Wrap as File so the SDK sends a proper filename in the multipart form data
      const imageFile = new File([imageBlob], 'input.jpg', { type: 'image/jpeg' });

      const prompt =
        options.prompt ||
        `The camera slowly orbits 360 degrees around the person, completing one full smooth revolution. ` +
        `The person stands still in the center while the camera circles them, showing every angle — front, side, back, and returning to front. ` +
        `Steady, continuous camera orbit at constant speed. The subject remains stationary and centered. ` +
        `Background, lighting, and all details stay consistent throughout the full rotation.`;

      console.log('[DecartVideo] Submitting job via SDK (lucy-dev-i2v)…', {
        fileType: imageFile.type,
        fileSize: imageFile.size,
        fileName: imageFile.name,
        sourceDimensions: `${srcWidth}×${srcHeight}`,
        prompt: prompt.slice(0, 80) + '…',
      });

      // Use the SDK's manual submit → poll → result flow for better error details
      const job = await this.sdkClient.queue.submit({
        model: models.video('lucy-dev-i2v'),
        prompt,
        data: imageFile,
      });

      console.log('[DecartVideo] Job submitted (dev):', job.job_id);
      if (options.onStatusChange) {
        options.onStatusChange(job);
      }

      // Poll for completion
      const pollInterval = options.pollInterval || 2000;
      const timeout = options.timeout || 180_000; // 3 min (i2v can take a while)
      const deadline = Date.now() + timeout;

      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, pollInterval));

        const status = await this.sdkClient.queue.status(job.job_id);
        console.log('[DecartVideo] Job status:', status.status, status);

        if (options.onStatusChange) {
          options.onStatusChange(status);
        }

        if (status.status === 'completed') {
          // Download the video
          console.log('[DecartVideo] Job completed, downloading…');
          const videoBlob = await this.sdkClient.queue.result(job.job_id);
          const videoUrl = URL.createObjectURL(videoBlob);

          console.log('[DecartVideo] Video ready:', {
            size: videoBlob.size,
            type: videoBlob.type,
          });

          return {
            success: true,
            videoUrl,
            timestamp: new Date().toISOString(),
          };
        }

        if (status.status === 'failed') {
          // Log the FULL status object so we can diagnose server-side failures
          console.error('[DecartVideo] Job failed — full status:', JSON.stringify(status, null, 2));
          const detail =
            status.error?.message ||
            status.error ||
            status.detail ||
            status.message ||
            'Video generation failed on the Decart servers (no details returned).';
          throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
        }
      }

      throw new Error(
        `Video generation timed out after ${timeout / 1000}s. The job (${job.job_id}) may still complete.`
      );
    } catch (error) {
      console.error('Error generating video with Decart:', error);
      throw new Error(`Failed to generate video: ${error.message}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Prepare an image for the i2v model — preserve native dimensions.
   *
   * Converts the source image to JPEG and flattens any transparency, but
   * preserves the EXACT native resolution and aspect ratio of the input.
   * No cropping, padding, scaling, resizing, or letterboxing is applied.
   *
   * Returns both the prepared blob AND the source dimensions so the caller
   * can embed them in the generation prompt.
   *
   * @param {Blob} blob – Source image blob.
   * @param {number} [quality=0.95] – JPEG quality (0–1).
   * @returns {Promise<{blob: Blob, width: number, height: number}>}
   */
  prepareImageForVideo(blob, quality = 0.95) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        try {
          const w = img.naturalWidth;
          const h = img.naturalHeight;

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;

          const ctx = canvas.getContext('2d');

          // White background (flatten transparency)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, w, h);

          // Draw at native dimensions — no cropping, no scaling
          ctx.drawImage(img, 0, 0, w, h);

          canvas.toBlob(
            (jpegBlob) => {
              URL.revokeObjectURL(url);
              if (jpegBlob) {
                console.log('[DecartVideo] Prepared image for i2v (native dims preserved):', {
                  dimensions: `${w}×${h}`,
                  from: `${blob.size} bytes (${blob.type})`,
                  to: `${jpegBlob.size} bytes (image/jpeg)`,
                });
                resolve({ blob: jpegBlob, width: w, height: h });
              } else {
                reject(new Error('Failed to prepare image for video'));
              }
            },
            'image/jpeg',
            quality
          );
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image for video preparation'));
      };

      img.src = url;
    });
  }

  /**
   * Convert a data URL string to a Blob.
   */
  dataUrlToBlob(dataUrl) {
    const [header, base64] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  }

  /**
   * Convert a Blob to a base64 data URL string.
   */
  blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  isInitialized() {
    return !!this.apiKey;
  }

  /**
   * Quick health-check against the Decart API.
   * Verifies the API key is valid by checking account status.
   */
  async testConnection() {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

    try {
      // Use a minimal text-to-image call to verify the key.
      // A 480p generation is the cheapest option.
      const formData = new FormData();
      formData.append('prompt', 'Test connection — a plain white square');
      formData.append('resolution', '480p');

      const response = await fetch(
        `${this.baseURL}/v1/generate/lucy-pro-t2i`,
        {
          method: 'POST',
          headers: {
            'X-API-KEY': this.apiKey,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        throw new Error(`API test failed (${response.status}): ${errorText}`);
      }

      return { success: true, message: 'Decart API connection successful' };
    } catch (error) {
      throw new Error(`API test failed: ${error.message}`);
    }
  }
}

export default new DecartService();
