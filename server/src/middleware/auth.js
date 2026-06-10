import { supabaseAnon } from '../lib/supabase.js';

// Helper to decode JWT without verification (Supabase token)
const decodeJWT = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');
    
    const decoded = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    );
    return decoded;
  } catch (error) {
    return null;
  }
};

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7);

    // Decode the JWT token
    const decoded = decodeJWT(token);
    if (!decoded) {
      return res.status(401).json({
        error: 'Invalid token'
      });
    }

    // Check token expiration
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({
        error: 'Token expired'
      });
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email
    };

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid token'
    });
  }
};
