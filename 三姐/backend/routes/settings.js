const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

// 获取所有系统设置
router.get('/', async (req, res) => {
  try {
    const [settings] = await db.query('SELECT * FROM system_settings');
    
    // 转换为键值对格式
    const settingsMap = {};
    settings.forEach(setting => {
      settingsMap[setting.setting_key] = setting.setting_value;
    });
    
    res.json({ success: true, data: settingsMap });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取单个设置
router.get('/:key', async (req, res) => {
  try {
    const [settings] = await db.query(
      'SELECT * FROM system_settings WHERE setting_key = ?',
      [req.params.key]
    );
    
    if (settings.length === 0) {
      return res.status(404).json({ success: false, message: '设置不存在' });
    }
    
    res.json({ success: true, data: settings[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 更新设置（需要管理员权限）
router.put('/:key', authMiddleware, async (req, res) => {
  try {
    const { value } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO system_settings (setting_key, setting_value, updated_at) 
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE 
       setting_value = ?, 
       updated_at = CURRENT_TIMESTAMP`,
      [req.params.key, value, value]
    );
    
    res.json({ success: true, message: '设置更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 批量更新设置（需要管理员权限）
router.post('/batch', authMiddleware, async (req, res) => {
  try {
    const { settings } = req.body;
    
    for (let key in settings) {
      await db.query(
        `INSERT INTO system_settings (setting_key, setting_value, updated_at) 
         VALUES (?, ?, CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE 
         setting_value = ?, 
         updated_at = CURRENT_TIMESTAMP`,
        [key, settings[key], settings[key]]
      );
    }
    
    res.json({ success: true, message: '设置更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
