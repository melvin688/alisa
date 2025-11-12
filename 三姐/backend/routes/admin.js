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

// 修改用户名
router.post('/update-username', authMiddleware, async (req, res) => {
  try {
    const { newUsername, password } = req.body;
    
    if (!newUsername || !password) {
      return res.json({
        success: false,
        message: '请提供新用户名和当前密码'
      });
    }

    // 验证当前密码
    const [adminRows] = await db.query(
      'SELECT password FROM admins WHERE id = ?',
      [req.admin.id]
    );

    if (adminRows.length === 0) {
      return res.json({
        success: false,
        message: '用户不存在'
      });
    }

    const isValid = await bcrypt.compare(password, adminRows[0].password);
    if (!isValid) {
      return res.json({
        success: false,
        message: '当前密码错误'
      });
    }

    // 检查新用户名是否已存在
    const [existingUsers] = await db.query(
      'SELECT id FROM admins WHERE username = ? AND id != ?',
      [newUsername, req.admin.id]
    );

    if (existingUsers.length > 0) {
      return res.json({
        success: false,
        message: '该用户名已被使用'
      });
    }

    // 更新用户名
    await db.query(
      'UPDATE admins SET username = ? WHERE id = ?',
      [newUsername, req.admin.id]
    );

    res.json({
      success: true,
      message: '用户名修改成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 修改密码
router.post('/update-password', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.json({
        success: false,
        message: '请提供旧密码和新密码'
      });
    }

    if (newPassword.length < 6) {
      return res.json({
        success: false,
        message: '新密码长度至少6位'
      });
    }

    // 验证旧密码
    const [adminRows] = await db.query(
      'SELECT password FROM admins WHERE id = ?',
      [req.admin.id]
    );

    if (adminRows.length === 0) {
      return res.json({
        success: false,
        message: '用户不存在'
      });
    }

    const isValid = await bcrypt.compare(oldPassword, adminRows[0].password);
    if (!isValid) {
      return res.json({
        success: false,
        message: '旧密码错误'
      });
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await db.query(
      'UPDATE admins SET password = ? WHERE id = ?',
      [hashedPassword, req.admin.id]
    );

    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 添加管理员（仅超级管理员）
router.post('/add-admin', authMiddleware, async (req, res) => {
  try {
    const { username, password, role, currentPassword } = req.body;
    
    // 检查是否为超级管理员
    if (req.admin.role !== 'admin') {
      return res.json({
        success: false,
        message: '只有超级管理员可以添加新管理员'
      });
    }

    if (!username || !password || !role || !currentPassword) {
      return res.json({
        success: false,
        message: '请提供完整信息'
      });
    }

    if (password.length < 6) {
      return res.json({
        success: false,
        message: '密码长度至少6位'
      });
    }

    // 验证当前用户密码
    const [currentAdminRows] = await db.query(
      'SELECT password FROM admins WHERE id = ?',
      [req.admin.id]
    );

    if (currentAdminRows.length === 0) {
      return res.json({
        success: false,
        message: '当前用户不存在'
      });
    }

    const isValid = await bcrypt.compare(currentPassword, currentAdminRows[0].password);
    if (!isValid) {
      return res.json({
        success: false,
        message: '当前密码错误'
      });
    }

    // 检查用户名是否已存在
    const [existingUsers] = await db.query(
      'SELECT id FROM admins WHERE username = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      return res.json({
        success: false,
        message: '该用户名已被使用'
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 插入新管理员
    await db.query(
      'INSERT INTO admins (username, password, name, role, status) VALUES (?, ?, ?, ?, 1)',
      [username, hashedPassword, username, role]
    );

    res.json({
      success: true,
      message: '管理员添加成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
