import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export const {
  PORT,
  NODE_ENV,
  ARCJET_KEY,
  ARCJET_ENV,
  SUPABASE_SERVICE_ROLE_KEY,
  CLIENT_URL,
  SB_URL
} = process.env;

console.log(CLIENT_URL, SB_URL)