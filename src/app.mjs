import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec, sessionConfig } from './config/index.mjs';
import { authRoutes, userRoutes, adminRoutes, transferRoutes, webhookRoutes } from './routes/index.mjs';

const app = express();

app.use(
  '/webhooks/dots',
  bodyParser.raw({ type: 'application/json' })
);

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(session(sessionConfig));
app.use(cors({ origin: true, credentials: true }));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/webhooks', webhookRoutes);
app.use('/transfer', transferRoutes);

export default app;
