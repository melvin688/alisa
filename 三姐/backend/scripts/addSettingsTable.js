const db = require('../config/database-sqlite');

async function addSettingsTable() {
  try {
    console.log('开始创建系统设置表...');
    
    // 创建系统设置表
    await db.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT UNIQUE NOT NULL,
        setting_value TEXT,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ 系统设置表创建成功');
    
    // 插入默认的KBZPay收款码（使用你提供的图片）
    await db.query(`
      INSERT OR IGNORE INTO system_settings (setting_key, setting_value, description)
      VALUES ('kbzpay_qr_code', '', 'KBZPay收款二维码图片URL')
    `);
    
    // 插入收款人信息
    await db.query(`
      INSERT OR IGNORE INTO system_settings (setting_key, setting_value, description)
      VALUES ('kbzpay_account_name', 'Nu Nu Khaung(******0500)', 'KBZPay收款账户名称')
    `);
    
    console.log('✅ 默认设置已插入');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

addSettingsTable();
