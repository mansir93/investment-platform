import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import PaymentReceipt from "@/lib/models/PaymentReceipt"
import InvestmentOrder from "@/lib/models/InvestmentOrder"
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
    const receipt = await PaymentReceipt.findById(params.id)
      .populate("user", "name email")
      .populate({
        path: "order",
        populate: {
          path: "plan",
          select: "name",
        },
      })

    if (!receipt) {
      return NextResponse.json({ error: "Payment receipt not found" }, { status: 404 })
    }

    // Users can only view their own receipts
    if (session.user.role !== "admin" && receipt.user._id.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(receipt)
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
    const { status, reviewNotes } = body

    await dbConnect()
    const receipt = await PaymentReceipt.findById(params.id).populate("user", "name email").populate("order")

    if (!receipt) {
      return NextResponse.json({ error: "Payment receipt not found" }, { status: 404 })
    }

    // Update receipt
    if (status) {
      receipt.status = status
      receipt.reviewedBy = session.user.id
      receipt.reviewNotes = reviewNotes || ""

      // If approved, update order status
      if (status === "approved") {
        const order = await InvestmentOrder.findById(receipt.order._id)

        if (order.status === "awaiting_approval") {
          // Calculate start and maturity dates
          const startDate = new Date()
          const maturityDate = new Date()
          maturityDate.setDate(maturityDate.getDate() + order.plan.maturityPeriod)

          order.status = "active"
          order.startDate = startDate
          order.maturityDate = maturityDate
          await order.save()

          // Send email notification
          try {
            await sendEmail({
              to: receipt.user.email,
              subject: "Your Payment Has Been Approved",
              text: `Your payment for investment order ${order._id} has been approved. Your investment is now active and will mature on ${maturityDate.toDateString()}.`,
            })
          } catch (emailError) {
            console.error("Failed to send email notification:", emailError)
          }
        }
      } else if (status === "rejected") {
        // If rejected, update order status back to pending_payment
        const order = await InvestmentOrder.findById(receipt.order._id)

        if (order.status === "awaiting_approval") {
          order.status = "pending_payment"
          await order.save()

          // Send email notification
          try {
            await sendEmail({
              to: receipt.user.email,
              subject: "Your Payment Has Been Rejected",
              text: `Your payment for investment order ${order._id} has been rejected. Reason: ${reviewNotes || "No reason provided"}. Please upload a new payment receipt.`,
            })
          } catch (emailError) {
            console.error("Failed to send email notification:", emailError)
          }
        }
      }
    }

    await receipt.save()

    return NextResponse.json(receipt)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
