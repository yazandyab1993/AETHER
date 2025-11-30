const express = require('express');
const AIModel = require('../models/AIModel');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all active models
router.get('/', auth, async (req, res) => {
  try {
    const models = await AIModel.find({ isActive: true });
    res.json(models);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get model by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const model = await AIModel.findById(req.params.id);
    
    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }
    
    if (!model.isActive) {
      return res.status(404).json({ message: 'Model not available' });
    }
    
    res.json(model);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;