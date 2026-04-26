import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // 1. Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // 2. Save to Firestore (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    
    await adminDb.collection("otps").doc(email).set({
      otp,
      expiresAt,
      createdAt: new Date(),
    })

    // 3. Send Email via Resend
    const { data, error } = await resend.emails.send({
      from: "CollabX <onboarding@resend.dev>", // Change this if you have a verified domain in Resend
      to: email,
      subject: "Your CollabX Login Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to CollabX!</h2>
          <p>Here is your 6-digit verification code to log in:</p>
          <div style="background-color: #f4f4f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #18181b;">${otp}</span>
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully" })
  } catch (error) {
    console.error("OTP generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
