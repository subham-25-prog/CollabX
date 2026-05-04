const fs = require('fs');
const admin = require('firebase-admin');
const { Resend } = require('resend');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[match[1]] = val;
  }
});

async function runTest() {
  console.log("Testing Firebase...");
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    await admin.firestore().collection('otps').doc('test-connection').set({ timestamp: new Date() });
    console.log("✅ Firebase Firestore OK!");
  } catch (e) {
    console.error("❌ Firebase Error:", e.message);
  }

  console.log("\nTesting Resend...");
  try {
    const resend = new Resend(env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: "CollabX <onboarding@resend.dev>",
      to: "shubhamoykarmakar12345@gmail.com", // testing the verified email
      subject: "Test email",
      html: "<p>Test</p>"
    });
    if (result.error) {
      console.error("❌ Resend Error:", result.error);
    } else {
      console.log("✅ Resend OK!", result.data);
    }
  } catch (e) {
    console.error("❌ Resend Exception:", e.message);
  }
}
runTest();
