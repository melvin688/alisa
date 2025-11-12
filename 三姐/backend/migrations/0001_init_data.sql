-- 表结构

-- admins
CREATE TABLE admins (
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

-- categories
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_zh TEXT NOT NULL,
    name_my TEXT,
    name_en TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
, icon TEXT DEFAULT "🍽️");

-- order_items
CREATE TABLE order_items (
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

-- orders
CREATE TABLE "orders" (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_no TEXT UNIQUE NOT NULL,
        table_id INTEGER, -- 改为可空
        table_number TEXT, -- 改为可空
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'preparing', 'completed', 'cancelled')),
        payment_method TEXT DEFAULT 'cash',
        payment_status TEXT DEFAULT 'unpaid' CHECK(payment_status IN ('unpaid', 'paid')),
        remark TEXT,
        language TEXT DEFAULT 'zh',
        is_printed INTEGER DEFAULT 0,
        device_id TEXT,
        service_type TEXT DEFAULT 'dine-in' CHECK(service_type IN ('dine-in', 'delivery', 'takeaway')),
        kpay_transaction_id TEXT,
        paid_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME
      );

-- payment_settings
CREATE TABLE payment_settings (
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

-- product_options
CREATE TABLE product_options (
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

-- products
CREATE TABLE "products" (
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

-- store_settings
CREATE TABLE store_settings (
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

-- system_settings
CREATE TABLE system_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT UNIQUE NOT NULL,
        setting_value TEXT,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

-- tables
CREATE TABLE "tables" (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_number VARCHAR(20) UNIQUE NOT NULL,
            table_name VARCHAR(100) DEFAULT '',
            capacity INTEGER DEFAULT 4,
            qr_code VARCHAR(255),
            status VARCHAR(20) DEFAULT 'available',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );

-- admins 数据
INSERT INTO admins (id, username, password, name, role, status, last_login_at, created_at, updated_at) VALUES (1, 'admin', '$2b$10$hadEX2bokhwsrw07tHHtruC/4yoVs81IiQ7vIRdYkDMhNuW9PDceO', '系统管理员', 'admin', 1, '2025-11-10 09:41:10', '2025-11-09 10:29:58', '2025-11-09 10:29:58');

-- categories 数据
INSERT INTO categories (id, name_zh, name_my, name_en, sort_order, is_active, created_at, icon) VALUES (48, '咖啡', NULL, 'Coffee', 1, 1, '2025-11-10 11:51:27', '☕');
INSERT INTO categories (id, name_zh, name_my, name_en, sort_order, is_active, created_at, icon) VALUES (49, '拿铁', NULL, 'Latte', 2, 1, '2025-11-10 11:51:27', '🥛');
INSERT INTO categories (id, name_zh, name_my, name_en, sort_order, is_active, created_at, icon) VALUES (50, '招牌', NULL, 'Signature', 3, 1, '2025-11-10 11:51:27', '⭐');
INSERT INTO categories (id, name_zh, name_my, name_en, sort_order, is_active, created_at, icon) VALUES (51, '特调', NULL, 'Special Coffee', 4, 1, '2025-11-10 11:51:27', '💎');
INSERT INTO categories (id, name_zh, name_my, name_en, sort_order, is_active, created_at, icon) VALUES (52, '奶茶', NULL, 'Milk Tea', 5, 1, '2025-11-10 11:51:27', '🧋');
INSERT INTO categories (id, name_zh, name_my, name_en, sort_order, is_active, created_at, icon) VALUES (53, '气泡', NULL, 'Sparkling', 6, 1, '2025-11-10 11:51:27', '✨');
INSERT INTO categories (id, name_zh, name_my, name_en, sort_order, is_active, created_at, icon) VALUES (54, '茶饮', NULL, 'Tea', 7, 1, '2025-11-10 11:51:27', '🍵');
INSERT INTO categories (id, name_zh, name_my, name_en, sort_order, is_active, created_at, icon) VALUES (55, '果汁', NULL, 'Juice', 8, 1, '2025-11-10 11:51:27', '🧃');
INSERT INTO categories (id, name_zh, name_my, name_en, sort_order, is_active, created_at, icon) VALUES (56, '饮品', NULL, 'Drink', 9, 1, '2025-11-10 11:51:27', '🥤');
INSERT INTO categories (id, name_zh, name_my, name_en, sort_order, is_active, created_at, icon) VALUES (57, '冰沙', NULL, 'Frappuccino', 10, 1, '2025-11-10 11:51:27', '🍦');
INSERT INTO categories (id, name_zh, name_my, name_en, sort_order, is_active, created_at, icon) VALUES (58, '蛋糕', '', 'cake', 10, 1, '2025-11-11 07:01:39', '🎂');

-- products 数据
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (52, 48, '浓缩咖啡', NULL, 'Espresso', NULL, NULL, NULL, 4000, '/uploads/浓缩咖啡_1762935154510.jpg', 1, 999, 0, '2025-11-10 11:51:27', '2025-11-10 11:51:27');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (53, 48, '美式咖啡', NULL, 'Americano', NULL, NULL, NULL, 7000, '/uploads/美式咖啡_1762935154518.jpg', 1, 999, 0, '2025-11-10 11:51:27', '2025-11-10 11:51:27');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (54, 48, '卡布奇诺', NULL, 'Cappuccino', NULL, NULL, NULL, 7000, '/uploads/卡布奇诺_1762935154524.jpg', 1, 999, 0, '2025-11-10 11:51:27', '2025-11-10 11:51:27');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (55, 48, '澳白', NULL, 'Flat White', NULL, NULL, NULL, 7500, '/uploads/澳白_1762935154531.png', 1, 999, 0, '2025-11-10 11:51:27', '2025-11-10 11:51:27');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (56, 48, '摩卡', NULL, 'Mocha', NULL, NULL, NULL, 7500, '/uploads/摩卡_1762935154538.png', 1, 999, 0, '2025-11-10 11:51:27', '2025-11-10 11:51:27');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (93, 49, '抹茶拿铁', NULL, 'Matcha Latte', NULL, NULL, NULL, 7500, '/uploads/抹茶拿铁_1762935154545.png', 1, 999, 0, '2025-11-10 12:17:25', '2025-11-10 12:17:25');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (94, 49, '焦糖拿铁', NULL, 'Caramel Latte', NULL, NULL, NULL, 7500, '/uploads/焦糖拿铁_1762935154552.png', 1, 999, 0, '2025-11-10 12:17:25', '2025-11-10 12:17:25');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (95, 49, '厚椰乳咖啡', NULL, 'Coconut Latte', NULL, NULL, NULL, 8500, '/uploads/厚椰乳咖啡_1762935154560.png', 1, 999, 0, '2025-11-10 12:17:25', '2025-11-10 12:17:25');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (96, 49, '燕麦拿铁', NULL, 'Oat Latte', NULL, NULL, NULL, 7500, '/uploads/燕麦拿铁_1762935154568.png', 1, 999, 0, '2025-11-10 12:17:25', '2025-11-10 12:17:25');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (97, 50, '维也纳咖啡', NULL, 'Vienna Coffee', NULL, NULL, NULL, 9500, '/uploads/维也纳咖啡_1762935154575.png', 1, 999, 0, '2025-11-10 12:30:09', '2025-11-10 12:30:09');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (98, 50, '提拉米苏咖啡', NULL, 'Tiramisu Coffee', NULL, NULL, NULL, 10000, '/uploads/提拉米苏咖啡_1762935154582.png', 1, 999, 0, '2025-11-10 12:30:09', '2025-11-10 12:30:09');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (99, 51, '苹果美式', NULL, 'Apple Americano', NULL, NULL, NULL, 8500, '/uploads/苹果美式_1762935154592.jpg', 1, 999, 0, '2025-11-10 12:39:02', '2025-11-10 12:39:02');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (100, 51, '橙子美式', NULL, 'Orange Americano', NULL, NULL, NULL, 8500, '/uploads/橙子美式_1762935154600.png', 1, 999, 0, '2025-11-10 12:39:02', '2025-11-10 12:39:02');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (101, 51, '柠檬美式', NULL, 'Lemon Americano', NULL, NULL, NULL, 8500, '/uploads/柠檬美式_1762935154609.jpg', 1, 999, 0, '2025-11-10 12:39:02', '2025-11-10 12:39:02');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (102, 51, '百香果美式', NULL, 'Passion Americano', NULL, NULL, NULL, 8500, '/uploads/百香果美式_1762935154617.png', 1, 999, 0, '2025-11-10 12:39:02', '2025-11-10 12:39:02');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (103, 51, '菠萝美式', NULL, 'Pineapple Americano', NULL, NULL, NULL, 8500, '/uploads/菠萝美式_1762935154625.png', 1, 999, 0, '2025-11-10 12:39:02', '2025-11-10 12:39:02');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (104, 51, '冰椰美式', NULL, 'Coconut Americano', NULL, NULL, NULL, 8500, '/uploads/冰椰美式_1762935154632.png', 1, 999, 0, '2025-11-10 12:39:02', '2025-11-10 12:39:02');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (105, 51, '气泡美式', NULL, 'Sparkling Americano', NULL, NULL, NULL, 8500, '/uploads/气泡美式_1762935154640.png', 1, 999, 0, '2025-11-10 12:39:02', '2025-11-10 12:39:02');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (106, 52, '黑糖珍珠奶茶', NULL, 'Brown Sugar Milk Tea', NULL, NULL, NULL, 8500, '/uploads/黑糖珍珠奶茶_1762935154647.png', 1, 999, 0, '2025-11-10 12:39:02', '2025-11-10 12:39:02');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (107, 52, '芋泥奶茶', NULL, 'Taro Milk Tea', NULL, NULL, NULL, 8500, '/uploads/芋泥奶茶_1762935154654.png', 1, 999, 0, '2025-11-10 12:39:02', '2025-11-10 12:39:02');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (108, 52, '奥利奥奶茶', NULL, 'Oreo Milk Tea', NULL, NULL, NULL, 8500, '/uploads/奥利奥奶茶_1762935154663.png', 1, 999, 0, '2025-11-10 12:39:02', '2025-11-10 12:39:02');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (109, 53, '桃子气泡水', NULL, 'Peach Sparkling Water', NULL, NULL, NULL, 8000, '/uploads/桃子气泡水_1762935154671.jpg', 1, 999, 0, '2025-11-10 12:39:02', '2025-11-10 12:39:02');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (110, 53, '草莓气泡水', NULL, 'Strawberry Sparkling Water', NULL, NULL, NULL, 8000, '/uploads/草莓气泡水_1762935154678.jpg', 1, 999, 0, '2025-11-10 12:39:02', '2025-11-10 12:39:02');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (111, 53, '橙汁气泡水', NULL, 'Orange Sparkling Water', NULL, NULL, NULL, 8000, '/uploads/橙汁气泡水_1762935154686.jpg', 1, 999, 0, '2025-11-10 12:39:02', '2025-11-10 12:39:02');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (112, 53, '百香果气泡水', NULL, 'Passion Sparkling Water', NULL, NULL, NULL, 8000, '/uploads/百香果气泡水_1762935154693.png', 1, 999, 0, '2025-11-10 12:39:02', '2025-11-10 12:39:02');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (113, 54, '泰茶', NULL, 'Thai Tea', NULL, NULL, NULL, 8500, '/uploads/泰茶_1762935154700.png', 1, 999, 0, '2025-11-10 12:39:03', '2025-11-10 12:39:03');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (114, 54, '柠檬红茶', NULL, 'Lemon Black Tea', NULL, NULL, NULL, 8000, '/uploads/柠檬红茶_1762935154707.png', 1, 999, 0, '2025-11-10 12:39:03', '2025-11-10 12:39:03');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (115, 54, '柠檬绿茶', NULL, 'Lemon Green Tea', NULL, NULL, NULL, 8000, '/uploads/柠檬绿茶_1762935154714.jpg', 1, 999, 0, '2025-11-10 12:39:03', '2025-11-10 12:39:03');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (116, 54, '蜂蜜柚子茶', NULL, 'Honey Citron Tea', NULL, NULL, NULL, 8500, '/uploads/蜂蜜柚子茶_1762935154720.png', 1, 999, 0, '2025-11-10 12:39:03', '2025-11-10 12:39:03');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (117, 54, '柠檬汁', NULL, 'Lemon Juice', NULL, NULL, NULL, 7000, '/uploads/柠檬汁_1762935154728.png', 1, 999, 0, '2025-11-10 12:39:03', '2025-11-10 12:39:03');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (118, 55, '西瓜汁', NULL, 'Watermelon Juice', NULL, NULL, NULL, 8500, '/uploads/西瓜汁_1762935154735.png', 1, 999, 0, '2025-11-10 12:39:03', '2025-11-10 12:39:03');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (119, 55, '橙子汁', NULL, 'Orange Juice', NULL, NULL, NULL, 8500, '/uploads/橙子汁_1762935154742.jpg', 1, 999, 0, '2025-11-10 12:39:03', '2025-11-10 12:39:03');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (120, 55, '当季水果汁', NULL, 'Seasonal Fruit Juice', NULL, NULL, NULL, 8500, '/uploads/当季水果汁_1762935154749.jpg', 1, 999, 0, '2025-11-10 12:39:03', '2025-11-10 12:39:03');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (121, 56, '杨枝甘露', NULL, 'Mango Grapefruit Sago', NULL, NULL, NULL, 8500, '/uploads/杨枝甘露_1762935154756.png', 1, 999, 0, '2025-11-10 12:39:03', '2025-11-10 12:39:03');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (122, 56, '热牛奶', NULL, 'Hot Milk', NULL, NULL, NULL, 5000, '/uploads/热牛奶_1762935154763.jpg', 1, 999, 0, '2025-11-10 12:39:03', '2025-11-10 12:39:03');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (123, 56, '巧克力', NULL, 'Chocolate', NULL, NULL, NULL, 6000, '/uploads/巧克力_1762935154770.png', 1, 999, 0, '2025-11-10 12:39:03', '2025-11-10 12:39:03');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (124, 57, '巧克力星冰乐', NULL, 'Chocolate Frappuccino', NULL, NULL, NULL, 9500, '/uploads/巧克力星冰乐_1762935154776.jpg', 1, 999, 0, '2025-11-10 12:39:03', '2025-11-10 12:39:03');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (125, 57, '草莓星冰乐', NULL, 'Strawberry Frappuccino', NULL, NULL, NULL, 9500, '/uploads/草莓星冰乐_1762935154784.jpg', 1, 999, 0, '2025-11-10 12:39:03', '2025-11-10 12:39:03');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (126, 57, '抹茶星冰乐', NULL, 'Matcha Frappuccino', NULL, NULL, NULL, 9500, '/uploads/抹茶星冰乐_1762935154792.jpg', 1, 999, 0, '2025-11-10 12:39:03', '2025-11-10 12:39:03');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (128, 58, '青提蛋糕', '', 'Green Grape Cake', '', '', '', 25000, '/uploads/å¾ç_20251110161952_7_177-1762935791431-409089776.jpg', 1, 999, 10, '2025-11-11 07:20:44', '2025-11-11 07:20:44');
INSERT INTO products (id, category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, stock, sort_order, created_at, updated_at) VALUES (129, 58, '芒果蛋糕', '', '', '', '', '', 20000, '/uploads/å¾ç_20251110161955_8_177-1762935826112-750424609.jpg', 1, 999, 0, '2025-11-12 08:24:01', '2025-11-12 08:24:01');

-- product_options 数据
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (173, 93, 'temperature', '热', NULL, 'Hot', 0, 1, 0);
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (174, 93, 'temperature', '冰', NULL, 'Iced', 1000, 0, 0);
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (175, 94, 'temperature', '热', NULL, 'Hot', 0, 1, 0);
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (176, 94, 'temperature', '冰', NULL, 'Iced', 1000, 0, 0);
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (177, 95, 'temperature', '热', NULL, 'Hot', 0, 1, 0);
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (178, 95, 'temperature', '冰', NULL, 'Iced', 500, 0, 0);
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (179, 96, 'temperature', '热', NULL, 'Hot', 0, 1, 0);
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (180, 96, 'temperature', '冰', NULL, 'Iced', 1000, 0, 0);
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (187, 54, 'temperature', '热', NULL, 'Hot', 0, 1, 0);
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (188, 54, 'temperature', '冰', NULL, 'Iced', 1000, 0, 0);
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (189, 53, 'temperature', '热', NULL, 'Hot', 0, 1, 0);
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (190, 53, 'temperature', '冰', NULL, 'Iced', 1000, 0, 0);
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (191, 56, 'temperature', '热', NULL, 'Hot', 0, 1, 0);
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (192, 56, 'temperature', '冰', NULL, 'Iced', 500, 0, 0);
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (193, 106, 'sweetness', '正常糖', NULL, 'Normal Sugar', 0, 1, 0);
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (194, 106, 'sweetness', '半糖', NULL, 'Half Sugar', 0, 0, 0);
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (195, 106, 'sweetness', '少糖', NULL, 'Less Sugar', 0, 0, 0);
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (196, 107, 'sweetness', '正常糖', NULL, 'Normal Sugar', 0, 1, 0);
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (197, 107, 'sweetness', '半糖', NULL, 'Half Sugar', 0, 0, 0);
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (198, 107, 'sweetness', '少糖', NULL, 'Less Sugar', 0, 0, 0);
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (199, 108, 'sweetness', '正常糖', NULL, 'Normal Sugar', 0, 1, 0);
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (200, 108, 'sweetness', '半糖', NULL, 'Half Sugar', 0, 0, 0);
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (201, 108, 'sweetness', '少糖', NULL, 'Less Sugar', 0, 0, 0);
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (202, 122, 'temperature', '热', NULL, 'Hot', 0, 1, 0);
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (203, 122, 'temperature', '冰', NULL, 'Iced', 1000, 0, 0);
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (204, 123, 'temperature', '热', NULL, 'Hot', 0, 1, 0);
INSERT INTO product_options (id, product_id, option_type, name_zh, name_my, name_en, extra_price, is_default, sort_order) VALUES (205, 123, 'temperature', '冰', NULL, 'Iced', 1000, 0, 0);

-- tables 数据
INSERT INTO tables (id, table_number, table_name, capacity, qr_code, status, created_at, updated_at) VALUES (11, 'A1', 'A1号桌', 4, 'http://localhost:5173/?table=A1', 'occupied', '2025-11-10 12:06:04', '2025-11-10 12:06:04');
INSERT INTO tables (id, table_number, table_name, capacity, qr_code, status, created_at, updated_at) VALUES (12, 'A2', 'A2号桌', 4, NULL, 'occupied', '2025-11-10 12:06:04', '2025-11-10 12:06:04');
INSERT INTO tables (id, table_number, table_name, capacity, qr_code, status, created_at, updated_at) VALUES (13, 'A3', 'A3号桌', 4, NULL, 'occupied', '2025-11-10 12:06:04', '2025-11-10 12:06:04');
INSERT INTO tables (id, table_number, table_name, capacity, qr_code, status, created_at, updated_at) VALUES (14, 'A4', 'A4号桌', 4, NULL, 'occupied', '2025-11-10 12:06:04', '2025-11-10 12:06:04');
INSERT INTO tables (id, table_number, table_name, capacity, qr_code, status, created_at, updated_at) VALUES (15, 'A5', 'A5号桌', 4, NULL, 'available', '2025-11-10 12:06:04', '2025-11-10 12:06:04');
INSERT INTO tables (id, table_number, table_name, capacity, qr_code, status, created_at, updated_at) VALUES (16, 'B1', 'B1号桌', 4, NULL, 'occupied', '2025-11-10 12:06:04', '2025-11-10 12:06:04');

-- orders 数据
INSERT INTO orders (id, order_no, table_id, table_number, total_amount, status, payment_method, payment_status, remark, language, is_printed, device_id, service_type, kpay_transaction_id, paid_at, created_at, completed_at) VALUES (9, 'ORD20251110205841446', 11, 'A1', 0, 'cancelled', 'KPAY', 'unpaid', '', 'zh', 0, NULL, 'dine-in', NULL, NULL, '2025-11-10 13:58:41', NULL);
INSERT INTO orders (id, order_no, table_id, table_number, total_amount, status, payment_method, payment_status, remark, language, is_printed, device_id, service_type, kpay_transaction_id, paid_at, created_at, completed_at) VALUES (10, 'ORD20251110205856287', 12, 'A2', 0, 'cancelled', 'KPAY', 'unpaid', '', 'zh', 0, NULL, 'dine-in', NULL, NULL, '2025-11-10 13:58:56', NULL);
INSERT INTO orders (id, order_no, table_id, table_number, total_amount, status, payment_method, payment_status, remark, language, is_printed, device_id, service_type, kpay_transaction_id, paid_at, created_at, completed_at) VALUES (11, 'ORD20251110211210565', 11, 'A1', 0, 'cancelled', 'KPAY', 'unpaid', '', 'zh', 0, NULL, 'dine-in', NULL, NULL, '2025-11-10 14:12:10', NULL);
INSERT INTO orders (id, order_no, table_id, table_number, total_amount, status, payment_method, payment_status, remark, language, is_printed, device_id, service_type, kpay_transaction_id, paid_at, created_at, completed_at) VALUES (12, 'ORD20251110211229467', 11, 'A1', 0, 'cancelled', 'KPAY', 'unpaid', '', 'zh', 0, NULL, 'dine-in', NULL, NULL, '2025-11-10 14:12:29', NULL);
INSERT INTO orders (id, order_no, table_id, table_number, total_amount, status, payment_method, payment_status, remark, language, is_printed, device_id, service_type, kpay_transaction_id, paid_at, created_at, completed_at) VALUES (13, 'ORD20251110222416105', 11, 'A1', 0, 'cancelled', 'KPAY', 'unpaid', '', 'zh', 0, NULL, 'dine-in', NULL, NULL, '2025-11-10 15:24:16', NULL);
INSERT INTO orders (id, order_no, table_id, table_number, total_amount, status, payment_method, payment_status, remark, language, is_printed, device_id, service_type, kpay_transaction_id, paid_at, created_at, completed_at) VALUES (14, 'ORD20251110223223910', 11, 'A1', 0, 'cancelled', 'KPAY', 'unpaid', '', 'zh', 0, NULL, 'dine-in', NULL, NULL, '2025-11-10 15:32:23', NULL);
INSERT INTO orders (id, order_no, table_id, table_number, total_amount, status, payment_method, payment_status, remark, language, is_printed, device_id, service_type, kpay_transaction_id, paid_at, created_at, completed_at) VALUES (15, 'ORD20251110223251691', 13, 'A3', 0, 'cancelled', 'KPAY', 'unpaid', '', 'zh', 0, NULL, 'dine-in', NULL, NULL, '2025-11-10 15:32:51', NULL);
INSERT INTO orders (id, order_no, table_id, table_number, total_amount, status, payment_method, payment_status, remark, language, is_printed, device_id, service_type, kpay_transaction_id, paid_at, created_at, completed_at) VALUES (36, 'ORD2025111212403025586', 12, 'A2', 9500, 'completed', 'cash', 'unpaid', '', 'zh', 1, 'device_1762849729676_dtxejdk1s', 'dine-in', NULL, NULL, '2025-11-12 12:40:30', '2025-11-12 12:40:42');
INSERT INTO orders (id, order_no, table_id, table_number, total_amount, status, payment_method, payment_status, remark, language, is_printed, device_id, service_type, kpay_transaction_id, paid_at, created_at, completed_at) VALUES (37, 'ORD2025111212480328275', 12, 'A2', 8000, 'completed', 'cash', 'unpaid', '', 'zh', 1, 'device_1762849729676_dtxejdk1s', 'dine-in', NULL, NULL, '2025-11-12 12:48:03', '2025-11-12 12:48:14');
INSERT INTO orders (id, order_no, table_id, table_number, total_amount, status, payment_method, payment_status, remark, language, is_printed, device_id, service_type, kpay_transaction_id, paid_at, created_at, completed_at) VALUES (38, 'ORD2025111212511056211', 12, 'A2', 34500, 'completed', 'cash', 'unpaid', '', 'zh', 1, 'device_1762849729676_dtxejdk1s', 'dine-in', NULL, NULL, '2025-11-12 12:51:10', '2025-11-12 12:53:39');
INSERT INTO orders (id, order_no, table_id, table_number, total_amount, status, payment_method, payment_status, remark, language, is_printed, device_id, service_type, kpay_transaction_id, paid_at, created_at, completed_at) VALUES (39, 'ORD2025111212513425040', NULL, 'delivery', 8000, 'completed', 'cash', 'unpaid', '123', 'zh', 0, 'device_1762849729676_dtxejdk1s', 'delivery', NULL, NULL, '2025-11-12 12:51:34', '2025-11-12 12:53:59');
INSERT INTO orders (id, order_no, table_id, table_number, total_amount, status, payment_method, payment_status, remark, language, is_printed, device_id, service_type, kpay_transaction_id, paid_at, created_at, completed_at) VALUES (40, 'ORD2025111212520431591', NULL, 'takeaway', 15500, 'cancelled', 'cash', 'unpaid', '123', 'en', 0, 'device_1762849729676_dtxejdk1s', 'takeaway', NULL, NULL, '2025-11-12 12:52:04', '2025-11-12 12:54:07');

-- order_items 数据
INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, options, subtotal) VALUES (39, 36, 97, '维也纳咖啡', 1, 9500, '{}', 9500);
INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, options, subtotal) VALUES (40, 37, 53, '美式咖啡', 1, 8000, '{"temperature":190}', 8000);
INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, options, subtotal) VALUES (41, 38, 97, '维也纳咖啡', 1, 9500, '{}', 9500);
INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, options, subtotal) VALUES (42, 38, 128, '青提蛋糕', 1, 25000, '{}', 25000);
INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, options, subtotal) VALUES (43, 39, 53, '美式咖啡', 1, 8000, '{"temperature":190}', 8000);
INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, options, subtotal) VALUES (44, 40, 113, 'Thai Tea', 1, 8500, '{}', 8500);
INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, options, subtotal) VALUES (45, 40, 123, 'Chocolate', 1, 7000, '{"temperature":205}', 7000);

-- store_settings 数据
INSERT INTO store_settings (id, store_name, store_name_my, store_name_en, logo, address, phone, business_hours, description, created_at, updated_at) VALUES (1, '咖啡店', 'ကော်ဖီဆိုင်', 'Coffee Shop', NULL, '缅甸仰光', '+95-xxx-xxxx', '{"monday":"09:00-22:00","tuesday":"09:00-22:00","wednesday":"09:00-22:00","thursday":"09:00-22:00","friday":"09:00-22:00","saturday":"09:00-23:00","sunday":"09:00-23:00"}', '欢迎光临', '2025-11-09 10:29:58', '2025-11-09 10:29:58');

-- payment_settings 数据
INSERT INTO payment_settings (id, payment_method, merchant_id, api_key, api_secret, callback_url, is_enabled, is_test_mode, config, created_at, updated_at) VALUES (1, 'kpay', 'test_merchant', NULL, NULL, NULL, 1, 1, NULL, '2025-11-09 10:29:58', '2025-11-09 10:29:58');

-- system_settings 数据
INSERT INTO system_settings (id, setting_key, setting_value, description, updated_at) VALUES (1, 'kbzpay_qr_code', '', 'KBZPay收款二维码图片URL', '2025-11-10 14:38:41');
INSERT INTO system_settings (id, setting_key, setting_value, description, updated_at) VALUES (2, 'kbzpay_account_name', 'Nu Nu Khaung(******0500)', 'KBZPay收款账户名称', '2025-11-10 14:38:41');
