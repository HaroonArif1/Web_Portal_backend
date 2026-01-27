import { Router } from 'express';
import { handleDotsWebhook } from '../controllers/dotsWebhook.controller.mjs';

const router = Router();

router.post('/dots', handleDotsWebhook);

export default router;
