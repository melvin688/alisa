const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

// ========== 公开API (C端使用) ==========

// 获取所有分类
router.get('/', async (req, res) => {
  try {
    const [categories] = await db.query(
      'SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order, id'
    );
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== 管理员API (B端使用, 需要认证) ==========

// 获取所有分类 (管理员,包括未启用的)
router.get('/admin/list', authMiddleware, async (req, res) => {
  try {
    const [categories] = await db.query(
      'SELECT * FROM categories ORDER BY sort_order, id'
    );
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 创建分类
router.post('/admin/create', authMiddleware, async (req, res) => {
  try {
    const {
      name_zh,
      name_my,
      name_en,
      icon,
      sort_order,
      is_active
    } = req.body;
    
    // 名称字段改为非必填,不再验证

    const [result] = await db.query(
      `INSERT INTO categories (name_zh, name_my, name_en, icon, sort_order, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name_zh || '',
        name_my || '',
        name_en || '',
        icon || '🍽️',
        sort_order || 0,
        is_active !== undefined ? is_active : 1
      ]
    );

    res.json({
      success: true,
      data: {
        id: result.insertId,
        name_zh,
        name_my,
        name_en,
        icon: icon || '🍽️',
        sort_order: sort_order || 0,
        is_active: is_active !== undefined ? is_active : 1
      },
      message: '分类创建成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 更新分类
router.put('/admin/update/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name_zh,
      name_my,
      name_en,
      icon,
      sort_order,
      is_active
    } = req.body;

    await db.query(
      `UPDATE categories 
       SET name_zh = ?, name_my = ?, name_en = ?, icon = ?, sort_order = ?, is_active = ?
       WHERE id = ?`,
      [name_zh || '', name_my || '', name_en || '', icon, sort_order, is_active, id]
    );

    res.json({
      success: true,
      message: '分类更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 删除分类
router.delete('/admin/delete/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查是否有关联商品
    const [products] = await db.query(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      [id]
    );
    
    if (products[0].count > 0) {
      return res.json({
        success: false,
        message: '该分类下还有商品,无法删除'
      });
    }

    await db.query('DELETE FROM categories WHERE id = ?', [id]);

    res.json({
      success: true,
      message: '分类删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
