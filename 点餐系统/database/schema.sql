-- 创建数据库
CREATE DATABASE IF NOT EXISTS coffee_ordering CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE coffee_ordering;

-- 桌台表
CREATE TABLE IF NOT EXISTS tables (
    id INT PRIMARY KEY AUTO_INCREMENT,
    table_number VARCHAR(20) UNIQUE NOT NULL COMMENT '桌号',
    qr_code VARCHAR(255) COMMENT '二维码路径',
    status ENUM('available', 'occupied') DEFAULT 'available' COMMENT '可用/占用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='桌台表';

-- 商品分类表
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name_zh VARCHAR(100) NOT NULL COMMENT '中文名称',
    name_my VARCHAR(100) COMMENT '缅甸语名称',
    name_en VARCHAR(100) COMMENT '英文名称',
    sort_order INT DEFAULT 0 COMMENT '排序',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类表';

-- 商品表
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    name_zh VARCHAR(100) NOT NULL COMMENT '中文名',
    name_my VARCHAR(100) COMMENT '缅甸语名',
    name_en VARCHAR(100) COMMENT '英文名',
    description_zh TEXT COMMENT '中文描述',
    description_my TEXT COMMENT '缅甸语描述',
    description_en TEXT COMMENT '英文描述',
    price DECIMAL(10,2) NOT NULL COMMENT '价格(MMK)',
    image VARCHAR(255) COMMENT '图片路径',
    is_available BOOLEAN DEFAULT TRUE COMMENT '是否可售',
    stock INT DEFAULT 999 COMMENT '库存',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 商品规格选项表
CREATE TABLE IF NOT EXISTS product_options (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    option_type ENUM('size', 'temperature', 'sweetness') NOT NULL COMMENT '规格类型',
    name_zh VARCHAR(50) NOT NULL COMMENT '中文名',
    name_my VARCHAR(50) COMMENT '缅甸语名',
    name_en VARCHAR(50) COMMENT '英文名',
    extra_price DECIMAL(10,2) DEFAULT 0 COMMENT '额外价格',
    is_default BOOLEAN DEFAULT FALSE COMMENT '是否默认选项',
    sort_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品规格选项表';

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '订单号',
    table_id INT NOT NULL COMMENT '桌台ID',
    table_number VARCHAR(20) NOT NULL COMMENT '桌号',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '总金额',
    status ENUM('pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '订单状态',
    payment_method VARCHAR(20) DEFAULT 'KPAY' COMMENT '支付方式',
    payment_status ENUM('pending', 'success', 'failed') DEFAULT 'pending' COMMENT '支付状态',
    kpay_transaction_id VARCHAR(100) COMMENT 'KPAY交易ID',
    remark TEXT COMMENT '备注',
    language VARCHAR(10) DEFAULT 'zh' COMMENT '下单语言',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    paid_at TIMESTAMP NULL COMMENT '支付时间',
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    FOREIGN KEY (table_id) REFERENCES tables(id),
    INDEX idx_order_no (order_no),
    INDEX idx_table_id (table_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 订单详情表
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL COMMENT '商品名称快照',
    quantity INT NOT NULL DEFAULT 1 COMMENT '数量',
    unit_price DECIMAL(10,2) NOT NULL COMMENT '单价',
    options JSON COMMENT '选择的规格(温度/甜度/大小)',
    subtotal DECIMAL(10,2) NOT NULL COMMENT '小计',
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单详情表';

-- 插入测试数据
INSERT INTO tables (table_number) VALUES 
('A01'), ('A02'), ('A03'), ('A04'), ('A05'),
('B01'), ('B02'), ('B03'), ('B04'), ('B05');

INSERT INTO categories (name_zh, name_my, name_en, sort_order) VALUES 
('咖啡', 'ကော်ဖီ', 'Coffee', 1),
('奶茶', 'လက်ဖက်ရည်', 'Milk Tea', 2),
('果汁', 'သစ်သီးဖျော်ရည်', 'Juice', 3),
('小食', 'စားစရာ', 'Snacks', 4);

INSERT INTO products (category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image, sort_order) VALUES 
(1, '美式咖啡', 'အမေရိကန်ကော်ဖီ', 'Americano', '经典美式咖啡', 'ရိုးရာအမေရိကန်ကော်ဖီ', 'Classic American Coffee', 3000, '/images/americano.jpg', 1),
(1, '拿铁咖啡', 'လက်တေးကော်ဖီ', 'Latte', '香浓拿铁', 'နို့ပါသောကော်ဖီ', 'Smooth Latte', 3500, '/images/latte.jpg', 2),
(1, '卡布奇诺', 'ကက်ပူချီနို', 'Cappuccino', '意式卡布奇诺', 'အီတလီကက်ပူချီနို', 'Italian Cappuccino', 3500, '/images/cappuccino.jpg', 3),
(2, '珍珠奶茶', 'ပုလဲလက်ဖက်ရည်', 'Bubble Tea', '经典珍珠奶茶', 'ရိုးရာပုလဲလက်ဖက်ရည်', 'Classic Bubble Milk Tea', 2500, '/images/bubble-tea.jpg', 1),
(2, '泰式奶茶', 'ထိုင်းလက်ဖက်ရည်', 'Thai Tea', '正宗泰式奶茶', 'ထိုင်းလက်ဖက်ရည်စစ်', 'Authentic Thai Tea', 2800, '/images/thai-tea.jpg', 2),
(3, '鲜榨橙汁', 'လိမ္မော်သီးဖျော်ရည်', 'Orange Juice', '新鲜橙汁', 'လတ်ဆတ်သောလိမ္မော်သီးဖျော်ရည်', 'Fresh Orange Juice', 2000, '/images/orange.jpg', 1),
(4, '芝士蛋糕', 'ချိစ်ကိတ်', 'Cheesecake', '纽约芝士蛋糕', 'နယူးယောက်ချိစ်ကိတ်', 'New York Cheesecake', 4000, '/images/cheesecake.jpg', 1);

-- 为咖啡添加规格选项
INSERT INTO product_options (product_id, option_type, name_zh, name_my, name_en, extra_price, is_default) VALUES 
-- 美式咖啡规格
(1, 'size', '小杯', 'သေးငယ်သော', 'Small', 0, TRUE),
(1, 'size', '中杯', 'အလတ်စား', 'Medium', 500, FALSE),
(1, 'size', '大杯', 'ကြီးမား', 'Large', 1000, FALSE),
(1, 'temperature', '热', 'ပူ', 'Hot', 0, TRUE),
(1, 'temperature', '冰', 'အေး', 'Iced', 0, FALSE),
-- 拿铁规格
(2, 'size', '小杯', 'သေးငယ်သော', 'Small', 0, TRUE),
(2, 'size', '中杯', 'အလတ်စား', 'Medium', 500, FALSE),
(2, 'size', '大杯', 'ကြီးမား', 'Large', 1000, FALSE),
(2, 'temperature', '热', 'ပူ', 'Hot', 0, TRUE),
(2, 'temperature', '冰', 'အေး', 'Iced', 0, FALSE),
-- 珍珠奶茶规格
(4, 'sweetness', '正常糖', 'ပုံမှန်ချို', 'Normal', 0, TRUE),
(4, 'sweetness', '少糖', 'နည်းနည်းချို', 'Less', 0, FALSE),
(4, 'sweetness', '半糖', 'တစ်ဝက်ချို', 'Half', 0, FALSE),
(4, 'sweetness', '无糖', 'ချိုမထည့်', 'No Sugar', 0, FALSE),
(4, 'temperature', '冰', 'အေး', 'Iced', 0, TRUE),
(4, 'temperature', '温', 'နွေး', 'Warm', 0, FALSE);
