/**
 * OpenRouter API service for AI image generation and processing
 */

class OpenRouterService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    this.baseURL = 'https://openrouter.ai/api/v1';

    if (!this.apiKey) {
      console.error('OpenRouter API key not found in environment variables');
    }
  }

  initialize(apiKey) {
    // This method is kept for backward compatibility but now uses env variable
    console.warn(
      'OpenRouter API key is configured via environment variables. User-provided key ignored.'
    );
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

      // Optimize images for AI processing — preserve target quality as much as possible
      const optimizedImages = await imageProcessor.optimizeForAI(
        sourceImageFile,
        targetImageFile,
        {
          maxWidth: 1024,
          maxHeight: 1024,
          preserveQuality: true,
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

      // Convert optimized images to base64
      const sourceBase64 = await this.blobToBase64(optimizedImages.source.blob);
      const targetBase64 = await this.blobToBase64(optimizedImages.target.blob);

      // Validate base64 data
      if (!sourceBase64 || !targetBase64) {
        throw new Error('Failed to convert images to base64');
      }

      console.log('Base64 conversion successful:', {
        sourceLength: sourceBase64.length,
        targetLength: targetBase64.length,
      });

      const sourceDataUrl = `data:image/jpeg;base64,${sourceBase64}`;
      const targetDataUrl = `data:image/jpeg;base64,${targetBase64}`;
      const originalInlineData = new Set([sourceBase64, targetBase64]);
      const originalImageUrls = new Set([sourceDataUrl, targetDataUrl]);

      // Add size compatibility information to the prompt
      const compatibilityInfo = this.generateCompatibilityPrompt(
        optimizedImages.compatibility
      );

      const prompt = `You are an expert AI image generation system performing a clothing style transfer. You receive two images: a Subject Portrait and a Source Inspiration. Your task is to produce a single output image that is an exact pixel-for-pixel replica of the Subject Portrait in every respect except for the clothing worn by the person.

The Subject Portrait is the immutable base. The output image must match the Subject Portrait's exact dimensions (${optimizedImages.target.width}×${optimizedImages.target.height} pixels, aspect ratio ${subjectAspectRatio}), resolution, aspect ratio, orientation, and framing with zero deviation. The Source Inspiration's format, size, orientation, and composition are completely irrelevant to the output dimensions. You are only extracting clothing information from it, never layout or framing information.

Do not alter, reframe, crop, resize, pad, reposition, or re-render any aspect of the Subject Portrait other than the clothing. The person's face, facial expression, skin tone, skin texture, hair, hair color, hairstyle, body pose, body proportions, hand positions, jewelry, accessories, tattoos, background, lighting direction, lighting color temperature, shadow placement, depth of field, camera angle, and overall photographic style must remain identical to the Subject Portrait. The background must not shift, regenerate, or change in any way. The edges of the image must align exactly with the original Subject Portrait boundaries.

From the Source Inspiration image, extract only the clothing items, fabric textures, patterns, colors, garment structure, fit style, layering, and design details. Adapt and map these clothing attributes onto the subject's body as it appears in the Subject Portrait, respecting the subject's exact pose, body shape, and proportions. The clothing must conform naturally to the subject's posture and anatomy as shown, with realistic wrinkles, folds, draping, and shadow interaction that match the existing lighting conditions of the Subject Portrait. If parts of the source outfit are not visible or applicable given the subject's pose or crop, infer the most natural and coherent continuation of the garment style.

The final output is the Subject Portrait with only the clothing replaced. Nothing else changes. Dimensions are preserved exactly. This is a non-negotiable constraint.

${compatibilityInfo}`;

      const payload = {
        model: 'google/gemini-3-pro-image-preview',
        modalities: ['text', 'image'],
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'text',
                text: 'SUBJECT PORTRAIT (immutable base — preserve everything except clothing):',
              },
              {
                type: 'image_url',
                image_url: {
                  url: targetDataUrl,
                },
              },
              {
                type: 'text',
                text: 'SOURCE INSPIRATION (clothing reference to transfer onto the subject):',
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
        max_tokens: 20000,
        temperature: 0.4,
        stream: false,
      };

      // Retry loop for empty/failed Gemini responses
      const MAX_RETRIES = 2;
      let lastResult = null;
      let returnedOriginalImage = false;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 0) {
          console.log(`Retrying image generation (attempt ${attempt + 1}/${MAX_RETRIES + 1})...`);
          // Brief delay before retry to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
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
          const errorData = await response.json();
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

        // Early check: detect empty response (Gemini returned no content at all)
        const messageContent = choice?.message?.content;
        const completionTokens = result.usage?.completion_tokens || 0;
        
        if (
          (!messageContent || messageContent === '') &&
          completionTokens === 0
        ) {
          console.warn(
            `Empty response from Gemini (attempt ${attempt + 1}/${MAX_RETRIES + 1}): content is empty with 0 completion tokens`
          );
          // Retry on empty response - this is a transient Gemini issue
          if (attempt < MAX_RETRIES) {
            continue;
          }
          // All retries exhausted for empty response
          console.error(
            'All retries exhausted - Gemini consistently returned empty responses:',
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
        if (returnedOriginalImage && attempt < MAX_RETRIES) {
          console.warn(`AI returned original image on attempt ${attempt + 1}, retrying...`);
          returnedOriginalImage = false;
          continue;
        }

        // No image found in this attempt and no more retries
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
