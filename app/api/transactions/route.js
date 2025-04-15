import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Transaction from "@/lib/models/Transaction"
import User from "@/lib/models/User"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { sendEmail } from "@/lib/email"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const status = searchParams.get("status")

    const query = {}

    // Regular users can only see their own transactions
    if (session.user.role !== "admin") {
      query.user = session.user.id
    } else {
      // Admin can filter by user
      const userId = searchParams.get("userId")
      if (userId) {
        query.user = userId
      }
    }

    // Filter by type if provided
    if (type) {
      query.type = type
    }

    // Filter by status if provided
    if (status) {
      query.status = status
    }

    const transactions = await Transaction.find(query)
      .populate("user", "name email")
      .populate("processedBy", "name email")
      .populate("relatedInvestment")
      .sort({ createdAt: -1 })

    return NextResponse.json(transactions)
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
    const { type, amount, description, reference, receiptImage } = body

    if (!type || !amount) {
      return NextResponse.json({ error: "Type and amount are required" }, { status: 400 })
    }

    await dbConnect()

    // Create transaction
    const transaction = await Transaction.create({
      user: session.user.id,
      type,
      amount,
      description,
      reference,
      receiptImage,
      status: type === "deposit" || type === "withdrawal" ? "pending" : "completed",
    })

    // If it's a deposit or withdrawal, notify admin
    if (type === "deposit" || type === "withdrawal") {
      try {
        const admins = await User.find({ role: "admin" })
        for (const admin of admins) {
          await sendEmail({
            to: admin.email,
            subject: `New ${type} request`,
            text: `A new ${type} request of $${amount} has been submitted by ${session.user.email}. Please review it.`,
          })
        }
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError)
      }
    }

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
