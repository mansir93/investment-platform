import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/lib/models/User"
import { sendEmail } from "@/lib/email"

export async function POST(request) {
  try {
    const body = await request.json()
    const { email } = body

    await dbConnect()

    const user = await User.findOne({ email })

    if (!user) {
      // Don't reveal that the user doesn't exist
      return NextResponse.json({ success: true, message: "Password reset email sent if user exists" })
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken()
    await user.save({ validateBeforeSave: false })

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password/${resetToken}`

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please visit this link to reset your password: \n\n ${resetUrl} \n\n If you did not request this, please ignore this email and your password will remain unchanged.`

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Token",
        text: message,
      })

      return NextResponse.json({ success: true, message: "Password reset email sent" })
    } catch (error) {
      user.resetPasswordToken = undefined
      user.resetPasswordExpire = undefined

      await user.save({ validateBeforeSave: false })

      return NextResponse.json({ error: "Email could not be sent" }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
