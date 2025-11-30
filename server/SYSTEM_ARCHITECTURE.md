# System Architecture: AI Content Generator Platform

## Overview

This system implements a comprehensive AI content generation platform with a clear separation between administrative functions and user generation capabilities. The admin manages users and models while users consume AI services through the Freepik API.

## Core Components

### 1. User Management System
- **Admin Functions**: Register new users, add/remove credits, delete users
- **User Profiles**: Store credit balances, video storage duration preferences
- **Authentication**: JWT-based authentication with role-based access control

### 2. AI Model Management System
- **Model Configuration**: Name, type (image-to-video, text-to-image), cost, settings
- **Provider Integration**: Currently configured for Freepik API
- **Dynamic Pricing**: Each model has configurable cost per generation
- **Feature Settings**: Video duration limits, input type requirements, storage duration

### 3. Generation Processing System
- **Freepik API Integration**: Uses specified API endpoints for content generation
- **Credit Validation**: Ensures users have sufficient credits before processing
- **Task Management**: Handles asynchronous generation with status polling
- **Input Validation**: Ensures proper input types for each model

## Implemented AI Models

### Kling v2.5 Pro (Image-to-Video)
- **Type**: image-to-video
- **API Endpoint**: https://api.freepik.com/v1/ai/image-to-video
- **Input**: Image URL + Text prompt
- **Max Duration**: 10 seconds
- **Cost**: 5 credits per generation
- **Function**: Converts static images to short video clips

### Flux pro 1.1 (Text-to-Image)
- **Type**: text-to-image
- **API Endpoint**: https://api.freepik.com/v1/ai/text-to-image
- **Input**: Text prompt only
- **Cost**: 3 credits per generation
- **Function**: Generates images from text descriptions

## API Structure

### Admin Endpoints (`/api/admin/*`)
- User management: `/users` (GET, POST, PUT, DELETE)
- Model management: `/models` (GET, POST, PUT, DELETE)
- Credit management: `/users/:id/credits`
- Storage settings: `/users/:id/storage`

### User Endpoints (`/api/user/*`)
- Model listing: `/models`
- Generation: `/generate` (POST for new, GET for status)
- Credit checking: `/credits`

### Model Endpoints (`/api/models/*`)
- Model listing: `/` (GET active models)
- Model details: `/:id` (GET specific model)

## Security & Access Control

- **Admin Only**: User registration, credit management, model management
- **Authenticated Users**: Generation requests, model access
- **JWT Authentication**: All endpoints require valid tokens
- **Rate Limiting**: Prevents API abuse

## Configuration

### Default Settings
- **Video Storage Duration**: 7 days (configurable per user)
- **Freepik API Key**: FPSX4c1680c370101048308a7b2f9bf87721
- **Default Admin**: Username: admin, Password: admin123 (change immediately!)

### Environment Variables
- `FREEPIK_API_KEY`: Set to the provided API key
- `JWT_SECRET`: Secret for token generation
- `MONGODB_URI`: Database connection string
- `DEFAULT_ADMIN_PASSWORD`: Initial admin password

## Administrative Capabilities

The admin user has complete control over:
1. **User Lifecycle Management**:
   - Create new users
   - Allocate credits to users
   - Delete users
   - Modify individual video storage duration

2. **AI Model Management**:
   - Add new AI models (with cost, type, settings)
   - Modify existing model parameters
   - Adjust costs for each model
   - Activate/deactivate models
   - Configure model-specific settings

3. **System Configuration**:
   - Set default video storage duration (7 days)
   - Configure model-specific parameters
   - Manage generation costs

## User Experience

Regular users can:
1. Authenticate with their credentials
2. View available AI models
3. Check their credit balance
4. Submit generation requests
5. Track generation status
6. Access generated content

## Technical Implementation

- **Backend**: Node.js with Express framework
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **API Integration**: Axios for HTTP requests to Freepik
- **Security**: Bcrypt for password hashing, CORS for security
- **Rate Limiting**: Express-rate-limit middleware

## Setup Instructions

1. Install Node.js dependencies: `npm install`
2. Set up MongoDB connection
3. Run initialization scripts:
   - `node scripts/init-models.js` - Create default AI models
   - `node scripts/init-admin.js` - Create admin user
4. Start the server: `node server.js`
5. Access API endpoints at `http://localhost:5000/api/*`

## Key Improvements Over Original Design

1. **Clear Role Separation**: Admins handle management, users handle generation
2. **Structured Data Models**: Proper Mongoose schemas for users and AI models
3. **Configurable Models**: Dynamic model settings instead of hardcoded endpoints
4. **Credit System**: Proper economic model for resource consumption
5. **Comprehensive API**: Well-organized endpoints with proper authentication
6. **Scalable Architecture**: Easy to add new AI models and features

This architecture provides a solid foundation for an AI content generation platform with proper administrative controls and user management.