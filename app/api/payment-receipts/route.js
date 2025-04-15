import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import PaymentReceipt from "@/lib/models/PaymentReceipt"
import InvestmentOrder from "@/lib/models/InvestmentOrder"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { sendEmail } from "@/lib/email"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const query = {}

    // Admin can see all receipts, users can only see their own
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

    const receipts = await PaymentReceipt.find(query)
      .populate("user", "name email")
      .populate({
        path: "order",
        populate: {
          path: "plan",
          select: "name",
        },
      })

    return NextResponse.json(receipts)
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

    const formData = await request.formData()
    const orderId = formData.get("orderId")
    const notes = formData.get("notes")
    const receiptImage = formData.get("receiptImage")

    if (!orderId || !receiptImage) {
      return NextResponse.json(
        {
          error: "Order ID and receipt image are required",
        },
        { status: 400 },
      )
    }

    await dbConnect()

    // Validate order
    const order = await InvestmentOrder.findById(orderId)

    if (!order) {
      return NextResponse.json({ error: "Investment order not found" }, { status: 404 })
    }

    // Users can only upload receipts for their own orders
    if (order.user.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate order status
    if (order.status !== "pending_payment") {
      return NextResponse.json(
        {
          error: "Payment receipt can only be uploaded for pending payment orders",
        },
        { status: 400 },
      )
    }

    // Check if payment deadline has passed
    if (new Date() > new Date(order.paymentDeadline)) {
      return NextResponse.json(
        {
          error: "Payment deadline has passed",
        },
        { status: 400 },
      )
    }

    // Upload receipt image (in a real app, you'd upload to a storage service)
    // For this example, we'll assume the image is a base64 string
    const receiptImageUrl = receiptImage // In a real app, this would be the URL from your storage service

    // Create receipt
    const receipt = await PaymentReceipt.create({
      order: orderId,
      user: session.user.id,
      receiptImage: receiptImageUrl,
      notes,
      status: "pending",
    })

    // Update order status
    order.status = "awaiting_approval"
    await order.save()

    // Notify admin
    try {
      await sendEmail({
        to: "admin@example.com", // In a real app, this would be your admin email
        subject: "New Payment Receipt Uploaded",
        text: `A new payment receipt has been uploaded for order ${orderId}. Please review it.`,
      })
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError)
    }

    return NextResponse.json(receipt, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
