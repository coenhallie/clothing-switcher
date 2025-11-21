import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.genAI = null;
    this.model = null;

    if (this.apiKey) {
      this.initializeModels();
    } else {
      console.debug('Gemini API key not configured - image generation features will be unavailable');
    }
  }

  initializeModels() {
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'google/gemini-3-pro-image-preview',
    });
  }

  initialize(apiKey) {
    // This method is kept for backward compatibility but now uses env variable
    console.warn(
      'Gemini API key is configured via environment variables. User-provided key ignored.'
    );
  }

  async generateClothingTransfer(
    sourceImageFile,
    targetImageFile,
    options = {}
  ) {
    if (!this.model) {
      throw new Error('Gemini service not initialized');
    }

    try {
      const { default: imageProcessor } = await import(
        '../utils/imageUtils.js'
      );

      const optimizedImages = await imageProcessor.optimizeForAI(
        sourceImageFile,
        targetImageFile,
        {
          maxWidth: options.maxWidth || 1024,
          maxHeight: options.maxHeight || 1024,
          preserveQuality: true,
          highQuality: true,
          maintainAspectRatio: true,
          disableOrientationCorrection: false,
        }
      );

      const [sourcePart, targetPart] = await Promise.all([
        this.blobToGenerativePart(optimizedImages.source.blob),
        this.blobToGenerativePart(optimizedImages.target.blob),
      ]);

      const sourceInlineData = sourcePart?.inlineData?.data;
      const targetInlineData = targetPart?.inlineData?.data;
      const originalInlineData = new Set(
        [sourceInlineData, targetInlineData].filter(Boolean)
      );

      const prompt = `You will perform a virtual try-on.

The first image is the TARGET PERSON whose identity, body, pose, background, and lighting must remain intact.
The second image is the REFERENCE CLOTHING that provides the outfit design to recreate.

Generate a brand-new photorealistic photograph of the target person now wearing clothing that matches the reference image in style, color, texture, and accessories.

STRICT REQUIREMENTS:
- Do NOT copy or paste any pixels from the reference image. Synthesize the outfit so it naturally fits the target person's pose and proportions.
- Maintain the target person's face, body shape, hair, and environment exactly as shown in their photo.
- Recreate the clothing with realistic fabric behavior, shadows, and lighting consistent with the target photo.
- If an exact match is impossible, produce the closest believable interpretation while respecting the above constraints.`;

      const generationConfig = {
        maxOutputTokens: 20000,
        temperature: options.temperature ?? 0.7,
      };

      const result = await this.model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                text: 'TARGET PERSON IMAGE (person who will wear the clothing):',
              },
              targetPart,
              {
                text: 'REFERENCE CLOTHING IMAGE (clothing style to recreate):',
              },
              sourcePart,
            ],
          },
        ],
        generationConfig,
      });

      const response = await result.response;

      if (response?.promptFeedback?.blockReason) {
        throw new Error(
          `Generation blocked by Gemini safety filters (${response.promptFeedback.blockReason}). Try different or less revealing images.`
        );
      }

      const parts =
        response?.candidates?.[0]?.content?.parts ||
        response?.content?.parts ||
        [];

      for (const part of parts) {
        if (part.inlineData?.data && part.inlineData?.mimeType) {
          const imageData = part.inlineData.data;
          
          // Check for exact match (AI returned original image unchanged)
          if (originalInlineData.has(imageData)) {
            console.warn('Skipping original image returned by AI (exact match)');
            continue;
          }
          
          // Check for near-identical match (AI returned minimally modified original)
          // Compare first 100 chars and last 100 chars of base64 as a quick similarity check
          let isSimilarToOriginal = false;
          
          for (const originalData of originalInlineData) {
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
            continue;
          }
          
          const mimeType = part.inlineData.mimeType;
          const dataUrl = `data:${mimeType};base64,${part.inlineData.data}`;

          return {
            success: true,
            imageUrl: dataUrl,
            description: 'Clothing transfer completed successfully',
            timestamp: new Date().toISOString(),
          };
        }
      }

      console.error(
        'No valid generated image found in Gemini response:',
        JSON.stringify(response, null, 2)
      );

      // Return a specific error indicating no image was generated
      return {
        success: false,
        error: 'NO_IMAGE_GENERATED',
        message:
          'The AI returned an identical or near-identical image instead of generating a new one. This can happen occasionally - use the retry button to try again without being charged.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating clothing transfer with Gemini:', error);
      throw new Error(`Failed to generate clothing transfer: ${error.message}`);
    }
  }

  async analyzeClothing(imageFile) {
    if (!this.model) {
      throw new Error('Gemini service not initialized');
    }

    try {
      const imageData = await this.fileToGenerativePart(imageFile);

      const prompt = `
        Analyze this image and identify all clothing items present. For each clothing item, provide:
        1. Type of clothing (shirt, pants, dress, jacket, etc.)
        2. Color and pattern description
        3. Style and fit (casual, formal, loose, tight, etc.)
        4. Material appearance (cotton, denim, silk, etc.)
        5. Approximate position and size in the image
        6. Any distinctive features or details
        
        Return the analysis in JSON format with an array of clothing items.
        Example format:
        {
          "clothing_items": [
            {
              "type": "shirt",
              "color": "blue",
              "pattern": "solid",
              "style": "casual button-up",
              "material": "cotton",
              "position": "upper torso",
              "size": "medium",
              "features": ["collar", "long sleeves", "front buttons"]
            }
          ]
        }
      `;

      const result = await this.model.generateContent([
        prompt,
        imageData,
      ]);
      const response = await result.response;
      const text = response.text();

      try {
        return JSON.parse(text);
      } catch (parseError) {
        // If JSON parsing fails, return a structured response
        return {
          clothing_items: [],
          raw_analysis: text,
          error: 'Failed to parse structured response',
        };
      }
    } catch (error) {
      console.error('Error analyzing clothing:', error);
      throw new Error(`Failed to analyze clothing: ${error.message}`);
    }
  }

  async detectBodyPose(imageFile) {
    if (!this.model) {
      throw new Error('Gemini service not initialized');
    }

    try {
      const imageData = await this.fileToGenerativePart(imageFile);

      const prompt = `
        Analyze this image to detect the person's body pose and measurements. Provide:
        1. Body position and orientation (front, side, back, angle)
        2. Pose description (standing, sitting, arms position, etc.)
        3. Estimated body proportions and measurements
        4. Key body landmarks and their positions
        5. Clothing fit assessment on the current body
        
        Return the analysis in JSON format:
        {
          "pose": {
            "orientation": "front/side/back/angle",
            "position": "standing/sitting/etc",
            "arms": "description",
            "legs": "description"
          },
          "body_measurements": {
            "height_ratio": "estimated relative height",
            "shoulder_width": "estimated width",
            "torso_length": "estimated length",
            "proportions": "body type description"
          },
          "landmarks": [
            {"point": "shoulder", "x": 0.3, "y": 0.2},
            {"point": "waist", "x": 0.3, "y": 0.5}
          ]
        }
      `;

      const result = await this.model.generateContent([
        prompt,
        imageData,
      ]);
      const response = await result.response;
      const text = response.text();

      try {
        return JSON.parse(text);
      } catch (parseError) {
        return {
          pose: {},
          body_measurements: {},
          landmarks: [],
          raw_analysis: text,
          error: 'Failed to parse structured response',
        };
      }
    } catch (error) {
      console.error('Error detecting body pose:', error);
      throw new Error(`Failed to detect body pose: ${error.message}`);
    }
  }

  async generateVirtualTryOn(sourceImageFile, targetImageFile, options = {}) {
    if (!this.model) {
      throw new Error('Gemini service not initialized');
    }

    try {
      const sourceImageData = await this.fileToGenerativePart(sourceImageFile);
      const targetImageData = await this.fileToGenerativePart(targetImageFile);

      const prompt = `
        Create a virtual clothing try-on by transferring clothing from the source image to the person in the target image.
        
        Instructions:
        1. Identify and extract clothing items from the source image
        2. Analyze the target person's body pose, size, and proportions
        3. Intelligently fit and adapt the clothing to the target person
        4. Maintain realistic proportions, lighting, and shadows
        5. Preserve the target person's skin tone, hair, and facial features
        6. Ensure natural fabric draping and realistic clothing physics
        7. Match lighting conditions between source and target
        
        Options:
        - Fit adjustment: ${options.fitAdjustment || 'automatic'}
        - Lighting adaptation: ${options.lightingAdaptation || 'automatic'}
        - Style preservation: ${options.stylePreservation || 'high'}
        - Background preservation: ${
          options.backgroundPreservation || 'complete'
        }
        
        Generate a photorealistic image showing the target person wearing the clothing from the source image.
        The result should look natural and believable, as if the person is actually wearing those clothes.
      `;

      const result = await this.model.generateContent([
        prompt,
        sourceImageData,
        targetImageData,
      ]);

      const response = await result.response;
      const text = response.text();

      // Note: Gemini 2.0 Flash doesn't directly generate images
      // This would need to be combined with an image generation service
      // For now, return the analysis and instructions
      return {
        success: true,
        analysis: text,
        instructions:
          'Image generation would require additional image generation API',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating virtual try-on:', error);
      throw new Error(`Failed to generate virtual try-on: ${error.message}`);
    }
  }

  async generateOutfitRecommendations(wardrobeItems, preferences = {}) {
    if (!this.model) {
      throw new Error('Gemini service not initialized');
    }

    try {
      const prompt = `
        Based on the following wardrobe items and user preferences, generate outfit recommendations:
        
        Wardrobe Items: ${JSON.stringify(wardrobeItems)}
        Preferences: ${JSON.stringify(preferences)}
        
        Provide 5-10 outfit combinations that:
        1. Match the user's style preferences
        2. Are appropriate for the specified occasion/weather
        3. Create visually appealing color combinations
        4. Consider seasonal appropriateness
        5. Mix and match available items creatively
        
        Return recommendations in JSON format:
        {
          "recommendations": [
            {
              "id": "outfit_1",
              "name": "Casual Weekend Look",
              "items": ["item_id_1", "item_id_2", "item_id_3"],
              "occasion": "casual",
              "season": "spring",
              "style_notes": "Comfortable and relaxed",
              "color_harmony": "complementary blues and whites"
            }
          ]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        return JSON.parse(text);
      } catch (parseError) {
        return {
          recommendations: [],
          raw_response: text,
          error: 'Failed to parse recommendations',
        };
      }
    } catch (error) {
      console.error('Error generating outfit recommendations:', error);
      throw new Error(`Failed to generate recommendations: ${error.message}`);
    }
  }

  async enhanceImage(imageFile, enhancements = {}) {
    if (!this.model) {
      throw new Error('Gemini service not initialized');
    }

    try {
      const imageData = await this.fileToGenerativePart(imageFile);

      const prompt = `
        Analyze this image and provide enhancement suggestions:
        
        Enhancement options:
        - Brightness: ${enhancements.brightness || 'auto'}
        - Contrast: ${enhancements.contrast || 'auto'}
        - Color saturation: ${enhancements.saturation || 'auto'}
        - Sharpness: ${enhancements.sharpness || 'auto'}
        - Noise reduction: ${enhancements.noiseReduction || 'auto'}
        
        Provide specific recommendations for improving image quality while maintaining natural appearance.
        Return suggestions in JSON format with specific adjustment values.
      `;

      const result = await this.model.generateContent([
        prompt,
        imageData,
      ]);
      const response = await result.response;
      const text = response.text();

      try {
        return JSON.parse(text);
      } catch (parseError) {
        return {
          enhancements: {},
          raw_suggestions: text,
          error: 'Failed to parse enhancement suggestions',
        };
      }
    } catch (error) {
      console.error('Error enhancing image:', error);
      throw new Error(`Failed to enhance image: ${error.message}`);
    }
  }

  async fileToGenerativePart(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result.split(',')[1];
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: file.type,
          },
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async blobToGenerativePart(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result.split(',')[1];
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: blob.type || 'image/jpeg',
          },
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  isInitialized() {
    return (
      !!this.apiKey &&
      !!this.genAI &&
      !!this.model
    );
  }
}

export default new GeminiService();
