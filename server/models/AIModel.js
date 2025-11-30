const mongoose = require('mongoose');

const aiModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  provider: {
    type: String,
    required: true,
    default: 'Freepik'
  },
  type: {
    type: String,
    enum: ['image-to-video', 'text-to-image', 'text-to-video'],
    required: true
  },
  description: {
    type: String
  },
  costPerGeneration: {
    type: Number,
    required: true,
    default: 1
  },
  maxVideoDuration: {
    type: Number, // In seconds, for video models
    min: 1,
    max: 60
  },
  inputType: {
    type: String,
    enum: ['text', 'image', 'both'],
    required: true
  },
  settings: {
    // Additional settings specific to each model
    videoStorageDays: {
      type: Number,
      default: 7
    },
    supportedResolutions: [{
      width: Number,
      height: Number
    }],
    maxFileSize: {
      type: Number, // in MB
      default: 10
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

aiModelSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AIModel', aiModelSchema);