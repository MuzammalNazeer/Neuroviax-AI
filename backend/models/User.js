const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    // A user can belong to multiple businesses with different roles (FR: multi-user SME accounts)
    memberships: [
      {
        business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
        role: {
          type: String,
          enum: ['owner', 'admin', 'manager', 'staff', 'accountant'],
          default: 'staff',
        },
      },
    ],
    mfaEnabled: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
    // Password reset via OTP
    resetPasswordOTP: { type: String, select: false },
    resetPasswordOTPExpiry: { type: Date, select: false },
    // Subscription & Stripe Customer Integration
    stripeCustomerId: { type: String, index: true },
    currentPlan: {
      type: String,
      enum: ['FREE', 'BASIC', 'PRO'],
      default: 'FREE',
    },
    subscriptionStatus: {
      type: String,
      enum: [
        'active',
        'trialing',
        'past_due',
        'canceled',
        'incomplete',
        'incomplete_expired',
        'unpaid',
      ],
      default: 'active',
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    subscriptionEndDate: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
