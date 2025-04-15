import mongoose from "mongoose"

const InvestmentPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a plan name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
    },
    maturityPeriod: {
      type: Number,
      required: [true, "Please provide maturity period in days"],
      min: 1,
    },
    minInterestRate: {
      type: Number,
      required: [true, "Please provide minimum interest rate"],
      min: 0,
    },
    maxInterestRate: {
      type: Number,
      required: [true, "Please provide maximum interest rate"],
      min: 0,
    },
    finalInterestRate: {
      type: Number,
      default: null,
    },
    minInvestmentAmount: {
      type: Number,
      required: [true, "Please provide minimum investment amount"],
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

export default mongoose.models.InvestmentPlan || mongoose.model("InvestmentPlan", InvestmentPlanSchema)
