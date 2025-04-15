import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/lib/models/User"
import Transaction from "@/lib/models/Transaction"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const users = await User.find().select("-password")

    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, password, role, isGoogleAuthEnabled, initialBalance } = body

    await dbConnect()

    // Check if user already exists
    const userExists = await User.findOne({ email })

    if (userExists) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
      isGoogleAuthEnabled: isGoogleAuthEnabled || false,
      accountBalance: initialBalance || 0,
    })

    // If initial balance is provided, create a transaction record
    if (initialBalance && initialBalance > 0) {
      await Transaction.create({
        user: user._id,
        type: "adjustment",
        amount: initialBalance,
        description: "Initial account balance",
        status: "completed",
        processedBy: session.user.id,
      })
    }

    return NextResponse.json(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isGoogleAuthEnabled: user.isGoogleAuthEnabled,
        accountBalance: user.accountBalance,
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
