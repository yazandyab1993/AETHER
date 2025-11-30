const express = require('express');
const User = require('../models/User');
const AIModel = require('../models/AIModel');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user by ID
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add credits to user
router.put('/users/:id/credits', adminAuth, async (req, res) => {
  try {
    const { credits } = req.body;
    
    if (typeof credits !== 'number' || credits <= 0) {
      return res.status(400).json({ message: 'Credits must be a positive number' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.credits += credits;
    await user.save();
    
    res.json({
      message: `Credits added successfully. New balance: ${user.credits}`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        credits: user.credits
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user video storage days
router.put('/users/:id/storage', adminAuth, async (req, res) => {
  try {
    const { videoStorageDays } = req.body;
    
    if (typeof videoStorageDays !== 'number' || videoStorageDays <= 0) {
      return res.status(400).json({ message: 'Video storage days must be a positive number' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.videoStorageDays = videoStorageDays;
    await user.save();
    
    res.json({
      message: 'Video storage days updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        videoStorageDays: user.videoStorageDays
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all AI models
router.get('/models', adminAuth, async (req, res) => {
  try {
    const models = await AIModel.find({});
    res.json(models);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new AI model
router.post('/models', adminAuth, async (req, res) => {
  try {
    const {
      name,
      provider,
      type,
      description,
      costPerGeneration,
      maxVideoDuration,
      inputType,
      settings
    } = req.body;

    // Check if model already exists
    const existingModel = await AIModel.findOne({ name });
    if (existingModel) {
      return res.status(400).json({ message: 'Model with this name already exists' });
    }

    const model = new AIModel({
      name,
      provider: provider || 'Freepik',
      type,
      description,
      costPerGeneration,
      maxVideoDuration,
      inputType,
      settings
    });

    await model.save();

    res.status(201).json({
      message: 'AI model created successfully',
      model
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update AI model
router.put('/models/:id', adminAuth, async (req, res) => {
  try {
    const {
      name,
      provider,
      type,
      description,
      costPerGeneration,
      maxVideoDuration,
      inputType,
      settings,
      isActive
    } = req.body;

    const updateData = {
      name,
      provider,
      type,
      description,
      costPerGeneration,
      maxVideoDuration,
      inputType,
      settings,
      isActive
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const model = await AIModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }

    res.json({
      message: 'AI model updated successfully',
      model
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete AI model
router.delete('/models/:id', adminAuth, async (req, res) => {
  try {
    const model = await AIModel.findByIdAndDelete(req.params.id);
    
    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }
    
    res.json({ message: 'Model deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;