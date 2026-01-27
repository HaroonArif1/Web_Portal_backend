import express from 'express';
import { authenticate } from '../middlewares/index.mjs';
import { dashboard } from '../controllers/user.controller.mjs';

const router = express.Router();

router.get('/dashboard', authenticate, dashboard);

export default router;
