import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export const {
  PORT,
  NODE_ENV,
  MONGO_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  ARCJET_KEY,
  ARCJET_ENV,
  GOOGLE_CLIENT_ID,
  APPLE_BUNDLE_ID,
  GOOGLE_CLIENT_WEB_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  CLIENT_URL
} = process.env;
