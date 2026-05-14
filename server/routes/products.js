import { Router } from 'express';
import { getDb } from '../database.js';

const router = Router();

// GET /api/products - 获取所有产品
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const products = db.prepare('SELECT * FROM products').all();

    // Parse JSON string fields back to arrays
    const parsed = products.map(p => ({
      ...p,
      tags: JSON.parse(p.tags),
      tags_zh: JSON.parse(p.tags_zh),
      notes: JSON.parse(p.notes),
      notes_zh: JSON.parse(p.notes_zh),
    }));

    res.json(parsed);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id - 获取单个产品
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      ...product,
      tags: JSON.parse(product.tags),
      tags_zh: JSON.parse(product.tags_zh),
      notes: JSON.parse(product.notes),
      notes_zh: JSON.parse(product.notes_zh),
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

export default router;
