import { z } from 'zod';

export const transferActionSchema = z.object({
  params: z.object({
    _id: z.string()
  })
});

export const pendingTransfersQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    email: z.string().email().optional(),
    assetType: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional()
  })
});

export const adminUsersListSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    role: z.enum(['admin'])
  })
});
