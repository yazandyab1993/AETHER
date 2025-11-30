const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const AIModel = require('../models/AIModel');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's available models
router.get('/models', auth, async (req, res) => {
  try {
    const models = await AIModel.find({ isActive: true });
    res.json(models);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate content using Freepik API
router.post('/generate', auth, async (req, res) => {
  try {
    const { modelId, prompt, imageUrl, videoDuration } = req.body;

    // Validate required fields
    if (!modelId || !prompt) {
      return res.status(400).json({ message: 'Model ID and prompt are required' });
    }

    // Get user and model
    const user = await User.findById(req.userId);
    const model = await AIModel.findById(modelId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }

    // Check if user has enough credits
    if (user.credits < model.costPerGeneration) {
      return res.status(400).json({ message: 'Insufficient credits' });
    }

    // Check if model is active
    if (!model.isActive) {
      return res.status(400).json({ message: 'Model is not available' });
    }

    // Check input type compatibility
    if (model.inputType === 'image' && !imageUrl) {
      return res.status(400).json({ message: 'Image URL is required for this model' });
    }

    if (model.inputType === 'text' && imageUrl) {
      return res.status(400).json({ message: 'This model only accepts text input' });
    }

    // Check video duration if specified
    if (videoDuration && model.maxVideoDuration && videoDuration > model.maxVideoDuration) {
      return res.status(400).json({ 
        message: `Video duration exceeds maximum allowed (${model.maxVideoDuration} seconds)` 
      });
    }

    // Deduct credits from user
    user.credits -= model.costPerGeneration;
    await user.save();

    // Prepare Freepik API request
    const freepikApiKey = process.env.FREEPIK_API_KEY || 'FPSX4c1680c370101048308a7b2f9bf87721';
    let response;

    try {
      if (model.type === 'text-to-image') {
        // Flux Pro 1.1 API call for text-to-image
        response = await axios.post('https://api.freepik.com/v1/ai/text-to-image', {
          prompt: prompt,
          negative_prompt: "",
          width: 1024,
          height: 1024,
          cfg_scale: 7,
          samples: 1,
          steps: 30,
          seed: Math.floor(Math.random() * 1000000)
        }, {
          headers: {
            'Content-Type': 'application/json',
            'X-Freepik-API-Key': freepikApiKey,
            'Accept': 'application/json'
          }
        });
      } else if (model.type === 'image-to-video' || model.type === 'text-to-video') {
        // Kling v2.5 Pro API call for image-to-video or text-to-video
        let requestData = {
          prompt: prompt,
          aspect_ratio: "16:9"
        };

        if (model.type === 'image-to-video' && imageUrl) {
          requestData.image_url = imageUrl;
        }

        if (videoDuration) {
          requestData.duration = Math.min(videoDuration, model.maxVideoDuration || 10);
        }

        response = await axios.post('https://api.freepik.com/v1/ai/image-to-video', {
          ...requestData
        }, {
          headers: {
            'Content-Type': 'application/json',
            'X-Freepik-API-Key': freepikApiKey,
            'Accept': 'application/json'
          }
        });
      } else {
        return res.status(400).json({ message: 'Unsupported model type' });
      }

      // Return task ID for polling status
      res.json({
        taskId: response.data.task_id,
        status: 'processing',
        message: 'Generation started successfully',
        creditsRemaining: user.credits
      });
    } catch (apiError) {
      // Restore credits if API call fails
      user.credits += model.costPerGeneration;
      await user.save();

      console.error('Freepik API Error:', apiError.response?.data || apiError.message);
      res.status(500).json({ 
        message: 'Error generating content with Freepik API', 
        error: apiError.response?.data || apiError.message 
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check generation status
router.get('/generate/:taskId', auth, async (req, res) => {
  try {
    const { taskId } = req.params;

    // Check generation status with Freepik API
    const freepikApiKey = process.env.FREEPIK_API_KEY || 'FPSX4c1680c370101048308a7b2f9bf87721';

    try {
      const response = await axios.get(`https://api.freepik.com/v1/ai/task/${taskId}`, {
        headers: {
          'X-Freepik-API-Key': freepikApiKey,
          'Accept': 'application/json'
        }
      });

      res.json(response.data);
    } catch (apiError) {
      console.error('Freepik API Status Check Error:', apiError.response?.data || apiError.message);
      res.status(500).json({ 
        message: 'Error checking generation status', 
        error: apiError.response?.data || apiError.message 
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's credit balance
router.get('/credits', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('credits');
    res.json({ credits: user.credits });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;