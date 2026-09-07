const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    batchNumber: { type: String, trim: true },
    // simple rolling record of recent sales velocity, used by the recommendation engine
    movementHistory: [
      {
        type: { type: String, enum: ['in', 'out', 'adjustment'] },
        quantity: Number,
        reason: String,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

inventorySchema.index({ business: 1, product: 1, branch: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);
