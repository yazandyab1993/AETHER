require('dotenv').config();
const mongoose = require('mongoose');
const AIModel = require('../models/AIModel');

async function initializeModels() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-content-generator', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if models already exist
    const existingModels = await AIModel.find({});
    
    if (existingModels.length > 0) {
      console.log('Models already exist in database. Skipping initialization.');
      await mongoose.connection.close();
      return;
    }

    // Create Kling v2.5 Pro model (image-to-video)
    const klingModel = new AIModel({
      name: 'Kling v2.5 Pro',
      provider: 'Freepik',
      type: 'image-to-video',
      description: 'Advanced image-to-video generation model from Freepik',
      costPerGeneration: 5, // Cost in credits
      maxVideoDuration: 10, // Maximum 10 seconds
      inputType: 'image', // Requires an image input
      settings: {
        videoStorageDays: 7, // Default video storage duration
        supportedResolutions: [
          { width: 1920, height: 1080 }, // 1080p
          { width: 1280, height: 720 },  // 720p
        ],
        maxFileSize: 10 // 10MB max file size for input images
      },
      isActive: true
    });

    // Create Flux Pro 1.1 model (text-to-image)
    const fluxModel = new AIModel({
      name: 'Flux pro 1.1',
      provider: 'Freepik',
      type: 'text-to-image',
      description: 'High-quality text-to-image generation model from Freepik',
      costPerGeneration: 3, // Cost in credits
      maxVideoDuration: null, // Not applicable for image model
      inputType: 'text', // Text input only
      settings: {
        videoStorageDays: 7, // Default storage (though not applicable for images)
        supportedResolutions: [
          { width: 1024, height: 1024 },
          { width: 512, height: 512 },
        ],
        maxFileSize: 10 // 10MB max (though not applicable for text input)
      },
      isActive: true
    });

    // Save both models to database
    await klingModel.save();
    await fluxModel.save();

    console.log('Default AI models created successfully:');
    console.log(`- ${klingModel.name}`);
    console.log(`- ${fluxModel.name}`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error initializing models:', error);
    process.exit(1);
  }
}

initializeModels();