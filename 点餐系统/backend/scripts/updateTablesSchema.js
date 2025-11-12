/**
 * 更新 tables 表结构 - 添加 table_name 和 capacity 字段
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../coffee_ordering.db');
const db = new Database(dbPath);

async function updateTablesSchema() {
  try {
    console.log('开始更新 tables 表结构...');

    // 检查是否需要添加 table_name 字段
    const tableInfo = db.prepare(`PRAGMA table_info(tables)`).all();
    const hasTableName = tableInfo.some(col => col.name === 'table_name');
    const hasCapacity = tableInfo.some(col => col.name === 'capacity');

    console.log('当前字段:', tableInfo.map(c => c.name).join(', '));
    console.log('hasTableName:', hasTableName);
    console.log('hasCapacity:', hasCapacity);

    if (!hasTableName || !hasCapacity) {
      console.log('需要更新 tables 表结构');

      // SQLite 不支持直接 ADD COLUMN IF NOT EXISTS，需要重建表
      
      // 禁用外键约束
      db.exec('PRAGMA foreign_keys = OFF');
      db.exec('BEGIN TRANSACTION');

      try {
        // 1. 创建新表
        db.exec(`
          CREATE TABLE tables_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_number VARCHAR(20) UNIQUE NOT NULL,
            table_name VARCHAR(100) DEFAULT '',
            capacity INTEGER DEFAULT 4,
            qr_code VARCHAR(255),
            status VARCHAR(20) DEFAULT 'available',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // 2. 复制旧数据到新表
        db.exec(`
          INSERT INTO tables_new (id, table_number, qr_code, status, created_at, updated_at)
          SELECT id, table_number, qr_code, status, created_at, updated_at
          FROM tables
        `);

        // 3. 更新 table_name 字段（使用 table_number 作为默认值）
        db.exec(`
          UPDATE tables_new
          SET table_name = '桌号 ' || table_number
          WHERE table_name = '' OR table_name IS NULL
        `);

        // 4. 删除旧表
        db.exec('DROP TABLE tables');

        // 5. 重命名新表
        db.exec('ALTER TABLE tables_new RENAME TO tables');

        db.exec('COMMIT');
        
        // 重新启用外键约束
        db.exec('PRAGMA foreign_keys = ON');

        console.log('✅ tables 表结构更新成功!');
        console.log('   - 添加了 table_name 字段 (VARCHAR(100))');
        console.log('   - 添加了 capacity 字段 (INTEGER, 默认值: 4)');
        console.log('   - 已为现有数据设置默认的 table_name');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    } else {
      console.log('✅ tables 表结构已是最新版本，无需更新');
    }

    // 显示更新后的表结构
    const newTableInfo = db.prepare(`PRAGMA table_info(tables)`).all();
    console.log('\n当前 tables 表结构:');
    newTableInfo.forEach(col => {
      console.log(`  - ${col.name}: ${col.type}${col.dflt_value ? ` (默认: ${col.dflt_value})` : ''}`);
    });

    // 显示示例数据
    const sampleData = db.prepare('SELECT * FROM tables LIMIT 3').all();
    console.log('\n示例数据:');
    console.log(sampleData);

  } catch (error) {
    console.error('❌ 更新失败:', error.message);
    console.error(error);
    throw error;
  } finally {
    db.close();
    process.exit(0);
  }
}

updateTablesSchema();
