import admin from 'firebase-admin';

function parseMaybeJson(raw) {
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    // continue
  }

  try {
    return JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  } catch {
    // continue
  }

  return null;
}

function normalizeServiceAccount(sa) {
  if (!sa || typeof sa !== 'object') return null;

  const projectId = sa.project_id;
  const clientEmail = sa.client_email;
  const privateKey = typeof sa.private_key === 'string'
    ? sa.private_key.replace(/\\n/g, '\n')
    : null;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    ...sa,
    project_id: projectId,
    client_email: clientEmail,
    private_key: privateKey
  };
}

const parsed = parseMaybeJson(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
const serviceAccount = normalizeServiceAccount(parsed);

if (!admin.apps.length) {
  if (serviceAccount) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin initialized');
    } catch (error) {
      console.warn('Firebase Admin init skipped:', error?.message || error);
    }
  } else {
    console.warn('Firebase Admin not initialized: FIREBASE_SERVICE_ACCOUNT_JSON missing required keys (project_id, client_email, private_key).');
  }
}

export default admin;
