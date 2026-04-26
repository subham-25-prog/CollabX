import { NextResponse } from "next/server"
import { adminDb, adminAuth } from "@/lib/firebase-admin"

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
    }

    // 1. Fetch OTP from Firestore
    const otpDoc = await adminDb.collection("otps").doc(email).get()

    if (!otpDoc.exists) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 })
    }

    const otpData = otpDoc.data()

    // 2. Validate OTP and Expiry
    if (otpData?.otp !== otp) {
      return NextResponse.json({ error: "Incorrect OTP" }, { status: 400 })
    }

    if (otpData?.expiresAt.toDate() < new Date()) {
      await adminDb.collection("otps").doc(email).delete()
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 })
    }

    // 3. OTP is valid! Delete it from DB so it can't be reused
    await adminDb.collection("otps").doc(email).delete()

    // 4. Find or Create User in Firebase Auth
    let userRecord
    try {
      userRecord = await adminAuth.getUserByEmail(email)
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Create new user if they don't exist
        userRecord = await adminAuth.createUser({
          email: email,
          emailVerified: true,
        })
      } else {
        throw error
      }
    }

    // 5. Generate Custom Token
    const customToken = await adminAuth.createCustomToken(userRecord.uid)

    return NextResponse.json({ success: true, token: customToken })
  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
