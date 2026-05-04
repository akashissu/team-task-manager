import mongoose from 'mongoose';

export async function connectDatabase() {
  // Railway / Atlas: set MONGODB_URI in the host dashboard. Some templates expose MONGO_URL instead.
  const uri = process.env.MONGODB_URI || process.env.MONGO_URL;
  if (!uri) {
    throw new Error(
      'Missing database URI: set MONGODB_URI (recommended) or MONGO_URL in your deployment environment. ' +
        'Docker images do not ship backend/.env — configure variables on Railway (or use backend/.env only for local dev).'
    );
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
}
