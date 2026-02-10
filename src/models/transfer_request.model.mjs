import { model, Schema } from 'mongoose';

const transferRequestSchema = new Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  sourceUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  destinationUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: Schema.Types.Double,
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'FAILED'], default: 'PENDING' },
  providerTransactionId: String,
  approvedAt: Date,
  destinationDotsUserId: String
}, { timestamps: true });

export default model('TransferRequest', transferRequestSchema);
