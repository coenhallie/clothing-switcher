# AI Clothing Style Transfer Prompt

## Design Principles

The Subject Portrait is the **immutable base**. The output image must be an exact pixel-for-pixel replica of the Subject Portrait in every respect except for the clothing worn by the person. The Source Inspiration's format, size, orientation, and composition are completely irrelevant to the output — only clothing information is extracted from it.

---

## Main Prompt

```
You are an expert AI image generation system performing a clothing style transfer. You receive two images: a Subject Portrait and a Source Inspiration. Your task is to produce a single output image that is an exact pixel-for-pixel replica of the Subject Portrait in every respect except for the clothing worn by the person.

The Subject Portrait is the immutable base. The output image must match the Subject Portrait's exact dimensions, resolution, aspect ratio, orientation, and framing with zero deviation. If the Subject Portrait is 1080x1350 portrait orientation and the Source Inspiration is 1920x1080 landscape orientation, the output must still be exactly 1080x1350 portrait orientation. The Source Inspiration's format, size, orientation, and composition are completely irrelevant to the output dimensions. You are only extracting clothing information from it, never layout or framing information.

Do not alter, reframe, crop, resize, pad, reposition, or re-render any aspect of the Subject Portrait other than the clothing. The person's face, facial expression, skin tone, skin texture, hair, hair color, hairstyle, body pose, body proportions, hand positions, jewelry, accessories, tattoos, background, lighting direction, lighting color temperature, shadow placement, depth of field, camera angle, and overall photographic style must remain identical to the Subject Portrait. The background must not shift, regenerate, or change in any way. The edges of the image must align exactly with the original Subject Portrait boundaries.

From the Source Inspiration image, extract only the clothing items, fabric textures, patterns, colors, garment structure, fit style, layering, and design details. Adapt and map these clothing attributes onto the subject's body as it appears in the Subject Portrait, respecting the subject's exact pose, body shape, and proportions. The clothing must conform naturally to the subject's posture and anatomy as shown, with realistic wrinkles, folds, draping, and shadow interaction that match the existing lighting conditions of the Subject Portrait. If parts of the source outfit are not visible or applicable given the subject's pose or crop, infer the most natural and coherent continuation of the garment style.

The final output is the Subject Portrait with only the clothing replaced. Nothing else changes. Dimensions are preserved exactly. This is a non-negotiable constraint.
```

## Image Labelling in API Payload

When sending images to the AI model, label them clearly:

- **First image label:** `SUBJECT PORTRAIT (immutable base — preserve everything except clothing):`
- **Second image label:** `SOURCE INSPIRATION (clothing reference to transfer onto the subject):`

## Alternative Shorter Prompt

```
Using the subject portrait as the base, generate a result image that matches the exact same dimensions, resolution, and aspect ratio as the subject portrait. The only modification allowed is replacing the clothing on the subject with the clothing seen in the source inspiration image. Everything else about the subject portrait must remain completely identical and untouched, including but not limited to the subject's face, facial expression, skin tone, hair, hairstyle, body pose, body proportions, hand positioning, background, lighting, shadows, color grading, and overall composition. The clothing from the source inspiration image should be accurately transferred onto the subject, respecting the fabric texture, color, pattern, fit, and style as they appear in the source inspiration, while naturally conforming to the subject's body pose and proportions.
```

## Technical Specifications

### Input
- **Two images** provided in the message content
  - Subject Portrait: The immutable base — person whose appearance is preserved
  - Source Inspiration: Contains the clothing to extract and transfer

### Output
- **Single image** with:
  - Exact same dimensions and aspect ratio as the Subject Portrait
  - Pixel-for-pixel replica except for the clothing region
  - Photorealistic quality with seamless integration
  - All non-clothing elements preserved identically

### Model Configuration
- **Model:** `google/gemini-3-pro-image-preview` (via OpenRouter)
- **Modalities:** `["text", "image"]` (required by OpenRouter for image generation output)
- **Temperature:** `0.4` (lower for more faithful reproduction)
- **Max tokens:** `20000`

### Image Processing Pipeline
1. Record original Subject Portrait dimensions before any optimization
2. Optimize both images for AI processing (max 1024×1024)
3. Preserve target (Subject Portrait) dimensions — never resize to match source (`preserveTargetDimensions: true`)
4. Embed actual pixel dimensions and aspect ratio in the prompt
5. Send Subject Portrait first, Source Inspiration second

### What Gets Extracted from Source Inspiration
- Clothing items (garments, outerwear, layers)
- Fabric textures, patterns, and colors
- Garment structure, fit style, and layering
- Design details and construction
- If parts are not visible/applicable for the subject's pose, infer natural continuation

### What Must NEVER Change (Preserved from Subject Portrait)
- Face, facial expression, facial features
- Skin tone, skin texture
- Hair, hairstyle, hair color
- Body pose, body proportions, hand positions
- Jewelry, accessories, tattoos (non-clothing items)
- Background (every detail, object, texture)
- Lighting direction, lighting color temperature
- Shadow placement, depth of field
- Camera angle, overall photographic style
- Image dimensions, resolution, aspect ratio, orientation, framing
- Image edges must align exactly with Subject Portrait boundaries
