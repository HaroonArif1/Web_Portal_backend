import { model, Schema } from 'mongoose';

const assetSchema = new Schema({
  userId: String,
  assetType: String,
  quantity: Number
}, { timestamps: true });

export default model('Asset', assetSchema);
