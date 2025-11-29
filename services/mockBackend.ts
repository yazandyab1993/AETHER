import { User, GenerationRequest, AppConfig, RequestStatus, MediaType, UserRole } from '../types';
import { STORAGE_KEY_USERS, STORAGE_KEY_REQUESTS, STORAGE_KEY_CONFIG, DEFAULT_ADMIN_USER, DEFAULT_USER } from '../constants';

// --- Helpers ---

export const getFromStorage = <T,>(key: string, defaultVal: T): T => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultVal;
};

const saveToStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
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

export const createRequest = (userId: string, prompt: string, type: MediaType): GenerationRequest => {
  const config = getConfig();
  const now = new Date();
  const expiresAt = new Date();
  expiresAt.setDate(now.getDate() + config.retentionDays);

  const req: GenerationRequest = {
    id: crypto.randomUUID(),
    userId,
    prompt,
    type,
    status: RequestStatus.PENDING,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    localPath: `/var/www/project/storage/outputs/${crypto.randomUUID()}.${type === MediaType.IMAGE ? 'png' : 'mp4'}`
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