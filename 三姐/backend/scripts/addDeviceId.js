/**
 * 数据库更新脚本 - 添加device_id字段
 */

const db = require('../config/database-sqlite');

async function updateDatabase() {
  try {
    console.log('开始更新数据库...');

    // 添加device_id列到orders表
    try {
      await db.query('ALTER TABLE orders ADD COLUMN device_id VARCHAR(100)');
      console.log('✓ 添加device_id列成功');
    } catch (e) {
      if (e.message && e.message.includes('duplicate column name')) {
        console.log('✓ device_id列已存在，跳过');
      } else {
        throw e;
      }
    }

    // 为device_id创建索引
    try {
      await db.query('CREATE INDEX idx_orders_device_id ON orders(device_id)');
      console.log('✓ 创建device_id索引成功');
    } catch (e) {
      if (e.message && e.message.includes('already exists')) {
        console.log('✓ device_id索引已存在，跳过');
      } else {
        throw e;
      }
    }

    console.log('✓ 数据库更新完成');
    process.exit(0);
  } catch (error) {
    console.error('✗ 数据库更新失败:', error.message);
    process.exit(1);
  }
}

updateDatabase();
