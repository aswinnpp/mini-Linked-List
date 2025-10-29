import mongoose from 'mongoose';

export async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mini_linkedin';
  mongoose.set('strictQuery', false);
  await mongoose.connect(mongoUri, {
    autoIndex: true
  });
  console.log('Connected to MongoDB');
}


