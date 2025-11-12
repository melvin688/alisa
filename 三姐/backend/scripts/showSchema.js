const Database = require('better-sqlite3');
const path = require('path');

// 连接到本地数据库
const dbPath = path.join(__dirname, '..', 'coffee_ordering.db');
const db = new Database(dbPath, { readonly: true });

console.log('📊 数据库表结构:\n');

// 获取所有表
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();

for (const { name } of tables) {
  console.log(`\n🔷 表: ${name}`);
  console.log('─'.repeat(80));
  
  // 获取表结构
  const columns = db.prepare(`PRAGMA table_info(${name})`).all();
  
  for (const col of columns) {
    const pk = col.pk ? ' PRIMARY KEY' : '';
    const notnull = col.notnull ? ' NOT NULL' : '';
    const dflt = col.dflt_value ? ` DEFAULT ${col.dflt_value}` : '';
    console.log(`  ${col.name}: ${col.type}${pk}${notnull}${dflt}`);
  }
  
  // 获取记录数
  const count = db.prepare(`SELECT COUNT(*) as count FROM ${name}`).get();
  console.log(`\n  📦 记录数: ${count.count}`);
}

db.close();
