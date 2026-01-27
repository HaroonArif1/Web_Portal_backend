import { z } from 'zod';

export const adminLoginSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(5)
  })
});
