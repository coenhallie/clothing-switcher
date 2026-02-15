/**
 * Google AI (Gemini) direct REST API service for image generation.
 *
 * Uses the generativelanguage.googleapis.com REST API directly via fetch
 * instead of a JS SDK, ensuring full browser compatibility and control
 * over the request payload (including responseModalities for image output).
 *
 * Model: gemini-3-pro-image-preview  ("Nano Banana")
 * Docs:  https://ai.google.dev/gemini-api/docs/image-generation
 */

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const IMAGE_MODEL = 'gemini-3-pro-image-preview';
const TEXT_MODEL = 'gemini-2.0-flash'; // for analysis / non-image tasks

const STORAGE_KEY = 'user_gemini_api_key';

class GeminiService {
  constructor() {
    this.apiKey = this._loadApiKey();

    if (!this.apiKey) {
      console.debug(
        'Gemini API key not configured — Google AI direct features will be unavailable',
      );
    }
  }

  /** Load API key: user-provided (localStorage) takes priority, then env var. */
  _loadApiKey() {
    try {
      const userKey = localStorage.getItem(STORAGE_KEY);
      if (userKey && userKey.trim()) return userKey.trim();
    } catch {
      // localStorage may be unavailable
    }
    return import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  /** Persist a user-provided API key and activate it immediately. */
  setApiKey(key) {
    const trimmed = (key || '').trim();
    try {
      if (trimmed) {
        localStorage.setItem(STORAGE_KEY, trimmed);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore write failures
    }
    this.apiKey = trimmed || import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  /** Return the currently stored user API key (empty string if none). */
  getUserApiKey() {
    try {
      return localStorage.getItem(STORAGE_KEY) || '';
    } catch {
      return '';
    }
  }

  /* ── helpers ──────────────────────────────────────────── */

  /** Build the full endpoint URL for a model action. */
  _url(model, action = 'generateContent') {
    return `${BASE_URL}/models/${model}:${action}?key=${this.apiKey}`;
  }

  /** POST JSON to a Gemini endpoint and return the parsed response. */
  async _post(model, body) {
    const url = this._url(model);
    const jsonBody = JSON.stringify(body);

    // Debug: log payload size and first/last chars for validation
    console.log('Gemini REST →', url.replace(/key=[^&]+/, 'key=***'));
    console.log('Gemini payload size:', jsonBody.length, 'chars');
    console.log('Gemini payload start:', jsonBody.substring(0, 120));
    console.log('Gemini payload end:', jsonBody.substring(jsonBody.length - 80));

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: jsonBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      let msg = `HTTP ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        msg = errorData?.error?.message || msg;
        if (errorData?.error?.details) {
          console.error('Error details:', JSON.stringify(errorData.error.details, null, 2));
        }
      } catch {
        msg = errorText || msg;
      }
      throw new Error(`Gemini API error: ${msg}`);
    }

    return response.json();
  }

  /** Convert a File / Blob to a Gemini inline_data part, compressing if needed. */
  async _toInlinePart(blob, maxBase64Chars = 2_700_000) {
    const { base64, mime } = await this._compressToMaxBase64(blob, maxBase64Chars);
    return {
      inlineData: {
        mimeType: mime,
        data: base64,
      },
    };
  }

  _blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Compress a blob so its base64 representation stays under maxBase64Chars.
   * Progressively lowers JPEG quality until the target is met.
   */
  async _compressToMaxBase64(blob, maxBase64Chars = 2_700_000) {
    const initialBase64 = await this._blobToBase64(blob);
    const binaryKB = Math.round(initialBase64.length * 0.75 / 1024);
    console.log(`[Gemini compression] Original: ${initialBase64.length} base64 chars (~${binaryKB} KB), limit: ${maxBase64Chars} chars (~${Math.round(maxBase64Chars * 0.75 / 1024)} KB)`);

    if (initialBase64.length <= maxBase64Chars) {
      console.log(`[Gemini compression] ✓ Within limit — no compression needed`);
      return { base64: initialBase64, mime: blob.type || 'image/jpeg' };
    }

    console.log(`[Gemini compression] Image exceeds limit, compressing…`);
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    for (const quality of [0.80, 0.70, 0.60, 0.50]) {
      const compressed = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', quality));
      const b64 = await this._blobToBase64(compressed);
      console.log(`  q=${quality}: ${b64.length} chars`);
      if (b64.length <= maxBase64Chars) {
        return { base64: b64, mime: 'image/jpeg' };
      }
    }

    // Final fallback: scale dimensions down by 50%
    const half = document.createElement('canvas');
    half.width = Math.round(canvas.width / 2);
    half.height = Math.round(canvas.height / 2);
    const hctx = half.getContext('2d');
    hctx.imageSmoothingEnabled = true;
    hctx.imageSmoothingQuality = 'high';
    hctx.drawImage(canvas, 0, 0, half.width, half.height);
    const smallBlob = await new Promise((r) => half.toBlob(r, 'image/jpeg', 0.75));
    const smallB64 = await this._blobToBase64(smallBlob);
    console.warn(`  Scaled to ${half.width}×${half.height}: ${smallB64.length} chars`);
    return { base64: smallB64, mime: 'image/jpeg' };
  }

  /* ── public API surface (matches openRouterService) ──── */

  isInitialized() {
    return !!this.apiKey;
  }

  initialize(apiKey) {
    if (apiKey) {
      this.setApiKey(apiKey);
    }
  }

  /**
   * Generate a clothing-transfer image.
   * Uses gemini-3-pro-image-preview with responseModalities: ["TEXT","IMAGE"].
   */
  async generateClothingTransfer(sourceImageFile, targetImageFile, options = {}) {
    if (!this.apiKey) {
      throw new Error('Gemini service not initialised — API key missing');
    }

    try {
      const { default: imageProcessor } = await import('../utils/imageUtils.js');

      // Original dimensions of the subject portrait (before optimisation)
      const targetMeta = await imageProcessor.getImageMetadata(targetImageFile);
      const subjectW = targetMeta.width;
      const subjectH = targetMeta.height;
      const subjectAR = (subjectW / subjectH).toFixed(4);

      console.log('Subject portrait original dimensions:', {
        width: subjectW,
        height: subjectH,
        aspectRatio: subjectAR,
      });

      // Optimise images for AI processing — allow up to 1024px for better detail
      // while keeping total payload safely under the 20 MB Gemini limit.
      const optimised = await imageProcessor.optimizeForAI(
        sourceImageFile,
        targetImageFile,
        {
          maxWidth: 1024,
          maxHeight: 1024,
          preserveQuality: false,
          highQuality: true,
          maintainAspectRatio: true,
          disableOrientationCorrection: false,
          preserveTargetDimensions: true,
        },
      );

      console.log('Image optimisation results:', {
        sourceSize: `${optimised.source.width}x${optimised.source.height}`,
        targetSize: `${optimised.target.width}x${optimised.target.height}`,
        compatibility: optimised.compatibility,
      });

      // Build inline-data parts — cap each at ~2 MB binary (~2.7M base64 chars).
      // Gemini supports up to 20 MB total request payload; with 2 images + prompt
      // this keeps us well within that limit while preserving image quality.
      const MAX_B64 = 2_700_000;
      const [sourcePart, targetPart] = await Promise.all([
        this._toInlinePart(optimised.source.blob, MAX_B64),
        this._toInlinePart(optimised.target.blob, MAX_B64),
      ]);

      // Keep originals for duplicate-detection later
      const originalData = new Set([
        sourcePart.inlineData.data,
        targetPart.inlineData.data,
      ]);

      // Prompt
      const prompt = `You are an expert AI image generation system performing a clothing style transfer. You will receive two images below.

IMAGE 1 = Subject Portrait (immutable base — preserve everything except clothing)
IMAGE 2 = Source Inspiration (clothing reference only)

Your task: produce a single output image that closely replicates the Subject Portrait in every respect except for the clothing worn by the person.

The Subject Portrait is the immutable base. The output image should closely match the Subject Portrait's aspect ratio (approximately ${subjectAR}) and use a similar portrait orientation and framing. The Source Inspiration's format, size, orientation, and composition are irrelevant to the output. You are only extracting clothing information from it, never layout or framing information.

Do not alter, reframe, crop, resize, pad, reposition, or re-render any aspect of the Subject Portrait other than the clothing. The person's face, facial expression, skin tone, skin texture, hair, hair color, hairstyle, body pose, body proportions, hand positions, jewelry, accessories, tattoos, background, lighting direction, lighting color temperature, shadow placement, depth of field, camera angle, and overall photographic style must remain identical to the Subject Portrait. The background must not shift, regenerate, or change in any way.

From the Source Inspiration image, extract only the clothing items, fabric textures, patterns, colors, garment structure, fit style, layering, and design details. Adapt and map these clothing attributes onto the subject's body as it appears in the Subject Portrait, respecting the subject's exact pose, body shape, and proportions. The clothing must conform naturally to the subject's posture and anatomy as shown, with realistic wrinkles, folds, draping, and shadow interaction that match the existing lighting conditions of the Subject Portrait. If parts of the source outfit are not visible or applicable given the subject's pose or crop, infer the most natural and coherent continuation of the garment style.

The final output is the Subject Portrait with only the clothing replaced. Nothing else changes. Maintain the original portrait orientation and framing.`;

      // Request body — REST API format
      const body = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              { text: 'SUBJECT PORTRAIT (immutable base — preserve everything except clothing):' },
              targetPart,
              { text: 'SOURCE INSPIRATION (clothing reference to transfer onto the subject):' },
              sourcePart,
            ],
          },
        ],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      };

      // Debug: log each part's type and data prefix for validation
      for (const part of body.contents[0].parts) {
        if (part.inlineData) {
          console.log(`Gemini part: inlineData mime=${part.inlineData.mimeType} len=${part.inlineData.data.length} prefix=${part.inlineData.data.substring(0, 20)}`);
        } else if (part.text) {
          console.log(`Gemini part: text len=${part.text.length}`);
        }
      }
      console.log('Gemini direct request — model:', IMAGE_MODEL, 'payload parts:', body.contents[0].parts.length);

      // ── retry loop — preview model has intermittent 400s ──
      const MAX_RETRIES = 4;
      let lastError = null;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 0) {
          const delay = 2000 * attempt; // 2s, 4s, 6s, 8s
          console.log(`Retrying Gemini (attempt ${attempt + 1}/${MAX_RETRIES + 1}) after ${delay / 1000}s…`);
          await new Promise((r) => setTimeout(r, delay));
        }

        try {
          const result = await this._post(IMAGE_MODEL, body);

          // Safety block
          if (result?.promptFeedback?.blockReason) {
            throw new Error(
              `Generation blocked by Gemini safety filters (${result.promptFeedback.blockReason}). Try different or less revealing images.`,
            );
          }

          const candidate = result?.candidates?.[0];

          if (candidate?.finishReason === 'SAFETY' || candidate?.finishReason === 'IMAGE_SAFETY') {
            throw new Error(
              'Generation blocked by Gemini safety filters. Try different or less revealing source images.',
            );
          }

          const parts = candidate?.content?.parts || [];

          for (const part of parts) {
            if (part.inlineData?.data && part.inlineData?.mimeType) {
              const imgData = part.inlineData.data;

              // Skip if AI returned an original image unchanged
              if (originalData.has(imgData)) {
                console.warn('Skipping original image returned by AI (exact match)');
                continue;
              }

              // Skip near-identical images
              let similar = false;
              for (const orig of originalData) {
                if (
                  imgData.length > 200 &&
                  orig.length > 200 &&
                  imgData.substring(0, 100) === orig.substring(0, 100) &&
                  imgData.substring(imgData.length - 100) === orig.substring(orig.length - 100)
                ) {
                  similar = true;
                  console.warn('Skipping near-identical image returned by AI');
                  break;
                }
              }
              if (similar) continue;

              const dataUrl = `data:${part.inlineData.mimeType};base64,${imgData}`;
              return {
                success: true,
                imageUrl: dataUrl,
                description: 'Clothing transfer completed successfully',
                timestamp: new Date().toISOString(),
              };
            }
          }

          // No image found in response — treat as transient failure and retry
          console.warn(`Gemini returned no image on attempt ${attempt + 1}`);
          lastError = new Error('Gemini returned a response without an image');
        } catch (err) {
          lastError = err;
          // Re-throw safety errors immediately (no point retrying)
          if (err.message?.includes('safety')) throw err;
          console.warn(`Gemini attempt ${attempt + 1} failed:`, err.message);
        }
      }

      // All retries exhausted
      if (lastError) {
        // If it was a non-image response, return a soft failure
        return {
          success: false,
          error: 'NO_IMAGE_GENERATED',
          message:
            lastError.message ||
            'The AI model failed to generate an image. This can happen occasionally — please try again.',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: false,
        error: 'NO_IMAGE_GENERATED',
        message: 'The AI model failed to return an image after multiple attempts.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating clothing transfer with Gemini:', error);
      throw new Error(`Failed to generate clothing transfer: ${error.message}`);
    }
  }

  /* ── Analysis helpers (text-only, use flash model) ───── */

  async analyzeClothing(imageFile) {
    if (!this.apiKey) throw new Error('Gemini service not initialised');

    try {
      const imagePart = await this._toInlinePart(imageFile);

      const result = await this._post(TEXT_MODEL, {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Analyse this image and identify all clothing items present. For each item provide:
1. Type of clothing (shirt, pants, dress, jacket, etc.)
2. Colour and pattern description
3. Style and fit (casual, formal, loose, tight, etc.)
4. Material appearance (cotton, denim, silk, etc.)
5. Any distinctive features or details

Return the analysis in JSON format with an array of clothing items.`,
              },
              imagePart,
            ],
          },
        ],
        generationConfig: { maxOutputTokens: 1000, temperature: 0.3 },
      });

      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      try {
        return JSON.parse(text);
      } catch {
        return { clothing_items: [], raw_analysis: text, error: 'Failed to parse structured response' };
      }
    } catch (error) {
      console.error('Error analysing clothing:', error);
      throw new Error(`Failed to analyse clothing: ${error.message}`);
    }
  }

  async detectBodyPose(imageFile) {
    if (!this.apiKey) throw new Error('Gemini service not initialised');

    try {
      const imagePart = await this._toInlinePart(imageFile);

      const result = await this._post(TEXT_MODEL, {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Analyse this image to detect the person's body pose and measurements. Provide:
1. Body position and orientation (front, side, back, angle)
2. Pose description (standing, sitting, arms position, etc.)
3. Estimated body proportions
4. Key body landmarks and their relative positions

Return the analysis in JSON format.`,
              },
              imagePart,
            ],
          },
        ],
        generationConfig: { maxOutputTokens: 1000, temperature: 0.3 },
      });

      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      try {
        return JSON.parse(text);
      } catch {
        return { pose: {}, body_measurements: {}, landmarks: [], raw_analysis: text, error: 'Failed to parse structured response' };
      }
    } catch (error) {
      console.error('Error detecting body pose:', error);
      throw new Error(`Failed to detect body pose: ${error.message}`);
    }
  }
}

export default new GeminiService();
