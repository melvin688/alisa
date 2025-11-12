const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// 连接到本地数据库
const dbPath = path.join(__dirname, '..', 'coffee_ordering.db');
const db = new Database(dbPath, { readonly: true });

console.log('开始导出数据...\n');

// 输出文件
const outputPath = path.join(__dirname, '..', 'migrations', '0001_init_data.sql');

// 确保 migrations 目录存在
const migrationsDir = path.join(__dirname, '..', 'migrations');
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

let sqlStatements = [];

// 1. 导出表结构
console.log('导出表结构...');
const tables_list = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();

sqlStatements.push('-- 表结构');
for (const { name, sql } of tables_list) {
  sqlStatements.push(`\n-- ${name}`);
  sqlStatements.push(`${sql};`);
}
sqlStatements.push('');

// 2. 导出数据
const tables = [
  'admins',
  'categories',
  'products',
  'product_options',
  'tables',
  'orders',
  'order_items',
  'store_settings',
  'payment_settings',
  'system_settings'
];

for (const table of tables) {
  try {
    const rows = db.prepare(`SELECT * FROM ${table}`).all();
    
    if (rows.length === 0) {
      console.log(`  ${table}: 0 条记录`);
      continue;
    }

    console.log(`  ${table}: ${rows.length} 条记录`);
    sqlStatements.push(`-- ${table} 数据`);

    for (const row of rows) {
      const columns = Object.keys(row);
      const values = columns.map(col => {
        const val = row[col];
        if (val === null) return 'NULL';
        if (typeof val === 'number') return val;
        // 转义单引号
        return `'${String(val).replace(/'/g, "''")}'`;
      });

      const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});`;
      sqlStatements.push(sql);
    }

    sqlStatements.push('');
  } catch (error) {
    console.log(`  ${table}: 表不存在或读取失败`);
  }
}

// 写入文件
const output = sqlStatements.join('\n');
fs.writeFileSync(outputPath, output, 'utf-8');

console.log(`\n✅ 导出完成!`);
console.log(`📁 文件位置: ${outputPath}`);
console.log(`📊 文件大小: ${(output.length / 1024).toFixed(2)} KB`);

db.close();
