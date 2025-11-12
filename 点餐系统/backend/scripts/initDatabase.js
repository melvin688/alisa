const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'coffee_ordering.db');
const db = new Database(dbPath);

console.log('初始化 SQLite 数据库...');

// 创建表结构
db.exec(`
-- 桌台表
CREATE TABLE IF NOT EXISTS tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_number TEXT UNIQUE NOT NULL,
    qr_code TEXT,
    status TEXT DEFAULT 'available',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 商品分类表
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_zh TEXT NOT NULL,
    name_my TEXT,
    name_en TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 商品表
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name_zh TEXT NOT NULL,
    name_my TEXT,
    name_en TEXT,
    description_zh TEXT,
    description_my TEXT,
    description_en TEXT,
    price REAL NOT NULL,
    image TEXT,
    is_available INTEGER DEFAULT 1,
    stock INTEGER DEFAULT 999,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 商品规格选项表
CREATE TABLE IF NOT EXISTS product_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    option_type TEXT NOT NULL,
    name_zh TEXT NOT NULL,
    name_my TEXT,
    name_en TEXT,
    extra_price REAL DEFAULT 0,
    is_default INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no TEXT UNIQUE NOT NULL,
    table_id INTEGER NOT NULL,
    table_number TEXT NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT DEFAULT 'KPAY',
    payment_status TEXT DEFAULT 'pending',
    kpay_transaction_id TEXT,
    remark TEXT,
    language TEXT DEFAULT 'zh',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    paid_at DATETIME,
    completed_at DATETIME,
    FOREIGN KEY (table_id) REFERENCES tables(id)
);

-- 订单详情表
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price REAL NOT NULL,
    options TEXT,
    subtotal REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
`);

console.log('✅ 表结构创建完成');

// 检查是否已有数据
const tablesCount = db.prepare('SELECT COUNT(*) as count FROM tables').get();

if (tablesCount.count === 0) {
  console.log('插入测试数据...');
  
  // 插入桌台
  const insertTable = db.prepare('INSERT INTO tables (table_number) VALUES (?)');
  ['A01', 'A02', 'A03', 'A04', 'A05', 'B01', 'B02', 'B03', 'B04', 'B05'].forEach(table => {
    insertTable.run(table);
  });
  
  // 插入分类
  const insertCategory = db.prepare('INSERT INTO categories (name_zh, name_my, name_en, sort_order) VALUES (?, ?, ?, ?)');
  insertCategory.run('咖啡', 'ကော်ဖီ', 'Coffee', 1);
  insertCategory.run('奶茶', 'လက်ဖက်ရည်', 'Milk Tea', 2);
  insertCategory.run('果汁', 'သစ်သီးဖျော်ရည်', 'Juice', 3);
  insertCategory.run('小食', 'စားစရာ', 'Snacks', 4);
  
  // 插入商品
  const insertProduct = db.prepare(`
    INSERT INTO products (category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertProduct.run(1, '美式咖啡', 'အမေရိကန်ကော်ဖီ', 'Americano', '经典美式咖啡', 'ရိုးရာအမေရိကန်ကော်ဖီ', 'Classic American Coffee', 3000, '/images/americano.jpg', 1);
  insertProduct.run(1, '拿铁咖啡', 'လက်တေးကော်ဖီ', 'Latte', '香浓拿铁', 'နို့ပါသောကော်ဖီ', 'Smooth Latte', 3500, '/images/latte.jpg', 2);
  insertProduct.run(1, '卡布奇诺', 'ကက်ပူချီနို', 'Cappuccino', '意式卡布奇诺', 'အီတလီကက်ပူချီနို', 'Italian Cappuccino', 3500, '/images/cappuccino.jpg', 3);
  insertProduct.run(2, '珍珠奶茶', 'ပုလဲလက်ဖက်ရည်', 'Bubble Tea', '经典珍珠奶茶', 'ရိုးရာပုလဲလက်ဖက်ရည်', 'Classic Bubble Milk Tea', 2500, '/images/bubble-tea.jpg', 1);
  insertProduct.run(2, '泰式奶茶', 'ထိုင်းလက်ဖက်ရည်', 'Thai Tea', '正宗泰式奶茶', 'ထိုင်းလက်ဖက်ရည်စစ်', 'Authentic Thai Tea', 2800, '/images/thai-tea.jpg', 2);
  insertProduct.run(3, '鲜榨橙汁', 'လိမ္မော်သီးဖျော်ရည်', 'Orange Juice', '新鲜橙汁', 'လတ်ဆတ်သောလိမ္မော်သီးဖျော်ရည်', 'Fresh Orange Juice', 2000, '/images/orange.jpg', 1);
  insertProduct.run(4, '芝士蛋糕', 'ချိစ်ကိတ်', 'Cheesecake', '纽约芝士蛋糕', 'နယူးယောက်ချိစ်ကိတ်', 'New York Cheesecake', 4000, '/images/cheesecake.jpg', 1);
  
  // 插入商品规格
  const insertOption = db.prepare(`
    INSERT INTO product_options (product_id, option_type, name_zh, name_my, name_en, extra_price, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  // 美式咖啡规格
  insertOption.run(1, 'size', '小杯', 'သေးငယ်သော', 'Small', 0, 1);
  insertOption.run(1, 'size', '中杯', 'အလတ်စား', 'Medium', 500, 0);
  insertOption.run(1, 'size', '大杯', 'ကြီးမား', 'Large', 1000, 0);
  insertOption.run(1, 'temperature', '热', 'ပူ', 'Hot', 0, 1);
  insertOption.run(1, 'temperature', '冰', 'အေး', 'Iced', 0, 0);
  
  // 拿铁规格
  insertOption.run(2, 'size', '小杯', 'သေးငယ်သော', 'Small', 0, 1);
  insertOption.run(2, 'size', '中杯', 'အလတ်စား', 'Medium', 500, 0);
  insertOption.run(2, 'size', '大杯', 'ကြီးမား', 'Large', 1000, 0);
  insertOption.run(2, 'temperature', '热', 'ပူ', 'Hot', 0, 1);
  insertOption.run(2, 'temperature', '冰', 'အေး', 'Iced', 0, 0);
  
  // 珍珠奶茶规格
  insertOption.run(4, 'sweetness', '正常糖', 'ပုံမှန်ချို', 'Normal', 0, 1);
  insertOption.run(4, 'sweetness', '少糖', 'နည်းနည်းချို', 'Less', 0, 0);
  insertOption.run(4, 'sweetness', '半糖', 'တစ်ဝက်ချို', 'Half', 0, 0);
  insertOption.run(4, 'sweetness', '无糖', 'ချိုမထည့်', 'No Sugar', 0, 0);
  insertOption.run(4, 'temperature', '冰', 'အေး', 'Iced', 0, 1);
  insertOption.run(4, 'temperature', '温', 'နွေး', 'Warm', 0, 0);
  
  console.log('✅ 测试数据插入完成');
}

db.close();
console.log('✅ 数据库初始化完成！');
