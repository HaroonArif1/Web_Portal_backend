import { dotsClient } from '../integrations/dots.client.mjs';

export const executeDotsTransfer = async ({
  amount,
  destinationUserId,
  idempotencyKey
}) => {
  const response = await dotsClient.post(
    '/transfers',
    {
      amount,
      // currency,
      user_id: destinationUserId,
      // memo: 'Approved customer transfer'
    },
    {
      headers: {
        'Idempotency-Key': idempotencyKey
      }
    }
  );

  return response.data;
};
