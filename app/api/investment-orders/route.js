import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import InvestmentOrder from "@/lib/models/InvestmentOrder"
import InvestmentPlan from "@/lib/models/InvestmentPlan"
import User from "@/lib/models/User"
import Transaction from "@/lib/models/Transaction"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const query = {}

    // Admin can see all orders, users can only see their own
    if (session.user.role !== "admin") {
      query.user = session.user.id
    } else {
      // Admin can filter by status
      const { searchParams } = new URL(request.url)
      const status = searchParams.get("status")
      if (status) {
        query.status = status
      }
    }

    const orders = await InvestmentOrder.find(query)
      .populate("user", "name email")
      .populate("plan", "name maturityPeriod minInterestRate maxInterestRate finalInterestRate")

    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { planId, amount, useAccountBalance, reinvestmentAmount } = body

    await dbConnect()

    // Validate plan
    const plan = await InvestmentPlan.findById(planId)

    if (!plan) {
      return NextResponse.json({ error: "Investment plan not found" }, { status: 404 })
    }

    if (!plan.isActive) {
      return NextResponse.json({ error: "Investment plan is not active" }, { status: 400 })
    }

    // Validate amount
    if (amount < plan.minInvestmentAmount) {
      return NextResponse.json(
        {
          error: `Minimum investment amount is ${plan.minInvestmentAmount}`,
        },
        { status: 400 },
      )
    }

    // Check if using account balance for investment
    if (useAccountBalance) {
      const user = await User.findById(session.user.id)

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // If reinvestmentAmount is specified, use that amount from balance
      const amountToUse = reinvestmentAmount || amount

      if (user.accountBalance < amountToUse) {
        return NextResponse.json({ error: "Insufficient account balance" }, { status: 400 })
      }

      // Deduct from account balance
      user.accountBalance -= amountToUse
      await user.save()

      // Create transaction record
      await Transaction.create({
        user: user._id,
        type: "reinvestment",
        amount: -amountToUse,
        description: `Reinvestment in ${plan.name}`,
        status: "completed",
      })

      // Set payment deadline (48 hours from now)
      const paymentDeadline = new Date()
      paymentDeadline.setHours(paymentDeadline.getHours() + 48)

      // Create order with awaiting_approval status since payment is already made
      const order = await InvestmentOrder.create({
        user: session.user.id,
        plan: planId,
        amount,
        status: "awaiting_approval",
        paymentDeadline,
        paymentMethod: "account_balance",
      })

      return NextResponse.json(order, { status: 201 })
    } else {
      // Regular investment process
      // Set payment deadline (48 hours from now)
      const paymentDeadline = new Date()
      paymentDeadline.setHours(paymentDeadline.getHours() + 48)

      // Create order
      const order = await InvestmentOrder.create({
        user: session.user.id,
        plan: planId,
        amount,
        status: "pending_payment",
        paymentDeadline,
        paymentMethod: "manual",
      })

      return NextResponse.json(order, { status: 201 })
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
