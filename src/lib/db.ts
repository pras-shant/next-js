import mongoose from 'mongoose';
import DockerImage from '@/models/DockerImage'; 
import User from '@/models/user';
export const connectDB = async (): Promise<void> => {
  console.log('Attempting to connect to MongoDB');

  const uri = process.env.NEXT_MONGODB_URI || '';
  console.log(uri, 'uri');

  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }

  try {
    await mongoose.connect(uri);

    console.log('MongoDB connected successfully');

    // Initialize DockerImage collection by ensuring the model exists
    await DockerImage.init();
    await User.init();
    console.log('DockerImage collection initialized');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw new Error('Failed to connect to MongoDB');
  }
};
