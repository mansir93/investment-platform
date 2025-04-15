import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/lib/models/User"
import Transaction from "@/lib/models/Transaction"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { sendEmail } from "@/lib/email"

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { amount, description } = body

    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 })
    }

    await dbConnect()
    const user = await User.findById(params.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create adjustment transaction
    const transaction = await Transaction.create({
      user: user._id,
      type: "adjustment",
      amount,
      description: description || `Manual adjustment by admin`,
      status: "completed",
      processedBy: session.user.id,
    })

    // Update user balance
    user.accountBalance += amount
    await user.save()

    // Notify user
    try {
      await sendEmail({
        to: user.email,
        subject: "Account Balance Adjustment",
        text: `Your account balance has been adjusted by $${amount}. ${
          description ? `Reason: ${description}` : ""
        }. Your new balance is $${user.accountBalance}.`,
      })
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError)
    }

    return NextResponse.json({
      success: true,
      transaction,
      newBalance: user.accountBalance,
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
