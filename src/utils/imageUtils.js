/**
 * Image processing utilities for the virtual try-on application
 */

export class ImageProcessor {
  constructor() {
    this.canvas = null;
    this.ctx = null;
  }

  /**
   * Initialize canvas for image processing
   */
  initCanvas(width = 800, height = 600) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
    return this.canvas;
  }

  /**
   * Load image from file
   */
  async loadImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Get EXIF orientation from image file
   */
  async getImageOrientation(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const view = new DataView(e.target.result);

        // Check for JPEG format
        if (view.getUint16(0, false) !== 0xffd8) {
          resolve(1); // Default orientation
          return;
        }

        const length = view.byteLength;
        let offset = 2;

        while (offset < length) {
          const marker = view.getUint16(offset, false);
          offset += 2;

          if (marker === 0xffe1) {
            // APP1 marker
            const exifLength = view.getUint16(offset, false);
            offset += 2;

            // Check for EXIF header
            if (view.getUint32(offset, false) !== 0x45786966) {
              offset += exifLength - 2;
              continue;
            }

            offset += 6; // Skip EXIF header

            const tiffOffset = offset;
            const byteOrder = view.getUint16(offset, false);
            const littleEndian = byteOrder === 0x4949;

            offset += 2;

            if (view.getUint16(offset, littleEndian) !== 0x002a) {
              resolve(1);
              return;
            }

            offset += 2;
            const ifdOffset = view.getUint32(offset, littleEndian);
            offset = tiffOffset + ifdOffset;

            const tagCount = view.getUint16(offset, littleEndian);
            offset += 2;

            for (let i = 0; i < tagCount; i++) {
              const tag = view.getUint16(offset, littleEndian);
              if (tag === 0x0112) {
                // Orientation tag
                const orientation = view.getUint16(offset + 8, littleEndian);
                resolve(orientation);
                return;
              }
              offset += 12;
            }
          } else {
            // Skip other markers
            const segmentLength = view.getUint16(offset, false);
            offset += segmentLength;
          }
        }

        resolve(1); // Default orientation
      };

      reader.onerror = () => resolve(1);
      reader.readAsArrayBuffer(file.slice(0, 64 * 1024)); // Read first 64KB
    });
  }

  /**
   * Apply orientation correction to canvas
   */
  applyOrientation(canvas, ctx, orientation) {
    const { width, height } = canvas;

    switch (orientation) {
      case 2:
        // Flip horizontal
        ctx.transform(-1, 0, 0, 1, width, 0);
        break;
      case 3:
        // Rotate 180°
        ctx.transform(-1, 0, 0, -1, width, height);
        break;
      case 4:
        // Flip vertical
        ctx.transform(1, 0, 0, -1, 0, height);
        break;
      case 5:
        // Rotate 90° CCW + flip horizontal
        ctx.transform(0, 1, 1, 0, 0, 0);
        break;
      case 6:
        // Rotate 90° CW
        ctx.transform(0, 1, -1, 0, height, 0);
        break;
      case 7:
        // Rotate 90° CW + flip horizontal
        ctx.transform(0, -1, -1, 0, height, width);
        break;
      case 8:
        // Rotate 90° CCW
        ctx.transform(0, -1, 1, 0, 0, width);
        break;
      default:
        // No transformation needed
        break;
    }
  }

  /**
   * Load and orient image correctly
   */
  async loadImageWithOrientation(file) {
    const img = await this.loadImage(file);
    const orientation = await this.getImageOrientation(file);

    // For most modern images, especially from phones, we should preserve the original orientation
    // Only apply correction if the orientation is clearly wrong and the image appears rotated
    if (orientation === 1 || orientation === undefined) {
      return img;
    }

    // Check if this is likely a phone image that should not be rotated
    // Phone images often have EXIF orientation but are already displayed correctly
    const aspectRatio = img.width / img.height;
    const isLikelyPhoneImage =
      (aspectRatio < 1 && (orientation === 6 || orientation === 8)) ||
      (aspectRatio > 1 && (orientation === 3 || orientation === 4));

    // For phone images that appear correct, don't apply rotation
    if (isLikelyPhoneImage) {
      return img;
    }

    // Only apply orientation correction for images that actually need it
    // Create canvas for orientation correction
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set initial canvas size based on orientation
    if (orientation >= 5 && orientation <= 8) {
      // Rotated orientations - swap width and height
      canvas.width = img.height;
      canvas.height = img.width;
    } else {
      canvas.width = img.width;
      canvas.height = img.height;
    }

    // Apply orientation transformation
    this.applyOrientation(canvas, ctx, orientation);

    // Draw the image
    ctx.drawImage(img, 0, 0);

    // Create new image from corrected canvas
    return new Promise((resolve, reject) => {
      const correctedImg = new Image();
      correctedImg.onload = () => resolve(correctedImg);
      correctedImg.onerror = reject;
      correctedImg.src = canvas.toDataURL('image/png');
    });
  }

  /**
   * Resize image while maintaining aspect ratio with intelligent sizing
   */
  resizeImage(img, maxWidth = 800, maxHeight = 600, options = {}) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Calculate new dimensions
    let { width, height } = img;
    const aspectRatio = width / height;
    const originalSize = width * height;

    // Apply intelligent sizing based on image characteristics
    const { targetWidth, targetHeight } = this.calculateOptimalDimensions(
      width,
      height,
      maxWidth,
      maxHeight,
      options
    );

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Use high-quality scaling for better results
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw resized image
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    return canvas;
  }

  /**
   * Calculate optimal dimensions for AI processing
   */
  calculateOptimalDimensions(width, height, maxWidth, maxHeight, options = {}) {
    const aspectRatio = width / height;
    const {
      preserveDetail = true,
      aiOptimized = false,
      targetType = 'general', // 'person', 'clothing', 'general'
      highQuality = false,
    } = options;

    // High quality mode - preserve original dimensions as much as possible
    if (highQuality) {
      let targetWidth = width;
      let targetHeight = height;

      // Only scale down if absolutely necessary
      if (width > maxWidth || height > maxHeight) {
        const scaleX = maxWidth / width;
        const scaleY = maxHeight / height;
        const scale = Math.min(scaleX, scaleY);

        targetWidth = Math.round(width * scale);
        targetHeight = Math.round(height * scale);
      }

      return { targetWidth, targetHeight };
    }

    // AI-optimized dimensions for better processing
    if (aiOptimized) {
      // Preserve aspect ratio while finding optimal AI dimensions
      let targetWidth, targetHeight;

      // Calculate dimensions that maintain aspect ratio
      if (aspectRatio >= 1) {
        // Landscape or square
        targetWidth = Math.min(maxWidth, 1024);
        targetHeight = Math.round(targetWidth / aspectRatio);

        if (targetHeight > maxHeight) {
          targetHeight = Math.min(maxHeight, 1024);
          targetWidth = Math.round(targetHeight * aspectRatio);
        }
      } else {
        // Portrait
        targetHeight = Math.min(maxHeight, 1024);
        targetWidth = Math.round(targetHeight * aspectRatio);

        if (targetWidth > maxWidth) {
          targetWidth = Math.min(maxWidth, 1024);
          targetHeight = Math.round(targetWidth / aspectRatio);
        }
      }

      return { targetWidth, targetHeight };
    }

    // Standard resizing with aspect ratio preservation
    let targetWidth = width;
    let targetHeight = height;

    // Scale down if too large
    if (width > maxWidth) {
      targetWidth = maxWidth;
      targetHeight = targetWidth / aspectRatio;
    }

    if (targetHeight > maxHeight) {
      targetHeight = maxHeight;
      targetWidth = targetHeight * aspectRatio;
    }

    // Ensure minimum size for detail preservation
    const minSize = preserveDetail ? 256 : 128;
    if (targetWidth < minSize || targetHeight < minSize) {
      if (targetWidth < targetHeight) {
        targetWidth = minSize;
        targetHeight = targetWidth / aspectRatio;
      } else {
        targetHeight = minSize;
        targetWidth = targetHeight * aspectRatio;
      }
    }

    return {
      targetWidth: Math.round(targetWidth),
      targetHeight: Math.round(targetHeight),
    };
  }

  /**
   * Convert canvas to blob
   */
  canvasToBlob(canvas, type = 'image/png', quality = 1.0) {
    return new Promise((resolve) => {
      canvas.toBlob(resolve, type, quality);
    });
  }

  /**
   * Convert canvas to data URL
   */
  canvasToDataURL(canvas, type = 'image/png', quality = 1.0) {
    return canvas.toDataURL(type, quality);
  }

  /**
   * Apply basic image filters
   */
  applyFilters(imageData, filters = {}) {
    const data = imageData.data;
    const { brightness = 0, contrast = 0, saturation = 0, hue = 0 } = filters;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Apply brightness
      if (brightness !== 0) {
        r += brightness;
        g += brightness;
        b += brightness;
      }

      // Apply contrast
      if (contrast !== 0) {
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        r = factor * (r - 128) + 128;
        g = factor * (g - 128) + 128;
        b = factor * (b - 128) + 128;
      }

      // Apply saturation
      if (saturation !== 0) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray + saturation * (r - gray);
        g = gray + saturation * (g - gray);
        b = gray + saturation * (b - gray);
      }

      // Clamp values
      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }

    return imageData;
  }

  /**
   * Detect edges using simple edge detection
   */
  detectEdges(imageData, threshold = 50) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new Uint8ClampedArray(data.length);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        // Sobel operator
        const gx =
          -1 * this.getGrayValue(data, (y - 1) * width + (x - 1)) +
          1 * this.getGrayValue(data, (y - 1) * width + (x + 1)) +
          -2 * this.getGrayValue(data, y * width + (x - 1)) +
          2 * this.getGrayValue(data, y * width + (x + 1)) +
          -1 * this.getGrayValue(data, (y + 1) * width + (x - 1)) +
          1 * this.getGrayValue(data, (y + 1) * width + (x + 1));

        const gy =
          -1 * this.getGrayValue(data, (y - 1) * width + (x - 1)) +
          -2 * this.getGrayValue(data, (y - 1) * width + x) +
          -1 * this.getGrayValue(data, (y - 1) * width + (x + 1)) +
          1 * this.getGrayValue(data, (y + 1) * width + (x - 1)) +
          2 * this.getGrayValue(data, (y + 1) * width + x) +
          1 * this.getGrayValue(data, (y + 1) * width + (x + 1));

        const magnitude = Math.sqrt(gx * gx + gy * gy);
        const value = magnitude > threshold ? 255 : 0;

        output[idx] = value;
        output[idx + 1] = value;
        output[idx + 2] = value;
        output[idx + 3] = 255;
      }
    }

    return new ImageData(output, width, height);
  }

  /**
   * Get grayscale value of pixel
   */
  getGrayValue(data, index) {
    const i = index * 4;
    return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  /**
   * Create image mask based on color similarity
   */
  createColorMask(imageData, targetColor, tolerance = 30) {
    const data = imageData.data;
    const mask = new Uint8ClampedArray(data.length);
    const [targetR, targetG, targetB] = targetColor;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const distance = Math.sqrt(
        Math.pow(r - targetR, 2) +
          Math.pow(g - targetG, 2) +
          Math.pow(b - targetB, 2)
      );

      const alpha = distance <= tolerance ? 255 : 0;

      mask[i] = alpha;
      mask[i + 1] = alpha;
      mask[i + 2] = alpha;
      mask[i + 3] = 255;
    }

    return new ImageData(mask, imageData.width, imageData.height);
  }

  /**
   * Blend two images using specified blend mode
   */
  blendImages(
    baseImageData,
    overlayImageData,
    blendMode = 'normal',
    opacity = 1.0
  ) {
    const baseData = baseImageData.data;
    const overlayData = overlayImageData.data;
    const result = new Uint8ClampedArray(baseData.length);

    for (let i = 0; i < baseData.length; i += 4) {
      const baseR = baseData[i];
      const baseG = baseData[i + 1];
      const baseB = baseData[i + 2];
      const baseA = baseData[i + 3];

      const overlayR = overlayData[i];
      const overlayG = overlayData[i + 1];
      const overlayB = overlayData[i + 2];
      const overlayA = overlayData[i + 3] * opacity;

      let resultR, resultG, resultB;

      switch (blendMode) {
        case 'multiply':
          resultR = (baseR * overlayR) / 255;
          resultG = (baseG * overlayG) / 255;
          resultB = (baseB * overlayB) / 255;
          break;
        case 'screen':
          resultR = 255 - ((255 - baseR) * (255 - overlayR)) / 255;
          resultG = 255 - ((255 - baseG) * (255 - overlayG)) / 255;
          resultB = 255 - ((255 - baseB) * (255 - overlayB)) / 255;
          break;
        case 'overlay':
          resultR =
            baseR < 128
              ? (2 * baseR * overlayR) / 255
              : 255 - (2 * (255 - baseR) * (255 - overlayR)) / 255;
          resultG =
            baseG < 128
              ? (2 * baseG * overlayG) / 255
              : 255 - (2 * (255 - baseG) * (255 - overlayG)) / 255;
          resultB =
            baseB < 128
              ? (2 * baseB * overlayB) / 255
              : 255 - (2 * (255 - baseB) * (255 - overlayB)) / 255;
          break;
        default: // normal
          resultR = overlayR;
          resultG = overlayG;
          resultB = overlayB;
      }

      // Alpha blending
      const alpha = overlayA / 255;
      result[i] = resultR * alpha + baseR * (1 - alpha);
      result[i + 1] = resultG * alpha + baseG * (1 - alpha);
      result[i + 2] = resultB * alpha + baseB * (1 - alpha);
      result[i + 3] = Math.max(baseA, overlayA);
    }

    return new ImageData(result, baseImageData.width, baseImageData.height);
  }

  /**
   * Extract dominant colors from image
   */
  extractDominantColors(imageData, numColors = 5) {
    const data = imageData.data;
    const colorMap = new Map();

    // Sample pixels (every 10th pixel for performance)
    for (let i = 0; i < data.length; i += 40) {
      const r = Math.floor(data[i] / 32) * 32;
      const g = Math.floor(data[i + 1] / 32) * 32;
      const b = Math.floor(data[i + 2] / 32) * 32;
      const key = `${r},${g},${b}`;

      colorMap.set(key, (colorMap.get(key) || 0) + 1);
    }

    // Sort by frequency and return top colors
    return Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, numColors)
      .map(([color, count]) => {
        const [r, g, b] = color.split(',').map(Number);
        return { r, g, b, count };
      });
  }

  /**
   * Calculate image histogram
   */
  calculateHistogram(imageData) {
    const data = imageData.data;
    const histogram = {
      red: new Array(256).fill(0),
      green: new Array(256).fill(0),
      blue: new Array(256).fill(0),
      luminance: new Array(256).fill(0),
    };

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const luminance = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

      histogram.red[r]++;
      histogram.green[g]++;
      histogram.blue[b]++;
      histogram.luminance[luminance]++;
    }

    return histogram;
  }

  /**
   * Validate image file
   */
  validateImageFile(file, maxSize = 10 * 1024 * 1024) {
    // Default 10MB maximum
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!validTypes.includes(file.type)) {
      throw new Error(
        'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
      );
    }

    if (file.size > maxSize) {
      throw new Error(
        `File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`
      );
    }

    return true;
  }

  /**
   * Get image metadata (preserving original dimensions)
   */
  async getImageMetadata(file) {
    const [img, orientation] = await Promise.all([
      this.loadImage(file),
      this.getImageOrientation(file),
    ]);

    // Use original dimensions without orientation correction
    const width = img.naturalWidth;
    const height = img.naturalHeight;

    return {
      width,
      height,
      aspectRatio: width / height,
      fileSize: file.size,
      fileType: file.type,
      fileName: file.name,
      lastModified: new Date(file.lastModified),
      orientation,
    };
  }

  /**
   * Process image file with intelligent resizing and optimization
   */
  async processImageFile(
    file,
    maxWidth = 2048,
    maxHeight = 2048,
    options = {}
  ) {
    try {
      // Validate the file first
      this.validateImageFile(file);

      // Get image metadata for analysis
      const metadata = await this.getImageMetadata(file);

      // Analyze image characteristics for optimal processing
      const analysis = this.analyzeImageForProcessing(metadata, options);

      // Load image with or without orientation correction
      const img = options.disableOrientationCorrection
        ? await this.loadImage(file)
        : await this.loadImageWithOrientation(file);

      // Apply intelligent resizing based on analysis
      const resizedCanvas = this.resizeImage(img, maxWidth, maxHeight, {
        ...options,
        ...analysis.recommendations,
      });

      // Always use maximum quality (100%)
      const useHighQuality = options.highQuality || options.preserveQuality;
      const format = useHighQuality ? 'image/png' : 'image/jpeg';
      const quality = 1.0; // Always use 100% quality

      const result = {
        canvas: resizedCanvas,
        dataUrl: this.canvasToDataURL(resizedCanvas, format, quality),
        blob: await this.canvasToBlob(resizedCanvas, format, quality),
        width: resizedCanvas.width,
        height: resizedCanvas.height,
        metadata,
        analysis,
        originalSize: { width: img.width, height: img.height },
      };

      return result;
    } catch (error) {
      throw new Error(`Failed to process image: ${error.message}`);
    }
  }

  /**
   * Analyze image characteristics for optimal processing
   */
  analyzeImageForProcessing(metadata, options = {}) {
    const { width, height, fileSize, aspectRatio } = metadata;
    const { targetType = 'general', aiProcessing = false } = options;

    const analysis = {
      size: this.categorizeImageSize(width, height),
      quality: this.assessImageQuality(width, height, fileSize),
      aspectRatio: this.categorizeAspectRatio(aspectRatio),
      recommendations: {},
      warnings: [],
      optimizations: [],
    };

    // Size-based recommendations
    if (analysis.size === 'very_large') {
      analysis.warnings.push(
        'Image is very large and may slow down processing'
      );
      analysis.optimizations.push(
        'Consider resizing to reduce processing time'
      );
      analysis.recommendations.preserveDetail = true;
    } else if (analysis.size === 'small') {
      analysis.warnings.push('Image resolution is low, results may be limited');
      analysis.recommendations.preserveDetail = true;
      analysis.recommendations.aiOptimized = false;
    }

    // AI processing optimizations
    if (aiProcessing) {
      analysis.recommendations.aiOptimized = true;
      analysis.recommendations.targetType = targetType;

      if (targetType === 'person') {
        analysis.optimizations.push(
          'Optimizing for person detection and pose analysis'
        );
      } else if (targetType === 'clothing') {
        analysis.optimizations.push('Optimizing for clothing item recognition');
      }
    }

    // Aspect ratio considerations
    if (analysis.aspectRatio === 'extreme') {
      analysis.warnings.push(
        'Unusual aspect ratio may affect AI processing quality'
      );
      analysis.optimizations.push(
        'Consider resizing to a more standard aspect ratio'
      );
    }

    return analysis;
  }

  /**
   * Categorize image size
   */
  categorizeImageSize(width, height) {
    const pixels = width * height;

    if (pixels > 4000000) return 'very_large'; // > 4MP
    if (pixels > 2000000) return 'large'; // > 2MP
    if (pixels > 500000) return 'medium'; // > 0.5MP
    if (pixels > 100000) return 'small'; // > 0.1MP
    return 'very_small';
  }

  /**
   * Assess image quality based on size and file size
   */
  assessImageQuality(width, height, fileSize) {
    const pixels = width * height;
    const bytesPerPixel = fileSize / pixels;

    // Rough quality assessment based on compression
    if (bytesPerPixel > 3) return 'high';
    if (bytesPerPixel > 1.5) return 'medium';
    if (bytesPerPixel > 0.5) return 'low';
    return 'very_low';
  }

  /**
   * Categorize aspect ratio
   */
  categorizeAspectRatio(ratio) {
    if (ratio > 2.5 || ratio < 0.4) return 'extreme';
    if (ratio > 1.8 || ratio < 0.55) return 'wide';
    if (ratio > 1.2 || ratio < 0.8) return 'moderate';
    return 'square';
  }

  /**
   * Optimize images for AI processing with size matching
   */
  async optimizeForAI(sourceFile, targetFile, options = {}) {
    try {
      const maxWidth = options.maxWidth || 2048;
      const maxHeight = options.maxHeight || 2048;
      const preserveTargetDimensions = options.preserveTargetDimensions || false;

      // Process target (subject portrait) FIRST so we know its dimensions
      const targetResult = await this.processImageFile(targetFile, maxWidth, maxHeight, {
        aiProcessing: true,
        targetType: 'person',
        highQuality: true,
        preserveQuality: true,
        ...options,
      });

      // Process source (clothing inspiration) — uses the same maxWidth/maxHeight
      const sourceResult = await this.processImageFile(sourceFile, maxWidth, maxHeight, {
        aiProcessing: true,
        targetType: 'clothing',
        highQuality: true,
        preserveQuality: true,
        ...options,
      });

      // Analyze size compatibility
      const compatibility = this.analyzeSizeCompatibility(
        sourceResult.analysis,
        targetResult.analysis
      );

      // When preserveTargetDimensions is set, the target (subject portrait) dimensions
      // are sacrosanct. Only resize the source to stay within AI limits; never resize
      // the target to match the source.
      if (preserveTargetDimensions) {
        return {
          source: sourceResult,
          target: targetResult,
          compatibility,
          recommendations: this.generateProcessingRecommendations(compatibility),
        };
      }

      // Apply size matching if needed and if maintainAspectRatio is not explicitly disabled
      const shouldMatchSizes =
        options.maintainAspectRatio !== false &&
        compatibility.overallScore < 2.5;
      const optimizedPair = shouldMatchSizes
        ? await this.matchImageSizes(sourceResult, targetResult, compatibility)
        : { source: sourceResult, target: targetResult };

      return {
        source: optimizedPair.source,
        target: optimizedPair.target,
        compatibility,
        recommendations: this.generateProcessingRecommendations(compatibility),
      };
    } catch (error) {
      throw new Error(`Failed to optimize images for AI: ${error.message}`);
    }
  }

  /**
   * Analyze compatibility between source and target images
   */
  analyzeSizeCompatibility(sourceAnalysis, targetAnalysis) {
    const compatibility = {
      sizeMatch: 'good',
      aspectRatioMatch: 'good',
      qualityMatch: 'good',
      overallScore: 0,
      issues: [],
      suggestions: [],
    };

    // Size compatibility
    const sizeDiff = Math.abs(
      this.getSizeScore(sourceAnalysis.size) -
        this.getSizeScore(targetAnalysis.size)
    );
    if (sizeDiff > 1) {
      compatibility.sizeMatch = 'poor';
      compatibility.issues.push('Significant size difference between images');
      compatibility.suggestions.push(
        'Consider resizing images to similar dimensions'
      );
    }

    // Aspect ratio compatibility
    if (sourceAnalysis.aspectRatio !== targetAnalysis.aspectRatio) {
      compatibility.aspectRatioMatch = 'moderate';
      compatibility.suggestions.push(
        'Different aspect ratios may affect clothing fit'
      );
    }

    // Quality compatibility
    if (sourceAnalysis.quality !== targetAnalysis.quality) {
      compatibility.qualityMatch = 'moderate';
      compatibility.suggestions.push(
        'Quality difference may affect result consistency'
      );
    }

    // Calculate overall score
    const scores = {
      good: 3,
      moderate: 2,
      poor: 1,
    };

    compatibility.overallScore =
      (scores[compatibility.sizeMatch] +
        scores[compatibility.aspectRatioMatch] +
        scores[compatibility.qualityMatch]) /
      3;

    return compatibility;
  }

  /**
   * Get numeric score for size category
   */
  getSizeScore(sizeCategory) {
    const scores = {
      very_small: 1,
      small: 2,
      medium: 3,
      large: 4,
      very_large: 5,
    };
    return scores[sizeCategory] || 3;
  }

  /**
   * Match image sizes for optimal AI processing
   */
  async matchImageSizes(sourceResult, targetResult, compatibility) {
    // If compatibility is good, return as-is
    if (compatibility.overallScore >= 2.5) {
      return { source: sourceResult, target: targetResult };
    }

    // Determine optimal target dimensions
    const targetDimensions = this.calculateMatchedDimensions(
      sourceResult.originalSize,
      targetResult.originalSize
    );

    // Resize both images to matched dimensions
    const sourceImg = new Image();
    const targetImg = new Image();

    await Promise.all([
      new Promise((resolve) => {
        sourceImg.onload = resolve;
        sourceImg.src = sourceResult.dataUrl;
      }),
      new Promise((resolve) => {
        targetImg.onload = resolve;
        targetImg.src = targetResult.dataUrl;
      }),
    ]);

    const matchedSource = this.resizeImage(
      sourceImg,
      targetDimensions.width,
      targetDimensions.height,
      { aiOptimized: true, targetType: 'clothing' }
    );

    const matchedTarget = this.resizeImage(
      targetImg,
      targetDimensions.width,
      targetDimensions.height,
      { aiOptimized: true, targetType: 'person' }
    );

    return {
      source: {
        ...sourceResult,
        canvas: matchedSource,
        dataUrl: this.canvasToDataURL(matchedSource),
        blob: await this.canvasToBlob(matchedSource),
        width: matchedSource.width,
        height: matchedSource.height,
      },
      target: {
        ...targetResult,
        canvas: matchedTarget,
        dataUrl: this.canvasToDataURL(matchedTarget),
        blob: await this.canvasToBlob(matchedTarget),
        width: matchedTarget.width,
        height: matchedTarget.height,
      },
    };
  }

  /**
   * Calculate optimal matched dimensions
   */
  calculateMatchedDimensions(sourceSize, targetSize) {
    // Calculate aspect ratios
    const sourceAspectRatio = sourceSize.width / sourceSize.height;
    const targetAspectRatio = targetSize.width / targetSize.height;

    // Use the larger image as the base to preserve quality
    const baseSize =
      sourceSize.width * sourceSize.height >
      targetSize.width * targetSize.height
        ? sourceSize
        : targetSize;

    // Use the aspect ratio of the target image (person) as it's more important for fit
    const aspectRatio = targetAspectRatio;

    // Calculate dimensions that preserve the target's aspect ratio
    let width, height;

    if (aspectRatio >= 1) {
      // Landscape or square
      width = Math.min(Math.max(baseSize.width, 512), 2048);
      height = Math.round(width / aspectRatio);
    } else {
      // Portrait
      height = Math.min(Math.max(baseSize.height, 512), 2048);
      width = Math.round(height * aspectRatio);
    }

    // Ensure both dimensions are within reasonable bounds
    width = Math.min(width, 2048);
    height = Math.min(height, 2048);

    return {
      width: Math.round(width),
      height: Math.round(height),
    };
  }

  /**
   * Generate processing recommendations
   */
  generateProcessingRecommendations(compatibility) {
    const recommendations = [];

    if (compatibility.overallScore < 2) {
      recommendations.push({
        type: 'warning',
        message: 'Image compatibility is low. Results may not be optimal.',
        action: 'Consider using images with similar dimensions and quality',
      });
    }

    if (compatibility.sizeMatch === 'poor') {
      recommendations.push({
        type: 'suggestion',
        message: 'Large size difference detected',
        action:
          'Images have been automatically resized for better compatibility',
      });
    }

    if (compatibility.aspectRatioMatch === 'poor') {
      recommendations.push({
        type: 'tip',
        message: 'Different aspect ratios may affect clothing fit',
        action: 'Consider resizing images to similar proportions',
      });
    }

    return recommendations;
  }
}

export default new ImageProcessor();
