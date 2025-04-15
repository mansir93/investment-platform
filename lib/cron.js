import cron from "node-cron"
import dbConnect from "./db"
import InvestmentOrder from "./models/InvestmentOrder"
import { sendEmail } from "./email"

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily investment maturity check...")

  try {
    await dbConnect()

    // Find investments that have matured but still have 'active' status
    const maturedInvestments = await InvestmentOrder.find({
      status: "active",
      maturityDate: { $lte: new Date() },
    })
      .populate("user")
      .populate("plan")

    console.log(`Found ${maturedInvestments.length} matured investments`)

    for (const investment of maturedInvestments) {
      // Update status to 'matured'
      investment.status = "matured"
      await investment.save()

      // Notify admin
      try {
        await sendEmail({
          to: "admin@example.com", // In a real app, this would be your admin email
          subject: "Investment Matured",
          text: `Investment ${investment._id} for user ${investment.user.email} has matured. Please set the final interest rate.`,
        })
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError)
      }
    }
  } catch (error) {
    console.error("Error in investment maturity cron job:", error)
  }
})

// Start the cron job
export function startCronJobs() {
  console.log("Starting cron jobs...")
}
