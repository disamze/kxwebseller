import admin from '../config/firebaseAdmin.js';
import { User } from '../models/User.js';

export async function protect(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    if (!admin.apps.length) {
      return res.status(500).json({ message: 'Firebase admin is not configured' });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ email: decoded.email });

    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid authentication token' });
  }
}

export function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
  next();
}
