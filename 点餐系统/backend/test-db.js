const Database = require('better-sqlite3');
const db = new Database('coffee_ordering.db');

console.log('=== Categories表结构 ===');
const cols = db.prepare('PRAGMA table_info(categories)').all();
console.log(cols);

console.log('\n=== 测试插入分类 ===');
try {
  const stmt = db.prepare(`INSERT INTO categories (name_zh, name_my, name_en, icon, sort_order, is_active) 
                            VALUES (?, ?, ?, ?, ?, ?)`);
  const info = stmt.run('测试', 'Test', 'Test', '🍽️', 0, 1);
  console.log('插入成功:', info);
} catch (error) {
  console.error('插入失败:', error.message);
}

console.log('\n=== Products表结构 ===');
const pcols = db.prepare('PRAGMA table_info(products)').all();
console.log(pcols);

db.close();
