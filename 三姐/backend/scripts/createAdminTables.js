const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../coffee_ordering.db');
const db = new Database(dbPath);

console.log('创建管理员相关数据表...');

try {
  // 创建管理员表
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(100),
      role VARCHAR(20) DEFAULT 'admin',
      status TINYINT DEFAULT 1,
      last_login_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ admins 表创建成功');

  // 创建门店设置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS store_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_name VARCHAR(100),
      store_name_my VARCHAR(100),
      store_name_en VARCHAR(100),
      logo VARCHAR(255),
      address VARCHAR(255),
      phone VARCHAR(50),
      business_hours TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ store_settings 表创建成功');

  // 创建支付设置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS payment_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_method VARCHAR(50) NOT NULL,
      merchant_id VARCHAR(100),
      api_key VARCHAR(255),
      api_secret VARCHAR(255),
      callback_url VARCHAR(255),
      is_enabled TINYINT DEFAULT 1,
      is_test_mode TINYINT DEFAULT 1,
      config TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ payment_settings 表创建成功');

  // 检查是否已有管理员
  const existingAdmin = db.prepare('SELECT COUNT(*) as count FROM admins').get();
  
  if (existingAdmin.count === 0) {
    // 创建默认管理员账号
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    
    db.prepare(`
      INSERT INTO admins (username, password, name, role)
      VALUES (?, ?, ?, ?)
    `).run('admin', hashedPassword, '系统管理员', 'admin');
    
    console.log('✅ 默认管理员账号创建成功');
    console.log('   用户名: admin');
    console.log('   密码: admin123');
  } else {
    console.log('⚠️  管理员账号已存在,跳过创建');
  }

  // 插入默认门店信息
  const existingStore = db.prepare('SELECT COUNT(*) as count FROM store_settings').get();
  
  if (existingStore.count === 0) {
    db.prepare(`
      INSERT INTO store_settings (
        store_name, store_name_my, store_name_en, 
        address, phone, business_hours, description
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      '咖啡店',
      'ကော်ဖီဆိုင်',
      'Coffee Shop',
      '缅甸仰光',
      '+95-xxx-xxxx',
      JSON.stringify({
        monday: '09:00-22:00',
        tuesday: '09:00-22:00',
        wednesday: '09:00-22:00',
        thursday: '09:00-22:00',
        friday: '09:00-22:00',
        saturday: '09:00-23:00',
        sunday: '09:00-23:00'
      }),
      '欢迎光临'
    );
    
    console.log('✅ 默认门店信息创建成功');
  }

  // 插入KPAY默认配置
  const existingPayment = db.prepare('SELECT COUNT(*) as count FROM payment_settings WHERE payment_method = ?').get('kpay');
  
  if (existingPayment.count === 0) {
    db.prepare(`
      INSERT INTO payment_settings (
        payment_method, merchant_id, is_enabled, is_test_mode
      )
      VALUES (?, ?, ?, ?)
    `).run('kpay', 'test_merchant', 1, 1);
    
    console.log('✅ KPAY默认配置创建成功');
  }

  console.log('\n🎉 管理员相关表初始化完成!');

} catch (error) {
  console.error('❌ 创建表失败:', error.message);
  process.exit(1);
} finally {
  db.close();
}
