import admin from '../config/firebaseAdmin.js';
import { User } from '../models/User.js';

const FALLBACK_ADMIN_EMAIL = 'kxsam@admin';
const FALLBACK_ADMIN_SECRET = 'collab@kxsam';

async function findOrCreateUser({ email, name, role = 'user' }) {
  if (!email) return null;

  return User.findOneAndUpdate(
    { email },
    {
      $set: { name: name || email.split('@')[0], role },
      $setOnInsert: { email }
    },
    { new: true, upsert: true }
  );
}

function extractFallbackIdentity(req) {
  const email = typeof req.headers['x-user-email'] === 'string' ? req.headers['x-user-email'].trim() : '';
  const name = typeof req.headers['x-user-name'] === 'string' ? req.headers['x-user-name'].trim() : '';
  const requestedRole = typeof req.headers['x-user-role'] === 'string' ? req.headers['x-user-role'].trim() : 'user';
  const adminSecret = typeof req.headers['x-admin-secret'] === 'string' ? req.headers['x-admin-secret'].trim() : '';

  const isValidAdmin =
    requestedRole === 'admin' &&
    email === FALLBACK_ADMIN_EMAIL &&
    adminSecret === FALLBACK_ADMIN_SECRET;

  return {
    email,
    name,
    role: isValidAdmin ? 'admin' : 'user'
  };
}

export async function protect(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (token && admin.apps.length) {
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      const user = await User.findOne({ email: decoded.email });
      if (!user) return res.status(401).json({ message: 'User not found' });
      req.user = user;
      return next();
    } catch (_error) {
      // Fall through to fallback identity if provided.
    }
  }

  const fallback = extractFallbackIdentity(req);
  if (fallback.email) {
    const user = await findOrCreateUser(fallback);
    if (!user) return res.status(401).json({ message: 'Unauthorized. Please login first.' });
    req.user = user;
    return next();
  }

  return res.status(401).json({ message: 'Unauthorized' });
}

export function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
  next();
}
