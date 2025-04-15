import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import InvestmentPlan from "@/lib/models/InvestmentPlan"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET() {
  try {
    await dbConnect()
    const plans = await InvestmentPlan.find({ isActive: true })

    return NextResponse.json(plans)
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
    const { name, description, maturityPeriod, minInterestRate, maxInterestRate, minInvestmentAmount } = body

    await dbConnect()

    const plan = await InvestmentPlan.create({
      name,
      description,
      maturityPeriod,
      minInterestRate,
      maxInterestRate,
      minInvestmentAmount,
      createdBy: session.user.id,
    })

    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
