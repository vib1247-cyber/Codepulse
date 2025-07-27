const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

// Dynamically import the User model
async function loadUserModel() {
  const module = await import('./server/models/User.js');
  return module.default;
}

async function checkAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Load User model
    const User = await loadUserModel();
    const admin = await User.findOne({ email: 'vibhav@example.com' })
      .select('name email isAdmin role')
      .lean();

    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('\n🔍 Admin User Details:');
    console.log('---------------------');
    console.log(`Name: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(`isAdmin: ${admin.isAdmin}`);
    console.log(`Role: ${admin.role}`);
    
    // Check JWT token generation
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        id: admin._id,
        email: admin.email,
        isAdmin: admin.isAdmin,
        role: admin.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    console.log('\n🔑 JWT Token Payload:');
    console.log('-------------------');
    console.log(JSON.stringify(jwt.verify(token, process.env.JWT_SECRET), null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('\nPlease run this script from the project root directory');
      console.log('and make sure to install dependencies first:');
      console.log('1. cd /path/to/codepulse');
      console.log('2. npm install');
      console.log('3. node checkAdmin.js');
    }
  } finally {
    mongoose.connection.close();
  }
}

checkAdmin();
