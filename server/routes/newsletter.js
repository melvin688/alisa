import { Router } from 'express';
import { getDb } from '../database.js';

const router = Router();

// POST /api/newsletter - 订阅Newsletter
router.post('/', (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const db = getDb();

    // Check if already subscribed
    const existing = db.prepare('SELECT id FROM newsletter WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'Email already subscribed' });
    }

    db.prepare('INSERT INTO newsletter (email) VALUES (?)').run(email.toLowerCase());

    res.status(201).json({
      success: true,
      message: 'Subscribed successfully!',
    });
  } catch (error) {
    console.error('Error subscribing:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

export default router;
