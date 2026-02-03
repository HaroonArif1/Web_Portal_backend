import { z } from 'zod';
import { config } from 'dotenv';
config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number),
  MONGO_URI: z.string().min(1),
  SESSION_SECRET: z.string().min(16),
  SENDGRID_API_KEY: z.string().min(10),
  SENDGRID_FROM_EMAIL: z.string(),

  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string(),

  DOTS_API_BASE_URL: z.url(),
  DOTS_API_KEY: z.string().min(10),
  DOTS_CLIENT_ID: z.string().min(10),
  DOTS_WEBHOOK_SECRET: z.string().min(10),

  ADMIN_EMAIL: z.email(),
  ADMIN_PASSWORD: z.string().min(5)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
