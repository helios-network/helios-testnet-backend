import mongoose from 'mongoose';
import config from './index';

// Remove strict query to avoid deprecation warning
mongoose.set('strictQuery', false);

export const connect = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export const disconnect = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log('MongoDB disconnected');
};