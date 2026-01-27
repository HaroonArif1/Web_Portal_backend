import { z } from 'zod';

export const createTransferSchema = z.object({
  body: z.object({
    email: z.email(),
    amount: z.string().refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, {
      message: 'Amount must be a positive number in string format'
    }),
    phone: z.string()
  })
});
