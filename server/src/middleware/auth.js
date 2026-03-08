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

function resolveFallbackRole(req) {
  const email = typeof req.headers['x-user-email'] === 'string' ? req.headers['x-user-email'] : '';
  const requestedRole = typeof req.headers['x-user-role'] === 'string' ? req.headers['x-user-role'] : 'user';
  const adminSecret = typeof req.headers['x-admin-secret'] === 'string' ? req.headers['x-admin-secret'] : '';

  const isValidAdmin =
    requestedRole === 'admin' &&
    email === FALLBACK_ADMIN_EMAIL &&
    adminSecret === FALLBACK_ADMIN_SECRET;

  return isValidAdmin ? 'admin' : 'user';
}

export async function protect(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token && admin.apps.length) {
      const decoded = await admin.auth().verifyIdToken(token);
      const user = await User.findOne({ email: decoded.email });
      if (!user) return res.status(401).json({ message: 'User not found' });
      req.user = user;
      return next();
    }

    // Fallback mode: if Firebase is not configured, allow header-based identity.
    if (!admin.apps.length) {
      const email = typeof req.headers['x-user-email'] === 'string' ? req.headers['x-user-email'] : '';
      const name = typeof req.headers['x-user-name'] === 'string' ? req.headers['x-user-name'] : '';
      const role = resolveFallbackRole(req);

      const user = await findOrCreateUser({ email, name, role });
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized. Please login first.' });
      }

      req.user = user;
      return next();
    }

    return res.status(401).json({ message: 'Unauthorized' });
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid authentication token' });
  }
}

export function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
  next();
}
