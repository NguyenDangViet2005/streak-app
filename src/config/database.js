import mongoose from 'mongoose';
import { env } from './env.js';

export const databaseOptions = Object.freeze({ serverSelectionTimeoutMS: 8000 });

export function connectDatabase(uri = env.mongodbUri) {
  return mongoose.connect(uri, { ...databaseOptions });
}

export function disconnectDatabase() {
  return mongoose.disconnect();
}
