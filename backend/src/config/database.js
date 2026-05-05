import mongoose from 'mongoose';

/**
 * Resolve Mongo connection string from common env names (Railway / Atlas / templates vary).
 * Set **one** of these on the **same Railway service** that runs `node backend/src/server.js`.
 */
function resolveMongoUri() {
  return (
    process.env.MONGODB_URI ||
    process.env.MONGO_URL ||
    process.env.DATABASE_URL ||
    process.env.MONGO_PUBLIC_URL ||
    process.env.MONGO_PRIVATE_URL ||
    process.env.MONGODB_URL ||
    ''
  ).trim();
}

function uriTargetsLoopback(uri) {
  // Typical local dev URIs — inside Docker/Railway, "localhost" is the app container, not your laptop's Mongo.
  return (
    /:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(uri) ||
    /@(localhost|127\.0\.0\.1)(:|\/|$)/i.test(uri) ||
    /mongodb(\+srv)?:\/\/(localhost|127\.0\.0\.1)/i.test(uri)
  );
}

export async function connectDatabase() {
  const uri = resolveMongoUri();
  if (!uri) {
    throw new Error(
      'No MongoDB URI in environment. On Railway: open the **Node/web service** (the one running this app) → ' +
        '**Variables** → add `MONGODB_URI` = your full connection string (or reference the variable from your Mongo service). ' +
        'Checked env keys: MONGODB_URI, MONGO_URL, DATABASE_URL, MONGO_PUBLIC_URL, MONGO_PRIVATE_URL, MONGODB_URL. ' +
        '`backend/.env` is not used inside Docker — it must be set in the dashboard.'
    );
  }
  const isProdLike =
    process.env.NODE_ENV === 'production' || Boolean(process.env.RAILWAY_ENVIRONMENT);
  if (isProdLike && uriTargetsLoopback(uri)) {
    throw new Error(
      'MONGODB_URI points at localhost / 127.0.0.1. That only works on your laptop. ' +
        'On Railway, use **MongoDB Atlas** (`mongodb+srv://...`) or paste the **private/public connection URL** from your Railway Mongo service — not `mongodb://127.0.0.1:27017/...`.'
    );
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
}
