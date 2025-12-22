/* -------------------------------------------------------------------------- */
/*                           MongoDB singleton helper                          */
/* -------------------------------------------------------------------------- */

import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error(
    "❌ Missing MongoDB connection string. Set MONGODB_URI or DATABASE_URL."
  );
}

const mongoUri = MONGODB_URI as string;

/* ========================
   Global cache typing
======================== */

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined;
}

/**
 * Ensure cached is ALWAYS defined
 * 👉 this is the key fix
 */
const cached: MongooseCache =
  global._mongoose ?? (global._mongoose = { conn: null, promise: null });

/* ========================
   Connection helper
======================== */

export async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoUri, {
        bufferCommands: false,
      })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/* -------------------------------------------------------------------------- */
/*                        Convenience aliases / helpers                        */
/* -------------------------------------------------------------------------- */

export { dbConnect as connectDB };

/**
 * Close the cached connection — mostly for tests
 */
export async function dbDisconnect() {
  if (!cached.conn) return;

  await cached.conn.disconnect();
  cached.conn = null;
  cached.promise = null;
}
