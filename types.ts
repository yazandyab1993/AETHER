export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum RequestStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED'
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  credits: number;
  createdAt: string;
  password?: string;
}

export interface GenerationRequest {
  id: string;
  userId: string;
  prompt: string;
  type: MediaType;
  status: RequestStatus;
  outputUrl?: string; // Simulated file path
  createdAt: string;
  expiresAt: string;
  localPath?: string; // e.g., /var/www/project/storage/...
}

export interface AppConfig {
  retentionDays: number;
  costPerImage: number;
  costPerVideo: number;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  costPerGeneration: number;
  maxDuration: number;
  supportsImageToVideo: boolean;
  supportsTextToVideo: boolean;
  defaultDuration: number;
  defaultCfgScale: number;
  isActive: boolean;
}

export interface GenerationRequest {
  id: string;
  userId: string;
  prompt: string;
  type: MediaType;
  status: RequestStatus;
  outputUrl?: string;
  createdAt: string;
  expiresAt: string;
  localPath?: string;
  modelId: string; // Add model ID to track which model was used
  duration?: number; // Video duration if applicable
  cfgScale?: number; // Configuration scale if applicable
  sourceImage?: string; // URL of source image if image-to-video
}