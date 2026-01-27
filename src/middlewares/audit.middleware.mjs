import { AuditLog } from '../models/index.mjs';

export const auditLog = (action, entity) => async (req, entityId = null) => {
  await AuditLog.create({
    actorId: req.user.user_id,
    action,
    entity,
    entityId,
    ipAddress: req.ip
  });
};
