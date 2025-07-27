import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Direct connection string
const MONGO_URI = 'mongodb://localhost:27017/codepulse';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

const setupAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'vibhav@example.com';
    const adminPassword = 'vibhav1234';

    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminUser = new User({
      name: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      isAdmin: true
    });
    await adminUser.save();
    console.log('Admin user created successfully');

    console.log('Admin setup completed');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up admin:', error);
    process.exit(1);
  }
};

setupAdmin();
