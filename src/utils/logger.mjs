import { env } from '../config/env.mjs';

const isProd = env.NODE_ENV === 'production';

export const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      ...meta,
      timestamp: new Date().toISOString()
    }));
  },

  error: (message, meta = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      ...meta,
      timestamp: new Date().toISOString()
    }));
  },

  warn: (message, meta = {}) => {
    console.warn(JSON.stringify({
      level: 'warn',
      message,
      ...meta,
      timestamp: new Date().toISOString()
    }));
  }
};
