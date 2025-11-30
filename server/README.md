# AI Content Generator Server

A comprehensive server application for managing AI-powered image and video generation with admin controls and user management.

## Features

- **Admin Management**: Admin users can register new users, add credits, delete users, and manage AI models
- **AI Model Management**: Support for multiple AI models with configurable settings
- **Credit System**: Users consume credits for generation tasks
- **Freepik API Integration**: Uses Freepik's AI models for content generation
- **User Authentication**: JWT-based authentication system

## Supported AI Models

1. **Kling v2.5 Pro** (Image-to-Video)
   - Type: image-to-video
   - Input: Image URL + Text prompt
   - Max Duration: 10 seconds
   - Cost: 5 credits per generation

2. **Flux pro 1.1** (Text-to-Image)
   - Type: text-to-image
   - Input: Text prompt only
   - Cost: 3 credits per generation

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Admin-only user registration
- `GET /api/auth/me` - Get current user info

### Admin Functions
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get specific user
- `PUT /api/admin/users/:id/credits` - Add credits to user
- `PUT /api/admin/users/:id/storage` - Update video storage days
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/models` - Get all AI models
- `POST /api/admin/models` - Create new AI model
- `PUT /api/admin/models/:id` - Update AI model
- `DELETE /api/admin/models/:id` - Delete AI model

### User Functions
- `GET /api/user/models` - Get available models
- `POST /api/user/generate` - Generate content
- `GET /api/user/generate/:taskId` - Check generation status
- `GET /api/user/credits` - Get credit balance

### Model Functions
- `GET /api/models` - Get active models
- `GET /api/models/:id` - Get specific model

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env` file

3. Initialize default models:
```bash
node scripts/init-models.js
```

4. Initialize admin user:
```bash
node scripts/init-admin.js
```

5. Start the server:
```bash
npm start
# or for development
npm run dev
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `JWT_SECRET` - Secret key for JWT tokens
- `MONGODB_URI` - MongoDB connection string
- `FREEPIK_API_KEY` - Freepik API key
- `DEFAULT_ADMIN_PASSWORD` - Initial admin password

## Admin Functions

The admin user has the following capabilities:

1. **User Management**:
   - Register new users
   - Add credits to existing users
   - Delete users
   - Modify user video storage duration

2. **Model Management**:
   - Add new AI models
   - Modify existing models (name, cost, settings)
   - Delete models
   - Activate/deactivate models

3. **System Configuration**:
   - Set default video storage duration per user (default: 7 days)
   - Configure model-specific settings
   - Set costs per generation for each model

## Usage Flow

1. Admin creates users and allocates credits
2. Users authenticate and select an AI model
3. Users provide input (text or image) and parameters
4. System validates credits and processes request via Freepik API
5. Users can check generation status and access results