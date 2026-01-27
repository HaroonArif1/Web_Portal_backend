import { model, Schema } from 'mongoose';

const revokedTokenSchema = new Schema({
  jti: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index → auto delete after expiry
  }
}, { timestamps: true });

export default model('RevokedToken', revokedTokenSchema);
