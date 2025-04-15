import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Transaction from "@/lib/models/Transaction"
import User from "@/lib/models/User"
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
    const transaction = await Transaction.findById(params.id)
      .populate("user", "name email")
      .populate("processedBy", "name email")
      .populate("relatedInvestment")

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Regular users can only view their own transactions
    if (session.user.role !== "admin" && transaction.user._id.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(transaction)
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
    const { status, rejectionReason } = body

    await dbConnect()
    const transaction = await Transaction.findById(params.id).populate("user", "name email accountBalance")

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Only process pending transactions
    if (transaction.status !== "pending") {
      return NextResponse.json({ error: "Transaction is not pending" }, { status: 400 })
    }

    // Update transaction status
    transaction.status = status
    transaction.processedBy = session.user.id

    if (status === "rejected") {
      transaction.rejectionReason = rejectionReason || "No reason provided"
    }

    // If approved, update user's account balance
    if (status === "completed") {
      const user = await User.findById(transaction.user._id)

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      if (transaction.type === "deposit") {
        user.accountBalance += transaction.amount
        user.totalDeposited += transaction.amount
      } else if (transaction.type === "withdrawal") {
        // Check if user has sufficient balance
        if (user.accountBalance < transaction.amount) {
          return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
        }
        user.accountBalance -= transaction.amount
        user.totalWithdrawn += transaction.amount
      } else if (transaction.type === "adjustment") {
        user.accountBalance += transaction.amount // Can be positive or negative
      } else if (transaction.type === "maturity") {
        user.accountBalance += transaction.amount
        user.totalEarnings += transaction.amount
      }

      await user.save()
    }

    await transaction.save()

    // Send email notification to user
    try {
      await sendEmail({
        to: transaction.user.email,
        subject: `Your ${transaction.type} request has been ${status}`,
        text: `Your ${transaction.type} request of $${transaction.amount} has been ${status}. ${
          status === "rejected" ? `Reason: ${transaction.rejectionReason}` : ""
        }`,
      })
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError)
    }

    return NextResponse.json(transaction)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const transaction = await Transaction.findById(params.id)

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Regular users can only cancel their own pending transactions
    if (session.user.role !== "admin") {
      if (transaction.user.toString() !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      if (transaction.status !== "pending") {
        return NextResponse.json({ error: "Only pending transactions can be cancelled" }, { status: 400 })
      }
    }

    // Update status to cancelled instead of deleting
    transaction.status = "cancelled"
    await transaction.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
