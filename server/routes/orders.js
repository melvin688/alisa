import { Router } from 'express';
import { getDb } from '../database.js';

const router = Router();

// POST /api/orders - 提交订单
router.post('/', (req, res) => {
  try {
    const { orderName, items } = req.body;

    // Validation
    if (!orderName || typeof orderName !== 'string' || !orderName.trim()) {
      return res.status(400).json({ error: 'Order name is required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    // Calculate subtotal from items
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.price || 0) * (item.quantity || 1);
    }, 0);

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO orders (order_name, items, subtotal, status)
      VALUES (?, ?, ?, 'pending')
    `);

    const result = stmt.run(orderName.trim(), JSON.stringify(items), subtotal);

    res.status(201).json({
      success: true,
      orderId: result.lastInsertRowid,
      message: `Order placed successfully for ${orderName.trim()}!`,
      subtotal: subtotal,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /api/orders - 获取所有订单（管理用）
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    const parsed = orders.map(o => ({
      ...o,
      items: JSON.parse(o.items),
    }));
    res.json(parsed);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id - 获取单个订单
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      ...order,
      items: JSON.parse(order.items),
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export default router;
