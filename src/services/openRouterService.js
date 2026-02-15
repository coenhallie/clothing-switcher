/**
 * OpenRouter API service for AI image generation and processing
 */

const OR_STORAGE_KEY = 'user_openrouter_api_key';

class OpenRouterService {
  constructor() {
    this.baseURL = 'https://openrouter.ai/api/v1';
    this.apiKey = this._loadApiKey();

    if (!this.apiKey) {
      console.error('OpenRouter API key not found in environment variables');
    }
  }

  /** Load API key: user-provided (localStorage) takes priority, then env var. */
  _loadApiKey() {
    try {
      const userKey = localStorage.getItem(OR_STORAGE_KEY);
      if (userKey && userKey.trim()) return userKey.trim();
    } catch {
      // localStorage may be unavailable
    }
    return import.meta.env.VITE_OPENROUTER_API_KEY || '';
  }

  /** Persist a user-provided API key and activate it immediately. */
  setApiKey(key) {
    const trimmed = (key || '').trim();
    try {
      if (trimmed) {
        localStorage.setItem(OR_STORAGE_KEY, trimmed);
      } else {
        localStorage.removeItem(OR_STORAGE_KEY);
      }
    } catch {
      // ignore write failures
    }
    this.apiKey = trimmed || import.meta.env.VITE_OPENROUTER_API_KEY || '';
  }

  /** Return the currently stored user API key (empty string if none). */
  getUserApiKey() {
    try {
      return localStorage.getItem(OR_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  }

  initialize(apiKey) {
    if (apiKey) {
      this.setApiKey(apiKey);
    }
  }

  async generateClothingTransfer(
    sourceImageFile,
    targetImageFile,
    options = {}
  ) {
    if (!this.apiKey) {
      throw new Error('OpenRouter service not initialized');
    }

    try {
      // Import imageProcessor for optimization
      const { default: imageProcessor } = await import(
        '../utils/imageUtils.js'
      );

      // Get the original target (subject portrait) dimensions BEFORE any optimization
      const targetMetadata = await imageProcessor.getImageMetadata(targetImageFile);
      const subjectWidth = targetMetadata.width;
      const subjectHeight = targetMetadata.height;
      const subjectAspectRatio = (subjectWidth / subjectHeight).toFixed(4);

      console.log('Subject portrait original dimensions:', {
        width: subjectWidth,
        height: subjectHeight,
        aspectRatio: subjectAspectRatio,
      });

      // Optimize images for AI processing
      // Use 768×1024 max dimensions — matches Gemini's native 3:4 portrait output
      // and keeps per-image base64 payload under ~200KB
      const optimizedImages = await imageProcessor.optimizeForAI(
        sourceImageFile,
        targetImageFile,
        {
          maxWidth: 768,
          maxHeight: 1024,
          preserveQuality: false,
          highQuality: true,
          maintainAspectRatio: true,
          disableOrientationCorrection: false,
          preserveTargetDimensions: true,
        }
      );

      console.log('Image optimization results:', {
        sourceSize: `${optimizedImages.source.width}x${optimizedImages.source.height}`,
        targetSize: `${optimizedImages.target.width}x${optimizedImages.target.height}`,
        compatibility: optimizedImages.compatibility,
      });

      // Re-compress blobs to cap per-image base64 at ~2 MB binary (~2.7M base64 chars).
      // Gemini supports up to 20 MB total request payload; with 2 images + prompt
      // this keeps us well within that limit while preserving image quality.
      const MAX_BASE64_CHARS = 2_700_000;
      const sourceCompressed = await this.compressToMaxBase64(
        optimizedImages.source.blob, MAX_BASE64_CHARS
      );
      const targetCompressed = await this.compressToMaxBase64(
        optimizedImages.target.blob, MAX_BASE64_CHARS
      );

      const sourceBase64 = sourceCompressed.base64;
      const targetBase64 = targetCompressed.base64;

      // Validate base64 data
      if (!sourceBase64 || !targetBase64) {
        throw new Error('Failed to convert images to base64');
      }

      // Use JPEG MIME for all AI-bound payloads (compression produces JPEG)
      const sourceMime = sourceCompressed.mime;
      const targetMime = targetCompressed.mime;

      console.log('Base64 conversion successful:', {
        sourceLength: sourceBase64.length,
        targetLength: targetBase64.length,
        sourceMime,
        targetMime,
        sourceCompressed: sourceCompressed.wasCompressed,
        targetCompressed: targetCompressed.wasCompressed,
      });

      const sourceDataUrl = `data:${sourceMime};base64,${sourceBase64}`;
      const targetDataUrl = `data:${targetMime};base64,${targetBase64}`;
      const originalInlineData = new Set([sourceBase64, targetBase64]);
      const originalImageUrls = new Set([sourceDataUrl, targetDataUrl]);

      // Add size compatibility information to the prompt
      const compatibilityInfo = this.generateCompatibilityPrompt(
        optimizedImages.compatibility
      );

      // Build prompt with all text content consolidated (OpenRouter recommends text first, then images)
      const prompt = `You are an expert AI image generation system performing a clothing style transfer. You will receive two images below.

IMAGE 1 = Subject Portrait (immutable base — preserve everything except clothing)
IMAGE 2 = Source Inspiration (clothing reference only)

Your task: produce a single output image that closely replicates the Subject Portrait in every respect except for the clothing worn by the person.

The Subject Portrait is the immutable base. The output image should closely match the Subject Portrait's aspect ratio (approximately ${subjectAspectRatio}) and use a similar portrait orientation and framing. The Source Inspiration's format, size, orientation, and composition are irrelevant to the output. You are only extracting clothing information from it, never layout or framing information.

Do not alter, reframe, crop, resize, pad, reposition, or re-render any aspect of the Subject Portrait other than the clothing. The person's face, facial expression, skin tone, skin texture, hair, hair color, hairstyle, body pose, body proportions, hand positions, jewelry, accessories, tattoos, background, lighting direction, lighting color temperature, shadow placement, depth of field, camera angle, and overall photographic style must remain identical to the Subject Portrait. The background must not shift, regenerate, or change in any way.

From the Source Inspiration image, extract only the clothing items, fabric textures, patterns, colors, garment structure, fit style, layering, and design details. Adapt and map these clothing attributes onto the subject's body as it appears in the Subject Portrait, respecting the subject's exact pose, body shape, and proportions. The clothing must conform naturally to the subject's posture and anatomy as shown, with realistic wrinkles, folds, draping, and shadow interaction that match the existing lighting conditions of the Subject Portrait. If parts of the source outfit are not visible or applicable given the subject's pose or crop, infer the most natural and coherent continuation of the garment style.

The final output is the Subject Portrait with only the clothing replaced. Nothing else changes. Maintain the original portrait orientation and framing.

${compatibilityInfo}`;

      // Determine the closest supported aspect ratio for image generation output
      const outputAspectRatio = this.getClosestAspectRatio(
        optimizedImages.target.width / optimizedImages.target.height
      );

      console.log('Image generation config:', {
        subjectAspectRatio,
        outputAspectRatio,
        targetDimensions: `${optimizedImages.target.width}×${optimizedImages.target.height}`,
      });

      // Model to use for image generation
      const MODELS = [
        'google/gemini-3-pro-image-preview',
      ];

      // Build payload following OpenRouter recommended format:
      // text content first, then image content (avoids parsing issues)
      // NOTE: Do NOT include max_tokens or stream — these can cause
      // INVALID_ARGUMENT errors with Gemini image generation models.
      const buildPayload = (model) => ({
        model,
        modalities: ['image', 'text'],
        image_config: {
          aspect_ratio: outputAspectRatio,
          image_size: '1K',
        },
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: targetDataUrl,
                },
              },
              {
                type: 'image_url',
                image_url: {
                  url: sourceDataUrl,
                },
              },
            ],
          },
        ],
      });

      // Validate total payload size (base64 chars ≈ 75% of JSON body bytes)
      const totalBase64Chars = sourceBase64.length + targetBase64.length;
      console.log(`Total base64 payload: ${(totalBase64Chars / 1000).toFixed(0)}K chars (~${(totalBase64Chars * 0.75 / 1024).toFixed(0)}KB binary)`);

      // Log payload structure for debugging (without base64 data)
      console.log('Payload structure:', JSON.stringify({
        model: MODELS[0],
        modalities: ['image', 'text'],
        image_config: { aspect_ratio: outputAspectRatio, image_size: '1K' },
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: `[prompt: ${prompt.length} chars]` },
            { type: 'image_url', image_url: { url: `[target base64: ${targetBase64.length} chars, mime: ${targetMime}]` } },
            { type: 'image_url', image_url: { url: `[source base64: ${sourceBase64.length} chars, mime: ${sourceMime}]` } },
          ],
        }],
      }, null, 2));

      // Retry loop for empty/failed Gemini responses
      const MAX_RETRIES = 2;
      let lastResult = null;
      let returnedOriginalImage = false;

      // Total attempts = retries per model × number of models
      const totalAttempts = (MAX_RETRIES + 1) * MODELS.length;

      for (let attempt = 0; attempt < totalAttempts; attempt++) {
        const modelIndex = Math.floor(attempt / (MAX_RETRIES + 1));
        const modelAttempt = attempt % (MAX_RETRIES + 1);
        const currentModel = MODELS[modelIndex];
        const payload = buildPayload(currentModel);

        if (attempt > 0) {
          if (modelAttempt === 0) {
            console.log(`Switching to fallback model: ${currentModel}`);
          } else {
            console.log(`Retrying with ${currentModel} (attempt ${modelAttempt + 1}/${MAX_RETRIES + 1})...`);
          }
          // Brief delay before retry to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.min(modelAttempt, 2)));
        } else {
          console.log(`Trying model: ${currentModel}`);
        }

        const response = await fetch(`${this.baseURL}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Clothing Switcher App',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.warn(
            `HTTP error from ${currentModel} (attempt ${modelAttempt + 1}/${MAX_RETRIES + 1}):`,
            errorData.error?.message || response.statusText
          );
          // On HTTP error, skip remaining retries for this model and try the next model
          const nextModelStart = (modelIndex + 1) * (MAX_RETRIES + 1);
          if (nextModelStart < totalAttempts) {
            attempt = nextModelStart - 1; // will be incremented by the for loop
            continue;
          }
          throw new Error(
            `OpenRouter API error: ${
              errorData.error?.message || response.statusText
            }`
          );
        }

        const result = await response.json();
        lastResult = result;
        const choice = result.choices && result.choices[0];

        if (choice?.native_finish_reason === 'IMAGE_SAFETY') {
          throw new Error(
            'Generation blocked by Gemini safety filters. Try different or less revealing source images.'
          );
        }

        if (
          choice?.finish_reason?.toUpperCase?.() === 'SAFETY' ||
          choice?.finish_reason === 'SAFETY'
        ) {
          throw new Error(
            'Generation blocked by Gemini safety filters. Try adjusting your images and retry.'
          );
        }

        // Detect provider-level error in choice (e.g., INVALID_ARGUMENT from Google)
        if (choice?.error) {
          const providerError = choice.error.metadata?.raw || choice.error.message || 'Unknown provider error';
          console.warn(
            `Provider error from ${currentModel} (attempt ${modelAttempt + 1}/${MAX_RETRIES + 1}):`,
            providerError
          );
          if (modelAttempt < MAX_RETRIES) {
            continue;
          }
          // Retries exhausted for this model — try fallback model if available
          const nextModelStart = (modelIndex + 1) * (MAX_RETRIES + 1);
          if (nextModelStart < totalAttempts) {
            console.log(`Model ${currentModel} exhausted retries, trying next model...`);
            continue;
          }
          // All models and retries exhausted for provider error
          console.error('All models and retries exhausted — provider error persists:', JSON.stringify(result, null, 2));
          return {
            success: false,
            error: 'PROVIDER_ERROR',
            message: `The AI provider returned an error: ${typeof providerError === 'string' ? providerError : JSON.stringify(providerError)}. Please try again.`,
            timestamp: new Date().toISOString(),
          };
        }

        // Early check: detect empty response (Gemini returned no content at all)
        const messageContent = choice?.message?.content;
        const completionTokens = result.usage?.completion_tokens || 0;
        
        if (
          (!messageContent || messageContent === '') &&
          completionTokens === 0
        ) {
          console.warn(
            `Empty response from ${currentModel} (attempt ${modelAttempt + 1}/${MAX_RETRIES + 1}): content is empty with 0 completion tokens`
          );
          // Retry on empty response - this is a transient Gemini issue
          if (modelAttempt < MAX_RETRIES) {
            continue;
          }
          // Retries exhausted for this model — try fallback model if available
          const nextModelStart = (modelIndex + 1) * (MAX_RETRIES + 1);
          if (nextModelStart < totalAttempts) {
            console.log(`Model ${currentModel} exhausted retries (empty responses), trying next model...`);
            continue;
          }
          // All models and retries exhausted for empty response
          console.error(
            'All models and retries exhausted - consistently returned empty responses:',
            JSON.stringify(result, null, 2)
          );
          return {
            success: false,
            error: 'NO_IMAGE_GENERATED',
            message:
              'The AI model returned an empty response without generating an image. This is a temporary issue with the AI provider - please try again in a moment.',
            timestamp: new Date().toISOString(),
          };
        }

        // Extract generated image from response - Gemini image format
        if (choice?.message) {
          const message = choice.message;

          // Check for inline data (Gemini format)
          if (message.content && message.content.parts) {
            for (const part of message.content.parts) {
              if (part.inline_data && part.inline_data.data) {
                // Check for exact match (AI returned original image unchanged)
                if (originalInlineData.has(part.inline_data.data)) {
                  console.warn('Skipping original image returned by AI (exact match)');
                  continue;
                }
                
                // Check for near-identical match (AI returned minimally modified original)
                // Compare first 100 chars and last 100 chars of base64 as a quick similarity check
                const imageData = part.inline_data.data;
                let isSimilarToOriginal = false;
                
                for (const originalData of [sourceBase64, targetBase64]) {
                  if (imageData.length > 200 && originalData.length > 200) {
                    const dataPrefix = imageData.substring(0, 100);
                    const dataSuffix = imageData.substring(imageData.length - 100);
                    const origPrefix = originalData.substring(0, 100);
                    const origSuffix = originalData.substring(originalData.length - 100);
                    
                    // If both prefix and suffix match, it's likely the same image
                    if (dataPrefix === origPrefix && dataSuffix === origSuffix) {
                      isSimilarToOriginal = true;
                      console.warn('Skipping near-identical image returned by AI (similarity match)');
                      break;
                    }
                  }
                }
                
                if (isSimilarToOriginal) {
                  returnedOriginalImage = true;
                  continue;
                }
                
                // Convert base64 data to data URL
                const mimeType = part.inline_data.mime_type || 'image/png';
                const dataUrl = `data:${mimeType};base64,${part.inline_data.data}`;

                return {
                  success: true,
                  imageUrl: dataUrl,
                  description: 'Clothing transfer completed successfully',
                  timestamp: new Date().toISOString(),
                };
              }
            }
          }

          // Fallback: check for direct content parts (alternative format)
          if (message.content && Array.isArray(message.content)) {
            for (const part of message.content) {
              if (part.inline_data && part.inline_data.data) {
                // Check for exact match
                if (originalInlineData.has(part.inline_data.data)) {
                  console.warn('Skipping original image returned by AI (exact match)');
                  continue;
                }
                
                // Check for near-identical match
                const imageData = part.inline_data.data;
                let isSimilarToOriginal = false;
                
                for (const originalData of [sourceBase64, targetBase64]) {
                  if (imageData.length > 200 && originalData.length > 200) {
                    const dataPrefix = imageData.substring(0, 100);
                    const dataSuffix = imageData.substring(imageData.length - 100);
                    const origPrefix = originalData.substring(0, 100);
                    const origSuffix = originalData.substring(originalData.length - 100);
                    
                    if (dataPrefix === origPrefix && dataSuffix === origSuffix) {
                      isSimilarToOriginal = true;
                      console.warn('Skipping near-identical image returned by AI (similarity match)');
                      break;
                    }
                  }
                }
                
                if (isSimilarToOriginal) {
                  returnedOriginalImage = true;
                  continue;
                }
                
                const mimeType = part.inline_data.mime_type || 'image/png';
                const dataUrl = `data:${mimeType};base64,${part.inline_data.data}`;

                return {
                  success: true,
                  imageUrl: dataUrl,
                  description: 'Clothing transfer completed successfully',
                  timestamp: new Date().toISOString(),
                };
              }
            }
          }

          // Legacy format check (for backwards compatibility)
          if (message.images && message.images.length > 0) {
            for (const img of message.images) {
              const url = img?.image_url?.url;
              if (!url) continue;
              if (originalImageUrls.has(url)) {
                console.warn('Skipping original image URL returned by AI');
                returnedOriginalImage = true;
                continue;
              }

              return {
                success: true,
                imageUrl: url,
                description: message.content || 'Clothing transfer completed',
                timestamp: new Date().toISOString(),
              };
            }
          }
        }

        // If the AI returned an original/near-identical image, retry
        if (returnedOriginalImage) {
          if (modelAttempt < MAX_RETRIES) {
            console.warn(`AI returned original image on attempt ${modelAttempt + 1} with ${currentModel}, retrying...`);
            returnedOriginalImage = false;
            continue;
          }
          // Try fallback model
          const nextModelStart = (modelIndex + 1) * (MAX_RETRIES + 1);
          if (nextModelStart < totalAttempts) {
            console.log(`${currentModel} keeps returning originals, trying next model...`);
            returnedOriginalImage = false;
            continue;
          }
        }

        // No image found in this attempt and no more retries/models
        break;
      }

      // Log the actual response structure for debugging
      console.error(
        'No valid generated image found in response:',
        JSON.stringify(lastResult, null, 2)
      );

      // Return specific error based on failure type
      if (returnedOriginalImage) {
        return {
          success: false,
          error: 'NO_IMAGE_GENERATED',
          message:
            'The AI returned an identical or near-identical image instead of generating a new one. This can happen occasionally - use the retry button to try again without being charged.',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: false,
        error: 'NO_IMAGE_GENERATED',
        message:
          'The AI model failed to generate an image. This can happen occasionally due to model limitations - please try again.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating clothing transfer:', error);
      throw new Error(`Failed to generate clothing transfer: ${error.message}`);
    }
  }

  async analyzeClothing(imageFile) {
    if (!this.apiKey) {
      throw new Error('OpenRouter service not initialized');
    }

    try {
      const base64Image = await this.fileToBase64(imageFile);

      const payload = {
        model: 'anthropic/claude-3.5-sonnet', // Good for analysis
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this image and identify all clothing items present. For each clothing item, provide:
                1. Type of clothing (shirt, pants, dress, jacket, etc.)
                2. Color and pattern description
                3. Style and fit (casual, formal, loose, tight, etc.)
                4. Material appearance (cotton, denim, silk, etc.)
                5. Any distinctive features or details
                
                Return the analysis in JSON format with an array of clothing items.`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      };

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `OpenRouter API error (${response.status}): ${response.statusText}`;

        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = `OpenRouter API error: ${errorData.error.message}`;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', errorText);
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('OpenRouter API Response:', JSON.stringify(result, null, 2));
      const content = result.choices[0].message.content;

      try {
        return JSON.parse(content);
      } catch (parseError) {
        return {
          clothing_items: [],
          raw_analysis: content,
          error: 'Failed to parse structured response',
        };
      }
    } catch (error) {
      console.error('Error analyzing clothing:', error);
      throw new Error(`Failed to analyze clothing: ${error.message}`);
    }
  }

  async detectBodyPose(imageFile) {
    if (!this.apiKey) {
      throw new Error('OpenRouter service not initialized');
    }

    try {
      const base64Image = await this.fileToBase64(imageFile);

      const payload = {
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this image to detect the person's body pose and measurements. Provide:
                1. Body position and orientation (front, side, back, angle)
                2. Pose description (standing, sitting, arms position, etc.)
                3. Estimated body proportions
                4. Key body landmarks and their relative positions
                
                Return the analysis in JSON format.`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      };

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `OpenRouter API error: ${
            errorData.error?.message || response.statusText
          }`
        );
      }

      const result = await response.json();
      const content = result.choices[0].message.content;

      try {
        return JSON.parse(content);
      } catch (parseError) {
        return {
          pose: {},
          body_measurements: {},
          landmarks: [],
          raw_analysis: content,
          error: 'Failed to parse structured response',
        };
      }
    } catch (error) {
      console.error('Error detecting body pose:', error);
      throw new Error(`Failed to detect body pose: ${error.message}`);
    }
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Compress a blob so its base64 representation stays under maxBase64Chars.
   * Progressively lowers JPEG quality until the target is met.
   * Returns { base64, mime, wasCompressed }.
   */
  async compressToMaxBase64(blob, maxBase64Chars = 2_700_000) {
    // First try the blob as-is
    const initialBase64 = await this.blobToBase64(blob);
    const binaryKB = Math.round(initialBase64.length * 0.75 / 1024);
    console.log(`[OpenRouter compression] Original: ${initialBase64.length} base64 chars (~${binaryKB} KB), limit: ${maxBase64Chars} chars (~${Math.round(maxBase64Chars * 0.75 / 1024)} KB)`);

    if (initialBase64.length <= maxBase64Chars) {
      console.log(`[OpenRouter compression] ✓ Within limit — no compression needed`);
      return {
        base64: initialBase64,
        mime: blob.type || 'image/jpeg',
        wasCompressed: false,
      };
    }

    console.log(`[OpenRouter compression] Image exceeds limit, compressing…`);
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    // Step down quality from 0.80 → 0.50 in 0.10 increments
    const qualities = [0.80, 0.70, 0.60, 0.50];
    for (const quality of qualities) {
      const compressedBlob = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', quality)
      );
      const base64 = await this.blobToBase64(compressedBlob);

      console.log(`Re-compress at q=${quality}: ${initialBase64.length} → ${base64.length} chars`);

      if (base64.length <= maxBase64Chars) {
        return { base64, mime: 'image/jpeg', wasCompressed: true };
      }
    }

    // Final fallback: also scale dimensions down by 50%
    const halfCanvas = document.createElement('canvas');
    halfCanvas.width = Math.round(canvas.width / 2);
    halfCanvas.height = Math.round(canvas.height / 2);
    const halfCtx = halfCanvas.getContext('2d');
    halfCtx.imageSmoothingEnabled = true;
    halfCtx.imageSmoothingQuality = 'high';
    halfCtx.drawImage(canvas, 0, 0, halfCanvas.width, halfCanvas.height);

    const smallBlob = await new Promise((resolve) =>
      halfCanvas.toBlob(resolve, 'image/jpeg', 0.75)
    );
    const smallBase64 = await this.blobToBase64(smallBlob);

    console.warn(
      `Image still too large after quality reduction. Scaled to ${halfCanvas.width}×${halfCanvas.height}: ${smallBase64.length} chars`
    );

    return { base64: smallBase64, mime: 'image/jpeg', wasCompressed: true };
  }

  generateCompatibilityPrompt(compatibility) {
    let prompt = `
**Image Compatibility Analysis**:
- Overall Compatibility Score: ${compatibility.overallScore.toFixed(1)}/3.0
- Size Match: ${compatibility.sizeMatch}
- Aspect Ratio Match: ${compatibility.aspectRatioMatch}
- Quality Match: ${compatibility.qualityMatch}
`;

    if (compatibility.issues.length > 0) {
      prompt += `
**Detected Issues**:
${compatibility.issues.map((issue) => `- ${issue}`).join('\n')}
`;
    }

    if (compatibility.suggestions.length > 0) {
      prompt += `
**Processing Suggestions**:
${compatibility.suggestions.map((suggestion) => `- ${suggestion}`).join('\n')}
`;
    }

    return prompt;
  }

  /**
   * Map an image aspect ratio to the closest supported Gemini output aspect ratio.
   *
   * Supported ratios (from OpenRouter docs):
   *   1:1 → 1024×1024, 2:3 → 832×1248, 3:2 → 1248×832,
   *   3:4 → 864×1184,  4:3 → 1184×864, 4:5 → 896×1152,
   *   5:4 → 1152×896,  9:16 → 768×1344, 16:9 → 1344×768,
   *   21:9 → 1536×672
   */
  getClosestAspectRatio(ratio) {
    const supported = [
      { label: '1:1',  value: 1.0 },
      { label: '2:3',  value: 2 / 3 },
      { label: '3:2',  value: 3 / 2 },
      { label: '3:4',  value: 3 / 4 },
      { label: '4:3',  value: 4 / 3 },
      { label: '4:5',  value: 4 / 5 },
      { label: '5:4',  value: 5 / 4 },
      { label: '9:16', value: 9 / 16 },
      { label: '16:9', value: 16 / 9 },
      { label: '21:9', value: 21 / 9 },
    ];

    let closest = supported[0];
    let minDiff = Math.abs(ratio - closest.value);

    for (const entry of supported) {
      const diff = Math.abs(ratio - entry.value);
      if (diff < minDiff) {
        minDiff = diff;
        closest = entry;
      }
    }

    return closest.label;
  }

  isInitialized() {
    return !!this.apiKey;
  }

  // Test the API key
  async testConnection() {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'user',
              content: 'Hello, this is a test message.',
            },
          ],
          max_tokens: 10,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `API test failed: ${errorData.error?.message || response.statusText}`
        );
      }

      return { success: true, message: 'API connection successful' };
    } catch (error) {
      throw new Error(`API test failed: ${error.message}`);
    }
  }
}

export default new OpenRouterService();
