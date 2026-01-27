import { Router } from 'express';
import {
  approveTransfer,
  rejectTransfer,
  importExcelData,
  adminLogin,
  listTransferRequests
} from '../controllers/admin.controller.mjs';
import { adminLoginSchema } from '../validators/adminAuth.schema.mjs';
import { listPendingTransfers } from '../controllers/admin.controller.mjs';
import { pendingTransfersQuerySchema } from '../validators/admin.schema.mjs';
import { upload, authenticate, requireRole, validate } from '../middlewares/index.mjs';
import { adminUsersListSchema, transferActionSchema } from '../validators/admin.schema.mjs';

const router = Router();

router.post('/login', validate(adminLoginSchema), adminLogin);

router.use(authenticate, requireRole('ADMIN'));
router.get(
  '/transfer-requests',
  validate(adminUsersListSchema),
  listTransferRequests
);

router.get(
  '/transfers/pending',
  validate(pendingTransfersQuerySchema),
  listPendingTransfers
);

router.post(
  '/transfer/:id/approve',
  // validate(transferActionSchema),
  approveTransfer
);

router.post(
  '/transfer/:id/reject',
  // validate(transferActionSchema),
  rejectTransfer
);

router.post('/import-excel', upload.single('file'), importExcelData);

export default router;


/**
 * @swagger
 * /admin/transfers/pending:
 *   get:
 *     summary: List pending transfers (Admin)
 *     tags: [Admin]
 *     security:
 *       - sessionAuth: []
 */


/**
 * @swagger
 * /admin/transfer/{id}/approve:
 *   post:
 *     summary: Approve transfer (Admin)
 *     tags: [Admin]
 */

