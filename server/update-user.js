const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });
const User = require('./models/User');

async function updateUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('vibhav1234', 10);
    
    const result = await User.updateOne(
      { email: 'vibhav@example.com' },
      { 
        $set: { 
          name: 'Vibhav',
          email: 'vibhav@example.com',
          password: hashedPassword,
          isAdmin: true
        } 
      },
      { upsert: true }
    );

    console.log('✅ User updated successfully:', result);
    console.log('\nTry logging in with:');
    console.log('Email: vibhav@example.com');
    console.log('Password: vibhav1234\n');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

updateUser();
