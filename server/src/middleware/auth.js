import admin from '../config/firebaseAdmin.js';
import { User } from '../models/User.js';

async function findOrCreateUser({ email, name, role = 'user' }) {
  if (!email) return null;

  return User.findOneAndUpdate(
    { email },
    { $setOnInsert: { email, name: name || email.split('@')[0], role } },
    { new: true, upsert: true }
  );
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
    // This keeps deployments functional while auth keys are being configured.
    if (!admin.apps.length) {
      const email = req.headers['x-user-email'];
      const name = req.headers['x-user-name'];
      const role = req.headers['x-user-role'];
      const user = await findOrCreateUser({
        email: typeof email === 'string' ? email : '',
        name: typeof name === 'string' ? name : '',
        role: typeof role === 'string' && role === 'admin' ? 'admin' : 'user'
      });

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
