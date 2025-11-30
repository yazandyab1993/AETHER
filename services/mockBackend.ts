import { User, GenerationRequest, AppConfig, RequestStatus, MediaType, UserRole, AIModel } from '../types';
import { STORAGE_KEY_USERS, STORAGE_KEY_REQUESTS, STORAGE_KEY_CONFIG, STORAGE_KEY_CURRENT_USER, STORAGE_KEY_MODELS, DEFAULT_ADMIN_USER, DEFAULT_USER } from '../constants';
import { DEFAULT_MODELS } from '../modelConfig';

// --- Helpers ---

export const getFromStorage = <T,>(key: string, defaultVal: T): T => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultVal;
};

const saveToStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Safe UUID generator that works in non-secure contexts (HTTP)
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for insecure contexts (e.g. HTTP IP address)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// --- Config ---

export const getConfig = (): AppConfig => {
  return getFromStorage<AppConfig>(STORAGE_KEY_CONFIG, {
    retentionDays: 7,
    costPerImage: 1,
    costPerVideo: 5
  });
};

export const updateConfig = (newConfig: AppConfig) => {
  saveToStorage(STORAGE_KEY_CONFIG, newConfig);
};

// --- AI Model Management ---

export const getModels = (): AIModel[] => {
  let models = getFromStorage<AIModel[]>(STORAGE_KEY_MODELS, []);
  if (models.length === 0) {
    // Seed initial models
    models = DEFAULT_MODELS;
    saveToStorage(STORAGE_KEY_MODELS, models);
  }
  return models;
};

export const createModel = (model: Omit<AIModel, 'id'>): AIModel => {
  const models = getModels();
  const newModel: AIModel = {
    ...model,
    id: generateId()
  };
  models.push(newModel);
  saveToStorage(STORAGE_KEY_MODELS, models);
  return newModel;
};

export const updateModel = (modelId: string, updates: Partial<AIModel>) => {
  const models = getModels();
  const updated = models.map(model => 
    model.id === modelId ? { ...model, ...updates } : model
  );
  saveToStorage(STORAGE_KEY_MODELS, updated);
};

export const deleteModel = (modelId: string) => {
  const models = getModels();
  const updated = models.filter(model => model.id !== modelId);
  saveToStorage(STORAGE_KEY_MODELS, updated);
};

// --- Retention Logic (Cron Job Simulation) ---

export const runRetentionPolicy = () => {
  const requests = getFromStorage<GenerationRequest[]>(STORAGE_KEY_REQUESTS, []);
  const now = new Date();
  
  let changed = false;
  const updatedRequests = requests.map(req => {
    if (req.status === RequestStatus.COMPLETED && new Date(req.expiresAt) < now) {
      // "Delete" the file
      console.log(`[System] Deleting expired file: ${req.localPath}`);
      changed = true;
      return { ...req, status: RequestStatus.EXPIRED, outputUrl: undefined };
    }
    return req;
  });

  if (changed) {
    saveToStorage(STORAGE_KEY_REQUESTS, updatedRequests);
  }
};

// --- User Logic ---

export const getUsers = (): User[] => {
  let users = getFromStorage<any[]>(STORAGE_KEY_USERS, []);
  if (users.length === 0) {
    // Seed initial users
    users = [DEFAULT_ADMIN_USER, DEFAULT_USER];
    saveToStorage(STORAGE_KEY_USERS, users);
  }
  return users;
};

export const updateUserCredits = (userId: string, amount: number) => {
  const users = getUsers();
  const updated = users.map(u => u.id === userId ? { ...u, credits: amount } : u);
  saveToStorage(STORAGE_KEY_USERS, updated);
};

export const deductCredits = (userId: string, cost: number): boolean => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user || user.credits < cost) return false;
  
  user.credits -= cost;
  saveToStorage(STORAGE_KEY_USERS, users);
  return true;
};

// --- Request Logic ---

export const getRequests = (userId?: string): GenerationRequest[] => {
  runRetentionPolicy(); // Always check expiration on fetch
  const requests = getFromStorage<GenerationRequest[]>(STORAGE_KEY_REQUESTS, []);
  if (userId) {
    return requests.filter(r => r.userId === userId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return requests.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const createRequest = (userId: string, prompt: string, type: MediaType, modelId: string, duration?: number, cfgScale?: number, sourceImage?: string): GenerationRequest => {
  const config = getConfig();
  const now = new Date();
  const expiresAt = new Date();
  expiresAt.setDate(now.getDate() + config.retentionDays);

  const req: GenerationRequest = {
    id: generateId(),
    userId,
    prompt,
    type,
    modelId, // Add the model ID
    duration, // Add duration if provided
    cfgScale, // Add cfgScale if provided
    sourceImage, // Add source image if provided
    status: RequestStatus.PENDING,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    localPath: `/var/www/project/storage/outputs/${generateId()}.${type === MediaType.IMAGE ? 'png' : 'mp4'}`
  };

  const requests = getFromStorage<GenerationRequest[]>(STORAGE_KEY_REQUESTS, []);
  requests.push(req);
  saveToStorage(STORAGE_KEY_REQUESTS, requests);
  return req;
};

export const updateRequestStatus = (id: string, status: RequestStatus, url?: string) => {
  const requests = getFromStorage<GenerationRequest[]>(STORAGE_KEY_REQUESTS, []);
  const updated = requests.map(r => r.id === id ? { ...r, status, outputUrl: url } : r);
  saveToStorage(STORAGE_KEY_REQUESTS, updated);
};