// ========================================
// DATABASE CONNECTION
// ========================================

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/servicio_social';
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected successfully');
    
    // Create default admin user if it doesn't exist
    await createDefaultAdmin();
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('ℹ️  Please ensure MongoDB is running');
    // Don't exit process in development to allow for recovery
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

const createDefaultAdmin = async () => {
  try {
    const User = require('../models/User.model');
    const bcrypt = require('bcryptjs');
    
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@leyajad.com';
    const adminExists = await User.findOne({ email: adminEmail });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(
        process.env.DEFAULT_ADMIN_PASSWORD || 'ChangeThisPassword123!', 
        10
      );
      
      await User.create({
        email: adminEmail,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'super_admin',
        status: 'active'
      });
      
      console.log('✅ Default admin user created');
      console.log(`   Email: ${adminEmail}`);
      console.log('   ⚠️  Please change the password immediately!');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

module.exports = connectDB;
