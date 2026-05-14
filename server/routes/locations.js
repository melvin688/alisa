import { Router } from 'express';
import { getDb } from '../database.js';

const router = Router();

// GET /api/locations - 获取所有门店
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const locations = db.prepare('SELECT * FROM locations').all();
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

export default router;
