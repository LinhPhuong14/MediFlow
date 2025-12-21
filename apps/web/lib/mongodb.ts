/* -------------------------------------------------------------------------- */
/*                           MongoDB singleton helper                         */
/* -------------------------------------------------------------------------- */

import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || ""

if (!MONGODB_URI) {
  throw new Error("❌  Missing MongoDB connection string. Set MONGODB_URI or DATABASE_URL.")
}

/**
 * We cache the connection across hot-reloads in dev (and across
 * lambda invocations in production) so we don’t create new
 * connections on every function call.
 */
declare global {
  // eslint-disable-next-line no-var
  var _mongoose:
    | {
        conn: typeof mongoose | null
        promise: Promise<typeof mongoose> | null
      }
    | undefined
}

let cached = global._mongoose

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null }
}

/**
 * Get (or create) a stable Mongoose connection.
 */
export async function dbConnect() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        // feel free to tweak pool / timeout options
      })
      .then((m) => m)
  }

  cached.conn = await cached.promise
  return cached.conn
}

/* -------------------------------------------------------------------------- */
/*                        Convenience aliases / helpers                       */
/* -------------------------------------------------------------------------- */

export { dbConnect as connectDB }

/** Close the cached connection — rarely needed outside tests. */
export async function dbDisconnect() {
  if (!cached?.conn) return
  await cached.conn.disconnect()
  cached.conn = null
  cached.promise = null
}