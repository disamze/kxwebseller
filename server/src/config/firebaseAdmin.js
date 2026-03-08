import admin from 'firebase-admin';

function parseServiceAccount(raw) {
  if (!raw) return null;

  // 1) Standard JSON string
  try {
    return JSON.parse(raw);
  } catch {
    // ignore and continue
  }

  // 2) Base64 encoded JSON (useful for Render env vars)
  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf8');
    return JSON.parse(decoded);
  } catch {
    // ignore and continue
  }

  return null;
}

const serviceAccount = parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

if (serviceAccount && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export default admin;
