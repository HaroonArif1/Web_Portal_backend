import { model, Schema } from 'mongoose';

const productSchema = new Schema({
  ProductId: {
    type: Number,
    unique: true,
    required: true
  },
  Symbol: {
    type: String,
    required: true
  },
  ProductType: {
    type: String,
    required: true
  },
  FullName: {
    type: String,
    required: true
  },
  noFees: {
    type: Number,
    default: 0
  },
  isDisabled: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default model('Product', productSchema);
