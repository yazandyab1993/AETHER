// In a real app, this key should be in process.env on the backend
// Since this is a demo running in browser, we keep it here (insecure for prod)
export const FREEPIK_API_KEY = "FPSX4c1680c370101048308a7b2f9bf87721";

export const STORAGE_KEY_USERS = "aether_users";
export const STORAGE_KEY_REQUESTS = "aether_requests";
export const STORAGE_KEY_CONFIG = "aether_config";
export const STORAGE_KEY_CURRENT_USER = "aether_current_user";
export const STORAGE_KEY_MODELS = "aether_models";

// Mock Data Initializer
export const DEFAULT_ADMIN_USER = {
  id: 'admin-1',
  email: 'admin@example.com',
  password: 'admin',
  role: 'ADMIN',
  credits: 99999,
  createdAt: new Date().toISOString()
};

export const DEFAULT_USER = {
  id: 'user-1',
  email: 'user@example.com',
  password: 'password',
  role: 'USER',
  credits: 10,
  createdAt: new Date().toISOString()
};