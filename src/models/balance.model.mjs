import { model, Schema } from 'mongoose';

const balanceSchema = new Schema({
  AccountId: {
    type: Number,
    required: true
  },
  ProductId: {
    type: Number,
    required: true
  },
  Amount: {
    type: Schema.Types.Double,
    required: true
  }
}, { timestamps: true });

export default model('Balance', balanceSchema);
