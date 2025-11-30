import { AIModel } from './types';

// Default model configuration for the application
export const DEFAULT_MODELS: AIModel[] = [
  {
    id: 'kling-v2-5-pro',
    name: 'Kling v2.5 Pro',
    description: 'Advanced AI model for image-to-video and text-to-video generation',
    costPerGeneration: 5,
    maxDuration: 10,
    supportsImageToVideo: true,
    supportsTextToVideo: true,
    defaultDuration: 5,
    defaultCfgScale: 0.5,
    isActive: true
  }
];