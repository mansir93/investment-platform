import mongoose from "mongoose"

const TransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "investment", "maturity", "adjustment", "reinvestment"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "rejected", "cancelled"],
      default: "pending",
    },
    description: {
      type: String,
    },
    reference: {
      type: String,
    },
    relatedInvestment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InvestmentOrder",
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectionReason: {
      type: String,
    },
    receiptImage: {
      type: String,
    },
  },
  { timestamps: true },
)

export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema)
