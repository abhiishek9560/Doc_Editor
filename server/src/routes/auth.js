import express from 'express';
import { supabaseAnon, supabaseAdmin } from '../lib/supabase.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const { data: { user, session }, error } = await supabaseAnon.auth.signInWithPassword({
      email,
      password
    });

    if (error || !user || !session) {
      return res.status(401).json({
        error: error?.message || 'Invalid credentials'
      });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email
      },
      token: session.access_token
    });
  } catch (error) {
    res.status(401).json({
      error: error.message || 'Login failed'
    });
  }
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const { data: { user, session }, error } = await supabaseAnon.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name
        }
      }
    });

    if (error || !user) {
      return res.status(400).json({
        error: error?.message || 'Signup failed'
      });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email
      },
      token: session?.access_token || null
    });
  } catch (error) {
    res.status(400).json({
      error: error.message || 'Signup failed'
    });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateUser, async (req, res) => {
  try {
    const { error } = await supabaseAnon.auth.signOut();

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.json({
      message: 'Logged out'
    });
  } catch (error) {
    res.status(400).json({
      error: error.message || 'Logout failed'
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', req.user.id)
      .single();

    if (error) {
      // If profile doesn't exist, return basic user info
      return res.json({
        id: req.user.id,
        email: req.user.email,
        full_name: null
      });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Failed to fetch user'
    });
  }
});

export default router;
