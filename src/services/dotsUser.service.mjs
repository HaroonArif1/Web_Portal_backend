import { dotsClient } from '../integrations/dots.client.mjs';
import { logger } from '../utils/logger.mjs';

/**
 * Ensure user exists on Dots and return dotsUserId
 */
export const ensureDotsUser = async (user) => {
  // Already created
  if (user.dotsUserId) {
    return user.dotsUserId;
  }

  // const idempotencyKey = `dots-user-${user._id}`;
  console.log({user});
  
  // Create user on Dots
  const response = await dotsClient.post('/users', {
    first_name: 'Jane',
    last_name: 'Doe',
    email: user.email_address,
    phone_number: user.phone,
    country_code: "1",
    metadata: {
      internalUserId: user._id.toString()
    }
  });
  console.log({dotResponse: response});
  
  const dotsUserId = response?.data?.id;

  if (!dotsUserId) {
    throw new Error('Failed to create Dots user');
  }

  // Save mapping
  user.dotsUserId = dotsUserId;
  // await user.save();

  logger.info('Dots user created', {
    userId: user._id,
    dotsUserId
  });

  return dotsUserId;
};
