const Database = require('better-sqlite3');
const db = new Database('coffee_ordering.db');

console.log('正在更新数据库表结构...\n');

try {
  // 1. 添加categories表的icon字段
  console.log('1. 检查categories.icon字段...');
  const catCols = db.prepare('PRAGMA table_info(categories)').all();
  const hasIcon = catCols.some(col => col.name === 'icon');
  
  if (!hasIcon) {
    console.log('   添加icon字段...');
    db.prepare('ALTER TABLE categories ADD COLUMN icon TEXT DEFAULT "🍽️"').run();
    console.log('   ✅ icon字段已添加');
  } else {
    console.log('   ✅ icon字段已存在');
  }

  // 2. 检查products表的image_url字段
  console.log('\n2. 检查products.image_url字段...');
  const prodCols = db.prepare('PRAGMA table_info(products)').all();
  const hasImage = prodCols.some(col => col.name === 'image');
  const hasImageUrl = prodCols.some(col => col.name === 'image_url');
  
  if (hasImage && !hasImageUrl) {
    console.log('   将image字段重命名为image_url...');
    // SQLite不支持重命名列,需要重建表
    db.exec(`
      PRAGMA foreign_keys = OFF;
      BEGIN TRANSACTION;
      
      -- 创建新表
      CREATE TABLE products_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        name_zh TEXT NOT NULL,
        name_my TEXT,
        name_en TEXT,
        description_zh TEXT,
        description_my TEXT,
        description_en TEXT,
        price REAL NOT NULL,
        image_url TEXT,
        is_available INTEGER DEFAULT 1,
        stock INTEGER DEFAULT 999,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );
      
      -- 复制数据
      INSERT INTO products_new 
        SELECT id, category_id, name_zh, name_my, name_en, 
               description_zh, description_my, description_en,
               price, image, is_available, stock, sort_order, 
               created_at, updated_at
        FROM products;
      
      -- 删除旧表
      DROP TABLE products;
      
      -- 重命名新表
      ALTER TABLE products_new RENAME TO products;
      
      COMMIT;
      PRAGMA foreign_keys = ON;
    `);
    console.log('   ✅ image字段已重命名为image_url');
  } else if (hasImageUrl) {
    console.log('   ✅ image_url字段已存在');
  } else {
    console.log('   添加image_url字段...');
    db.prepare('ALTER TABLE products ADD COLUMN image_url TEXT').run();
    console.log('   ✅ image_url字段已添加');
  }

  console.log('\n✅ 数据库更新完成!');
  
  // 显示更新后的表结构
  console.log('\n=== 更新后的Categories表结构 ===');
  const newCatCols = db.prepare('PRAGMA table_info(categories)').all();
  newCatCols.forEach(col => {
    console.log(`  ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? 'DEFAULT ' + col.dflt_value : ''}`);
  });
  
  console.log('\n=== 更新后的Products表结构 ===');
  const newProdCols = db.prepare('PRAGMA table_info(products)').all();
  newProdCols.forEach(col => {
    console.log(`  ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? 'DEFAULT ' + col.dflt_value : ''}`);
  });

} catch (error) {
  console.error('❌ 更新失败:', error.message);
  console.error(error);
} finally {
  db.close();
}
