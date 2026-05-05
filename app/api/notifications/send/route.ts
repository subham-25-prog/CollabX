import { NextResponse } from "next/server";
import { adminMessaging, adminDb } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const { title, body, data, tokens, sendToAll } = await request.json();

    let targetTokens: string[] = tokens || [];

    if (sendToAll) {
      // Fetch all users and aggregate their fcmTokens
      const usersSnap = await adminDb.collection("users").get();
      usersSnap.forEach((doc) => {
        const userData = doc.data();
        if (userData.fcmTokens && Array.isArray(userData.fcmTokens)) {
          targetTokens.push(...userData.fcmTokens);
        }
      });
      // Deduplicate
      targetTokens = [...new Set(targetTokens)];
    }

    if (!targetTokens || targetTokens.length === 0) {
      return NextResponse.json({ error: "No target tokens provided." }, { status: 400 });
    }

    const payload = {
      notification: {
        title,
        body,
      },
      data: data || {},
      tokens: targetTokens,
    };

    const response = await adminMessaging.sendEachForMulticast(payload);

    // Clean up invalid tokens
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(targetTokens[idx]);
        }
      });
      console.warn("Some notifications failed for tokens:", failedTokens);
    }

    return NextResponse.json({ success: true, response });
  } catch (error: any) {
    console.error("Error sending push notification:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
