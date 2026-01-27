import { model, Schema } from 'mongoose';

const auditLogSchema = new Schema({
  actorId: Schema.Types.ObjectId,
  action: String,
  entity: String,
  entityId: Schema.Types.ObjectId,
  ipAddress: String,
}, { timestamps: true });

export default model('AuditLog', auditLogSchema);
