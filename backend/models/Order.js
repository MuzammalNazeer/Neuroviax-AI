const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    // Unified schema with a type field, as recommended in Section 10 to simplify reporting
    type: { type: String, enum: ['sales', 'purchase'], required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    items: [orderItemSchema],
    subtotal: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'fulfilled', 'delivered', 'cancelled', 'returned'],
      default: 'draft',
      index: true,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // link back to an AI recommendation if this order originated from one (auditability, Section 12.2)
    originatingRecommendation: { type: mongoose.Schema.Types.ObjectId, ref: 'AIRecommendation' },
  },
  { timestamps: true }
);

orderSchema.pre('save', function (next) {
  this.subtotal = this.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  this.total = this.subtotal + (this.taxAmount || 0);
  next();
});

module.exports = mongoose.model('Order', orderSchema);
