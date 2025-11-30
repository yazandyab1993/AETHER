require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function initializeAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-content-generator', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists. Skipping initialization.');
      await mongoose.connection.close();
      return;
    }

    // Create default admin user
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      credits: 0, // Admin doesn't need credits for generating content
      videoStorageDays: 7 // Default video storage duration
    });

    await adminUser.save();

    console.log('Admin user created successfully:');
    console.log(`- Username: ${adminUser.username}`);
    console.log(`- Email: ${adminUser.email}`);
    console.log(`- Password: ${adminPassword} (change this immediately in production!)`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error initializing admin:', error);
    process.exit(1);
  }
}

initializeAdmin();