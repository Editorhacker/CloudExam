const admin = require("firebase-admin");
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

// Since we may not have a real service account yet, we try to initialize with env vars.
// For local testing, user should replace these with a real service account key or we use a simple mocked db for demo.
let db;

try {
  const envVar = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!envVar) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT not found in .env");
  }

  let serviceAccount;
  
  if (envVar.trim().startsWith('{')) {
    // If it's the raw JSON string
    serviceAccount = JSON.parse(envVar);
  } else {
    // If it's a file path
    const resolvedPath = path.resolve(process.cwd(), envVar);
    serviceAccount = require(resolvedPath);
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("✅ Firebase initialized");

  db = admin.firestore();
} catch (error) {
  console.error("Firebase Admin Initialization Error (Using mock config for now)", error);
  // This is just to ensure the code doesn't crash entirely if no valid key is present.
  // In a real app this would crash, but for demonstration we'll just mock it if it fails.
  admin.initializeApp();
  db = admin.firestore();
}
module.exports = { admin, db };
