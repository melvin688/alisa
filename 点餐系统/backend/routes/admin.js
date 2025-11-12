const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'coffee-ordering-secret-key-2024';

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.json({
        success: false,
        message: '请输入用户名和密码'
      });
    }

    const [rows] = await db.query(
      'SELECT * FROM admins WHERE username = ? AND status = 1',
      [username]
    );

    if (rows.length === 0) {
      return res.json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const admin = rows[0];
    const isValid = await bcrypt.compare(password, admin.password);
    
    if (!isValid) {
      return res.json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 更新最后登录时间
    await db.query(
      'UPDATE admins SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
      [admin.id]
    );

    // 生成Token
    const token = jwt.sign(
      { 
        id: admin.id,
        username: admin.username,
        role: admin.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          role: admin.role
        }
      },
      message: '登录成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 获取当前用户信息
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, username, name, role, created_at, last_login_at FROM admins WHERE id = ?',
      [req.admin.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 登出
router.post('/logout', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: '退出成功'
  });
});

module.exports = router;
