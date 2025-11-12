const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

// ========== 公开API (C端使用) ==========

// 获取所有桌台
router.get('/', async (req, res) => {
  try {
    const [tables] = await db.query(
      'SELECT * FROM tables ORDER BY table_number'
    );
    res.json({ success: true, data: tables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 根据桌号获取桌台信息
router.get('/:tableNumber', async (req, res) => {
  try {
    const [tables] = await db.query(
      'SELECT * FROM tables WHERE table_number = ?',
      [req.params.tableNumber]
    );
    
    if (tables.length === 0) {
      return res.status(404).json({ success: false, message: '桌台不存在' });
    }
    
    res.json({ success: true, data: tables[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== 管理员API (B端使用, 需要认证) ==========

// 获取所有餐桌 (管理员)
router.get('/admin/list', authMiddleware, async (req, res) => {
  try {
    const [tables] = await db.query(
      'SELECT * FROM tables ORDER BY table_number'
    );
    
    res.json({
      success: true,
      data: tables
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 创建餐桌
router.post('/admin/create', authMiddleware, async (req, res) => {
  try {
    const { table_number, table_name, capacity, status } = req.body;
    
    if (!table_number || !table_name) {
      return res.json({
        success: false,
        message: '桌号和桌名不能为空'
      });
    }

    // 生成二维码URL
    const qr_code = `http://localhost:5173/?table=${table_number}`;
    
    const [result] = await db.query(
      `INSERT INTO tables (table_number, table_name, capacity, qr_code, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [table_number, table_name, capacity || 4, qr_code, status || 'available']
    );

    res.json({
      success: true,
      data: {
        id: result.insertId,
        table_number,
        table_name,
        capacity: capacity || 4,
        qr_code,
        status: status || 'available'
      },
      message: '餐桌创建成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 更新餐桌
router.put('/admin/update/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { table_number, table_name, capacity, status } = req.body;
    
    const qr_code = `http://localhost:5173/?table=${table_number}`;
    
    await db.query(
      `UPDATE tables 
       SET table_number = ?, table_name = ?, capacity = ?, qr_code = ?, status = ?
       WHERE id = ?`,
      [table_number, table_name, capacity, qr_code, status, id]
    );

    res.json({
      success: true,
      message: '餐桌更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 删除餐桌
router.delete('/admin/delete/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query('DELETE FROM tables WHERE id = ?', [id]);

    res.json({
      success: true,
      message: '餐桌删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
