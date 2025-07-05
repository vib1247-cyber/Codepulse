import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://vibs_cyber:Vibhav1243@cluster0.yowo6hu.mongodb.net/codepulse?retryWrites=true&w=majority';

async function updateUserPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get the User model
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: { type: String, unique: true },
      password: String,
      isAdmin: { type: Boolean, default: false }
    }));

    // Find the test user
    const user = await User.findOne({ email: 'test@example.com' });
    
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }

    // Update password
    const hashedPassword = await bcrypt.hash('password123', 10);
    user.password = hashedPassword;
    await user.save();

    console.log('✅ Password updated successfully');
  } catch (error) {
    console.error('❌ Error updating password:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateUserPassword();
