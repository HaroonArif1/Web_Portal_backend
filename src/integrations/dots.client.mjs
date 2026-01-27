import axios from 'axios';
import { env } from '../config/env.mjs';

const authToken = Buffer.from(
  `${env.DOTS_CLIENT_ID}:${env.DOTS_API_KEY}`
).toString('base64');

export const dotsClient = axios.create({
  baseURL: env.DOTS_API_BASE_URL, // e.g. https://api.dots.dev/v2
  headers: {
    Authorization: `Basic ${authToken}`,
    'Content-Type': 'application/json'
  },
  // timeout: 15000
});

// Keep this while integrating
dotsClient.interceptors.response.use(
  res => res,
  err => {
    console.error('DOTS API ERROR:', {
      url: err.config?.baseURL + err.config?.url,
      method: err.config?.method,
      status: err.response?.status,
      data: err.response?.data
    });
    throw err;
  }
);
