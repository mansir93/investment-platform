import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import InvestmentOrder from "@/lib/models/InvestmentOrder"
import User from "@/lib/models/User"
import Transaction from "@/lib/models/Transaction"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { sendEmail } from "@/lib/email"

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const order = await InvestmentOrder.findById(params.id)
      .populate("user", "name email")
      .populate("plan", "name maturityPeriod minInterestRate maxInterestRate finalInterestRate")

    if (!order) {
      return NextResponse.json({ error: "Investment order not found" }, { status: 404 })
    }

    // Users can only view their own orders
    if (session.user.role !== "admin" && order.user._id.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(order)
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
    const { status } = body

    await dbConnect()
    const order = await InvestmentOrder.findById(params.id).populate("user", "name email").populate("plan")

    if (!order) {
      return NextResponse.json({ error: "Investment order not found" }, { status: 404 })
    }

    // Update status
    if (status) {
      // Validate status transition
      if (status === "active" && order.status === "awaiting_approval") {
        // Calculate start and maturity dates
        const startDate = new Date()
        const maturityDate = new Date()
        maturityDate.setDate(maturityDate.getDate() + order.plan.maturityPeriod)

        order.status = "active"
        order.startDate = startDate
        order.maturityDate = maturityDate

        // Send email notification
        try {
          await sendEmail({
            to: order.user.email,
            subject: "Your Investment Has Been Activated",
            text: `Your investment of ${order.amount} in ${order.plan.name} has been activated. It will mature on ${maturityDate.toDateString()}.`,
          })
        } catch (emailError) {
          console.error("Failed to send email notification:", emailError)
        }
      } else if (status === "completed" && order.status === "matured") {
        order.status = "completed"

        // Credit user's account with the final amount
        const user = await User.findById(order.user._id)
        if (user) {
          const profit = order.finalAmount - order.amount
          user.accountBalance += order.finalAmount
          user.totalEarnings += profit
          await user.save()

          // Create transaction record for maturity payout
          await Transaction.create({
            user: user._id,
            type: "maturity",
            amount: order.finalAmount,
            description: `Maturity payout for investment in ${order.plan.name}`,
            status: "completed",
            relatedInvestment: order._id,
          })
        }

        // Send email notification
        try {
          await sendEmail({
            to: order.user.email,
            subject: "Your Investment Has Been Completed",
            text: `Your investment of ${order.amount} in ${order.plan.name} has been completed. Your final amount of ${order.finalAmount} has been credited to your account.`,
          })
        } catch (emailError) {
          console.error("Failed to send email notification:", emailError)
        }
      } else {
        return NextResponse.json(
          {
            error: "Invalid status transition",
          },
          { status: 400 },
        )
      }
    }

    await order.save()

    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
