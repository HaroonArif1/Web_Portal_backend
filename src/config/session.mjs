import MongoStore from 'connect-mongo';
import { env } from './env.mjs';

export const sessionConfig = {
  name: 'secure.sid',
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  store: MongoStore.create({
    mongoUrl: env.MONGO_URI   // ✅ FIXED
  }),
  cookie: {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    maxAge: 30 * 60 * 1000
  }
};
