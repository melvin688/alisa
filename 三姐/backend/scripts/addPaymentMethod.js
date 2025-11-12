const db = require('../config/database');

async function addPaymentMethodField() {
  try {
    console.log('开始添加payment_method字段（SQLite）...');
    
    // SQLite版本 - 检查字段是否存在
    const columns = await db.query("PRAGMA table_info(orders)");
    const columnList = Array.isArray(columns[0]) ? columns[0] : columns;
    const hasPaymentMethod = columnList.some(col => col.name === 'payment_method');
    
    if (!hasPaymentMethod) {
      // 添加payment_method字段
      await db.query(`
        ALTER TABLE orders 
        ADD COLUMN payment_method VARCHAR(20) DEFAULT 'cash'
      `);
      console.log('✓ 成功添加payment_method字段');
      
      // 更新现有订单为cash
      await db.query(`
        UPDATE orders 
        SET payment_method = 'cash' 
        WHERE payment_method IS NULL
      `);
      console.log('✓ 更新了现有订单的支付方式');
    } else {
      console.log('✓ payment_method字段已存在，跳过添加');
    }
    
    // 查看示例数据
    const [orders] = await db.query(`
      SELECT order_no, table_number, service_type, payment_method, status 
      FROM orders 
      LIMIT 3
    `);
    console.log('\n示例订单数据：');
    console.table(orders);
    
    console.log('\n脚本执行成功');
    process.exit(0);
  } catch (error) {
    console.error('脚本执行失败:', error);
    process.exit(1);
  }
}

addPaymentMethodField();
