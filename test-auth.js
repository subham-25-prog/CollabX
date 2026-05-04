const fs = require('fs');
const admin = require('firebase-admin');

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

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

async function runTest() {
  console.log("Testing Firebase Auth...");
  const email = "shubhamoykarmakar12345@gmail.com";
  let userRecord;
  try {
    try {
      userRecord = await admin.auth().getUserByEmail(email);
      console.log("User exists:", userRecord.uid);
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        userRecord = await admin.auth().createUser({ email, emailVerified: true });
        console.log("User created:", userRecord.uid);
      } else {
        throw e;
      }
    }
    const token = await admin.auth().createCustomToken(userRecord.uid);
    console.log("✅ Custom Token created:", token.substring(0, 20) + "...");
  } catch (e) {
    console.error("❌ Auth Error:", e);
  }
}
runTest();
