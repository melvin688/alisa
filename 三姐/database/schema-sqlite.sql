-- SQLite版本数据库结构 (适用于本地开发和小规模部署)

-- 桌台表
CREATE TABLE IF NOT EXISTS tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_number TEXT UNIQUE NOT NULL, -- 桌号
    qr_code TEXT, -- 二维码路径
    status TEXT DEFAULT 'available' CHECK(status IN ('available', 'occupied')), -- 可用/占用
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 商品分类表
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_zh TEXT NOT NULL, -- 中文名称
    name_my TEXT, -- 缅甸语名称
    name_en TEXT, -- 英文名称
    sort_order INTEGER DEFAULT 0, -- 排序
    is_active INTEGER DEFAULT 1, -- 是否启用
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 商品表
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name_zh TEXT NOT NULL, -- 中文名
    name_my TEXT, -- 缅甸语名
    name_en TEXT, -- 英文名
    description_zh TEXT, -- 中文描述
    description_my TEXT, -- 缅甸语描述
    description_en TEXT, -- 英文描述
    price REAL NOT NULL, -- 价格(MMK)
    image TEXT, -- 图片路径
    is_available INTEGER DEFAULT 1, -- 是否可售
    stock INTEGER DEFAULT 999, -- 库存
    sort_order INTEGER DEFAULT 0, -- 排序
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 商品规格选项表
CREATE TABLE IF NOT EXISTS product_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    option_type TEXT NOT NULL CHECK(option_type IN ('size', 'temperature', 'sweetness')), -- 规格类型
    name_zh TEXT NOT NULL, -- 中文名
    name_my TEXT, -- 缅甸语名
    name_en TEXT, -- 英文名
    extra_price REAL DEFAULT 0, -- 额外价格
    is_default INTEGER DEFAULT 0, -- 是否默认选项
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 订单表 (简化版 - 现金结账,无在线支付)
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no TEXT UNIQUE NOT NULL, -- 订单号
    table_id INTEGER NOT NULL, -- 桌台ID
    table_number TEXT NOT NULL, -- 桌号
    total_amount REAL NOT NULL, -- 总金额(MMK)
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'preparing', 'completed', 'cancelled')), -- 订单状态
    payment_method TEXT DEFAULT 'CASH', -- 支付方式:CASH现金/KPAY
    payment_status TEXT DEFAULT 'unpaid' CHECK(payment_status IN ('unpaid', 'paid')), -- 支付状态
    remark TEXT, -- 备注
    language TEXT DEFAULT 'zh', -- 下单语言:zh/my/en
    is_printed INTEGER DEFAULT 0, -- 是否已打印
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 创建时间
    completed_at DATETIME, -- 完成时间
    FOREIGN KEY (table_id) REFERENCES tables(id)
);

-- 订单详情表
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL, -- 商品名称快照
    quantity INTEGER NOT NULL DEFAULT 1, -- 数量
    unit_price REAL NOT NULL, -- 单价
    options TEXT, -- 选择的规格(JSON格式)
    subtotal REAL NOT NULL, -- 小计
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- bcrypt加密
    name TEXT,
    role TEXT DEFAULT 'admin',
    status INTEGER DEFAULT 1,
    last_login_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- 插入测试数据
INSERT OR IGNORE INTO tables (table_number) VALUES 
('A01'), ('A02'), ('A03'), ('A04'), ('A05'),
('B01'), ('B02'), ('B03'), ('B04'), ('B05');

INSERT OR IGNORE INTO categories (name_zh, name_my, name_en, sort_order) VALUES 
('饮品', 'အချိုရည်', 'Drinks', 1),
('主食', 'အစားအစာ', 'Food', 2),
('甜点', 'အချိုပွဲ', 'Desserts', 3);

-- 插入示例商品 (根据图片中的菜单)
INSERT OR IGNORE INTO products (category_id, name_zh, name_my, name_en, price, image, sort_order) VALUES 
(1, '百香果气泡水', 'Passion Sparking Water', 'Passion Sparking Water', 5000, '/uploads/passion-sparking.jpg', 1),
(1, '草莓星冰乐', 'Strawberry Frappuccino', 'Strawberry Frappuccino', 8500, '/uploads/strawberry-frap.jpg', 2),
(1, '芋泥奶茶', 'Taro Milk Tea', 'Taro Milk Tea', 8500, '/uploads/taro-milk-tea.jpg', 3),
(1, '桃子气泡水', 'Peach Sparking Water', 'Peach Sparking Water', 5000, '/uploads/peach-sparking.jpg', 4),
(1, '桃子提拉米苏', 'Peach Tiramisu', 'Peach Tiramisu', 8500, '/uploads/peach-tiramisu.jpg', 5),
(2, '香辣热狗', 'Spicy Hotdog', 'Spicy Hotdog', 5000, '/uploads/spicy-hotdog.jpg', 1),
(2, '三明治', 'Sandwich', 'Sandwich', 6000, '/uploads/sandwich.jpg', 2),
(2, '芋肉松蛋糕', 'Taro Meat Floss Cake', 'Taro Meat Floss Cake', 7000, '/uploads/taro-cake.jpg', 3),
(3, '草莓麻薯', 'Strawberry Mochi', 'Strawberry Mochi', 6000, '/uploads/strawberry-mochi.jpg', 1),
(3, '芋泥麻薯', 'Taro Mochi', 'Taro Mochi', 6000, '/uploads/taro-mochi.jpg', 2);

-- 为饮品添加规格选项
INSERT OR IGNORE INTO product_options (product_id, option_type, name_zh, name_my, name_en, extra_price, is_default) VALUES 
-- 温度选项
(1, 'temperature', '冰', 'အေး', 'Iced', 0, 1),
(1, 'temperature', '常温', 'ပုံမှန်', 'Normal', 0, 0),
(2, 'temperature', '冰', 'အေး', 'Iced', 0, 1),
(3, 'temperature', '冰', 'အေး', 'Iced', 0, 1),
(3, 'temperature', '热', 'ပူ', 'Hot', 0, 0),
-- 甜度选项
(2, 'sweetness', '正常糖', 'ပုံမှန်ချို', 'Normal', 0, 1),
(2, 'sweetness', '少糖', 'နည်းနည်းချို', 'Less', 0, 0),
(2, 'sweetness', '半糖', 'တစ်ဝက်ချို', 'Half', 0, 0),
(3, 'sweetness', '正常糖', 'ပုံမှန်ချို', 'Normal', 0, 1),
(3, 'sweetness', '少糖', 'နည်းနည်းချို', 'Less', 0, 0);

-- 插入默认管理员 (用户名: admin, 密码: admin123)
-- 密码hash需要在初始化脚本中生成
INSERT OR IGNORE INTO admins (id, username, password, name, role) 
VALUES (1, 'admin', '$2b$10$placeholder', '管理员', 'admin');
