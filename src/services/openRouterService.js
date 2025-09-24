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
    if (this.apiKey) {
      console.warn(
        'OpenRouter API key is configured via environment variables. User-provided key ignored.'
      );
      return;
    }

    if (!apiKey || !apiKey.trim()) {
      throw new Error('API key is required');
    }
    this.apiKey = apiKey.trim();
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

      // Optimize images for AI processing with size matching and quality preservation
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

      const prompt = `You will perform a photorealistic virtual try-on.

The first image you receive is the TARGET PERSON. Preserve their face, body, pose, background, and lighting exactly as seen.
The second image you receive is the REFERENCE CLOTHING. Use it only as inspiration to recreate the outfit.

Strict requirements:
- Synthesize new clothing on the target person that closely matches the reference style, colors, textures, accessories, and overall aesthetic.
- Do NOT copy, paste, or return the original clothing image. Create a new rendering that fits the target person's pose and proportions naturally.
- Keep the target person's identity, anatomy, hair, and environment untouched.
- Ensure fabrics, shadows, and lighting match the target photo for realism.
- If an exact match is impossible, provide the closest believable recreation while respecting these rules.

${compatibilityInfo}`;

      const payload = {
        model: 'google/gemini-2.5-flash-image-preview',
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
                text: 'TARGET PERSON IMAGE (person who will wear the clothing):',
              },
              {
                type: 'image_url',
                image_url: {
                  url: targetDataUrl,
                },
              },
              {
                type: 'text',
                text: 'REFERENCE CLOTHING IMAGE (style to recreate on the target person):',
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
        temperature: 0.7,
        stream: false,
      };

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

      // Extract generated image from response - Gemini 2.5 Flash Image Preview format
      if (choice?.message) {
        const message = choice.message;

        // Check for inline data (Gemini format)
        if (message.content && message.content.parts) {
          for (const part of message.content.parts) {
            if (part.inline_data && part.inline_data.data) {
              if (originalInlineData.has(part.inline_data.data)) {
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
              if (originalInlineData.has(part.inline_data.data)) {
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

      // Log the actual response structure for debugging
      console.error(
        'Unexpected response structure:',
        JSON.stringify(result, null, 2)
      );

      // Return a specific error indicating no image was generated
      return {
        success: false,
        error: 'NO_IMAGE_GENERATED',
        message:
          'The AI was unable to generate an image. Please try again with different images.',
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
