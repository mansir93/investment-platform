import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import InvestmentPlan from "@/lib/models/InvestmentPlan"
import InvestmentOrder from "@/lib/models/InvestmentOrder"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { sendEmail } from "@/lib/email"

export async function GET(request, { params }) {
  try {
    await dbConnect()
    const plan = await InvestmentPlan.findById(params.id)

    if (!plan) {
      return NextResponse.json({ error: "Investment plan not found" }, { status: 404 })
    }

    return NextResponse.json(plan)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    await dbConnect()
    const plan = await InvestmentPlan.findById(params.id)

    if (!plan) {
      return NextResponse.json({ error: "Investment plan not found" }, { status: 404 })
    }

    // Update plan fields
    if (body.name) plan.name = body.name
    if (body.description) plan.description = body.description
    if (body.maturityPeriod) plan.maturityPeriod = body.maturityPeriod
    if (body.minInterestRate) plan.minInterestRate = body.minInterestRate
    if (body.maxInterestRate) plan.maxInterestRate = body.maxInterestRate
    if (body.minInvestmentAmount) plan.minInvestmentAmount = body.minInvestmentAmount
    if (typeof body.isActive === "boolean") plan.isActive = body.isActive

    // If finalInterestRate is provided, update all active investments
    if (body.finalInterestRate !== undefined) {
      plan.finalInterestRate = body.finalInterestRate

      // Find all active investments for this plan
      const activeInvestments = await InvestmentOrder.find({
        plan: plan._id,
        status: "active",
      })

      // Update each investment
      for (const investment of activeInvestments) {
        investment.finalInterestRate = body.finalInterestRate
        investment.finalAmount = investment.amount * (1 + body.finalInterestRate / 100)
        investment.status = "matured"
        await investment.save()

        // Send email notification
        try {
          await sendEmail({
            to: investment.user.email,
            subject: "Your Investment Has Matured",
            text: `Your investment of ${investment.amount} has matured with a final interest rate of ${body.finalInterestRate}%. Your final amount is ${investment.finalAmount}.`,
          })
        } catch (emailError) {
          console.error("Failed to send email notification:", emailError)
        }
      }
    }

    await plan.save()

    return NextResponse.json(plan)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Check if there are any active investments for this plan
    const activeInvestments = await InvestmentOrder.findOne({
      plan: params.id,
      status: { $in: ["active", "pending_payment", "awaiting_approval"] },
    })

    if (activeInvestments) {
      return NextResponse.json(
        {
          error: "Cannot delete plan with active investments",
        },
        { status: 400 },
      )
    }

    const plan = await InvestmentPlan.findByIdAndDelete(params.id)

    if (!plan) {
      return NextResponse.json({ error: "Investment plan not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
