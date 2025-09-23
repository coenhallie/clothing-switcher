# Clothing Mimic

A simple Vue.js application that uses AI to mimic clothing styles between photos. Upload a source photo with clothing you want to copy and a target photo of yourself, and the AI will generate an image of you wearing the same clothing style.

## Features

- **Clean Side-by-Side Upload**: Simple interface for uploading source and target images
- **AI-Powered Clothing Transfer**: Advanced AI generates realistic clothing style transfer
- **Instant Results**: Fast image generation with download capability
- **OpenRouter Integration**: Uses Gemini 2.5 Flash Image Preview for high-quality results
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenRouter API key from [OpenRouter](https://openrouter.ai/keys)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd clothing-switcher
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

5. Go to Settings and configure your OpenRouter API key

## Usage

### Clothing Mimic Process

1. **Upload Source Image**: Click the left upload area and select a photo containing the clothing style you want to copy
2. **Upload Target Image**: Click the right upload area and select a photo of yourself
3. **Generate**: Click "Generate Clothing Mimic" to process the images
4. **Download**: Once generated, download your result image

### Settings

- Configure your OpenRouter API key
- Set image quality and processing preferences
- Test your API key connection

## How It Works

The application uses a comprehensive AI prompt that instructs the image generation model to:

- Analyze clothing, accessories, and styling from the source photo
- Apply the exact clothing style to the person in the target photo
- Preserve the target person's physical features, face, and pose
- Maintain natural lighting and proper clothing fit
- Generate photorealistic results with seamless integration

## API Provider

### OpenRouter

OpenRouter provides access to advanced image generation models including Gemini 2.5 Flash Image Preview:

- High-quality clothing style transfer
- Realistic fabric draping and fit
- Natural lighting adaptation
- Preserves target person's identity
- Get your API key: [OpenRouter Keys](https://openrouter.ai/keys)

## Technology Stack

- **Frontend**: Vue.js 3, Vite, Tailwind CSS
- **State Management**: Pinia
- **Routing**: Vue Router
- **Image Processing**: Canvas API, File API
- **AI Integration**: OpenRouter API with Gemini 2.5 Flash Image Preview

## Project Structure

```
src/
├── components/          # Reusable Vue components
├── views/              # Page components
│   ├── ClothingMimicView.vue    # Main clothing mimic interface
│   └── SettingsView.vue         # API key configuration
├── services/           # API services
│   └── openRouterService.js     # OpenRouter integration
├── stores/             # Pinia state management
├── utils/              # Image processing utilities
├── router/             # Vue Router configuration
└── assets/             # Static assets and styles
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Key Features

- **Simple Interface**: Clean, intuitive side-by-side upload design
- **Comprehensive AI Prompt**: Detailed instructions for accurate clothing transfer
- **Error Handling**: Clear error messages and validation
- **Progress Indicators**: Loading states and generation progress
- **Download Functionality**: Easy result image download

## Supported Image Formats

- PNG
- JPG/JPEG
- GIF
- Maximum file size: 10MB

## Tips for Best Results

1. **Source Image**: Use clear photos with visible clothing details
2. **Target Image**: Use well-lit photos with the person clearly visible
3. **Image Quality**: Higher resolution images generally produce better results
4. **Pose Similarity**: Similar poses between source and target work best
5. **Lighting**: Good lighting in both images improves transfer quality

## License

This project is licensed under the MIT License.

## Support

For support:

- Ensure your OpenRouter API key is properly configured in Settings
- Verify image formats are supported (PNG, JPG, GIF)
- Check that both source and target images are uploaded before generating
- Review error messages for specific guidance
