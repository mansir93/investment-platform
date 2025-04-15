import mongoose from "mongoose"

const InvestmentOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InvestmentPlan",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Please provide investment amount"],
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending_payment", "awaiting_approval", "active", "matured", "completed"],
      default: "pending_payment",
    },
    paymentMethod: {
      type: String,
      enum: ["manual", "account_balance"],
      default: "manual",
    },
    paymentDeadline: {
      type: Date,
      required: true,
    },
    startDate: {
      type: Date,
    },
    maturityDate: {
      type: Date,
    },
    finalInterestRate: {
      type: Number,
    },
    finalAmount: {
      type: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

// Create TTL index for maturity notification
InvestmentOrderSchema.index(
  { maturityDate: 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { status: "active" } },
)

export default mongoose.models.InvestmentOrder || mongoose.model("InvestmentOrder", InvestmentOrderSchema)
