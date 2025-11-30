# Aether AI Platform

A comprehensive AI generation platform with admin management features and multiple AI model support.

## Features

- **User Management**: Register, login, and credit management
- **AI Model Management**: Support for multiple AI models with different capabilities
- **Generation Types**: Image and video generation from text or images
- **Admin Dashboard**: User management, credit allocation, and system configuration
- **Model Configuration**: Customizable AI models with different settings

## Architecture

### Admin Capabilities
- Add new users to the system
- Add credits to existing users
- Delete users from the system
- Add, edit, or delete AI models
- Set costs per generation for each model
- Configure video retention period (default 7 days)

### User Capabilities
- Select from available AI models
- Configure model-specific settings (duration, CFG scale)
- Generate images and videos from text prompts
- Generate videos from images (image-to-video)
- Download generated content

### AI Model Support
- **Kling v2.5 Pro**: Advanced image-to-video and text-to-video generation
- Configurable duration (1-10 seconds)
- Customizable CFG scale
- Model-specific costs

## API Integration

The platform integrates with the Freepik API using the provided API key:
- `FPSX4c1680c370101048308a7b2f9bf87721`

## File Structure

```
src/
├── types.ts              # TypeScript interfaces
├── constants.ts          # API keys and storage keys
├── modelConfig.ts        # Default AI model configurations
├── components/
│   └── UI.tsx            # Reusable UI components
├── services/
│   ├── mockBackend.ts    # Data management and model operations
│   └── freepikService.ts # API integration
├── pages/
│   ├── Generator.tsx     # Main generation interface
│   ├── Dashboard.tsx     # User dashboard
│   └── Admin.tsx         # Admin management interface
```

## AI Model Configuration

Each AI model has the following properties:
- `name`: Display name
- `description`: Model description
- `costPerGeneration`: Credit cost per generation
- `maxDuration`: Maximum video duration in seconds
- `supportsImageToVideo`: Whether the model supports image-to-video
- `supportsTextToVideo`: Whether the model supports text-to-video
- `defaultDuration`: Default video duration
- `defaultCfgScale`: Default CFG scale value
- `isActive`: Whether the model is active

## Video Generation Process

The platform supports two types of video generation:
1. **Text-to-Video**: Generate video from text prompt
2. **Image-to-Video**: Generate video from an image and text prompt

The video generation process includes:
1. API request to create generation task
2. Polling for task completion
3. Retrieving the final video URL
4. Storing the result in the user's history

## Development

To run the development server:

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

## Production Deployment

The application is designed for deployment to a VPS where:
- Generated content is stored temporarily
- Files are automatically deleted after the retention period
- API keys are securely managed